/**
 * THE OVERGROWN BASTION — Movie Recommendation & Discovery Engine
 * ==========================================================================
 * Pure backend/logic engine powered by the TMDB API v3.
 * Bypasses the "Popular Movie Trap" (no /movie/popular, no /trending) via a
 * hybrid of Attribute-Based Discovery (/discover/movie) and Seed-Based
 * Collaborative Filtering (/movie/{id}/recommendations + /similar).
 *
 * Pipeline:  A) Interest → Keyword resolution
 *            B) Obscurity & catalog-depth calibration
 *            C) Multi-page deep fetch + seed merging (concurrent)
 *            D) Custom weighted scoring, dedup & novelty jitter
 *
 * Zero UI dependencies. Works in browser (window.MovieRecommendationEngine)
 * and in Node/CommonJS (module.exports). Fetch function is injectable for
 * testability.
 */

(function (global) {
  'use strict';

  // ------------------------------------------------------------------------
  // TMDB GENRE MAP (movie)
  // ------------------------------------------------------------------------
  var TMDB_GENRES = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };

  var LANGUAGE_NAMES = {
    en: 'English', ko: 'Korean', ja: 'Japanese', hi: 'Hindi', fr: 'French',
    es: 'Spanish', de: 'German', it: 'Italian', zh: 'Chinese', sv: 'Swedish',
    da: 'Danish', no: 'Norwegian', pl: 'Polish', pt: 'Portuguese', tr: 'Turkish',
    ru: 'Russian', ar: 'Arabic', th: 'Thai', fa: 'Persian', he: 'Hebrew'
  };

  // ------------------------------------------------------------------------
  // OBSCURITY TIER CALIBRATION (Step B)
  // vote_count.lte ceilings force TMDB to surface non-mainstream films.
  // ------------------------------------------------------------------------
  var OBSURITY_TIERS = {
    mainstream:   { label: 'Mainstream',   'vote_count.gte': 2500, 'vote_count.lte': null,  'vote_average.gte': 6.5, mPrior: 2500, band: [2500, Infinity] },
    cult_classic: { label: 'Cult Classic', 'vote_count.gte': 400,  'vote_count.lte': 2500,  'vote_average.gte': 7.0, mPrior: 400,  band: [400, 2500] },
    hidden_gem:   { label: 'Hidden Gem',   'vote_count.gte': 50,   'vote_count.lte': 400,   'vote_average.gte': 7.2, mPrior: 50,   band: [50, 400] },
    deep_cut:     { label: 'Deep Cut',     'vote_count.gte': 15,   'vote_count.lte': 80,    'vote_average.gte': 7.4, mPrior: 15,   band: [15, 80] }
  };

  // Global rating prior for the Bayesian weighted-rating formula (Step D)
  var C_GLOBAL = 6.9;

  // ------------------------------------------------------------------------
  // DEFAULT USER TASTE PROFILE SCHEMA
  // ------------------------------------------------------------------------
  var DEFAULT_PROFILE = {
    includedGenres: [],          // TMDB genre IDs (comma = AND on discover)
    excludedGenres: [],          // strictly filtered out
    interestKeywords: [],        // free-text tropes, e.g. 'time loop'
    seedMovieIds: [],            // 1-5 movies the user loves
    obscurityTier: 'hidden_gem', // 'mainstream' | 'cult_classic' | 'hidden_gem' | 'deep_cut'
    languages: [],               // ISO 639-1 codes, e.g. ['en','ko']
    releaseYearRange: { minYear: 1960, maxYear: new Date().getFullYear() },
    minRating: 6.5               // vote_average.gte floor
  };

  // ------------------------------------------------------------------------
  // ENGINE
  // ------------------------------------------------------------------------
  function MovieRecommendationEngine(options) {
    options = options || {};
    this.apiKey = options.apiKey || (global.localStorage && global.localStorage.getItem('tmdb_api_key')) || '';
    this.language = options.language || 'en-US';
    this.baseUrl = options.baseUrl || 'https://api.themoviedb.org/3';
    this.fetchFn = options.fetchFn || (global.fetch ? global.fetch.bind(global) : null);
    this.noveltyJitter = options.noveltyJitter != null ? options.noveltyJitter : 0.05; // ±5%
    this.adultFilterKeyword = options.adultFilterKeyword || '210024'; // TMDB spam/adult filter keyword

    // RELAY CHAIN — many ISPs (notably in India) block themoviedb.org at the
    // network level. When a direct request fails at the transport layer, the
    // engine automatically retries through public CORS relays, in order.
    // {url} is replaced with the percent-encoded target; {url-raw} with the
    // plain target URL. Relays that fail or rate-limit are skipped, and the
    // first working relay is remembered for subsequent requests.
    // Set options.relays = [] or options.relayEnabled = false to disable.
    this.relays = options.relays || [
      'https://api.cors.lol/?url={url}',
      'https://api.allorigins.win/raw?url={url}',
      'https://r.jina.ai/{url-raw}'
    ];
    if (options.relayEnabled === false) this.relays = [];
    // 'auto' until the first transport failure reveals a working route
    this._route = { type: 'auto' };
  }

  MovieRecommendationEngine.prototype.setApiKey = function (key) {
    this.apiKey = key;
    try { if (global.localStorage) global.localStorage.setItem('tmdb_api_key', key); } catch (e) {}
  };

  MovieRecommendationEngine.prototype.hasApiKey = function () {
    return !!this.apiKey;
  };

  // ------------------------------------------------------------------------
  // TMDB HTTP CLIENT — with automatic ISP-block bypass via relay chain
  // ------------------------------------------------------------------------
  MovieRecommendationEngine.prototype._get = function (path, params) {
    var self = this;
    if (!self.fetchFn) return Promise.reject(new Error('No fetch implementation available.'));
    if (!self.apiKey) return Promise.reject(new Error('TMDB API key missing. Call setApiKey() first.'));

    var url = new URL(self.baseUrl + path);
    url.searchParams.set('api_key', self.apiKey);
    url.searchParams.set('language', self.language);
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v != null && v !== '') url.searchParams.set(k, v);
    });

    return self._requestJson(url.toString());
  };

  // Transport: direct fetch first; on transport-level failure (blocked /
  // timed out), retry through the relay chain. HTTP errors (401, 404...)
  // mean the transport works and are surfaced immediately without relaying.
  MovieRecommendationEngine.prototype._requestJson = function (url) {
    var self = this;

    function fetchEnvelope(u) {
      return self.fetchFn(u).then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        }, function () {
          // Non-JSON body (block page, rate-limit text, text-wrapped relay)
          return res.text().then(function (text) {
            return { ok: res.ok, status: res.status, data: null, text: text };
          }, function () {
            return { ok: res.ok, status: res.status, data: null, text: null };
          });
        });
      });
    }

    function extractJsonFromText(text) {
      if (!text) return null;
      // Text-wrapped relays (e.g. r.jina.ai) prefix headers before the payload
      var marker = 'Markdown Content:';
      var idx = text.indexOf(marker);
      var candidate = idx !== -1 ? text.slice(idx + marker.length) : text;
      var start = candidate.search(/[{[]/);
      if (start === -1) return null;
      var endOpen = candidate[start] === '{' ? '}' : ']';
      var end = candidate.lastIndexOf(endOpen);
      if (end <= start) return null;
      try { return JSON.parse(candidate.slice(start, end + 1)); } catch (e) { return null; }
    }

    function parseEnvelope(env, viaRelay) {
      if (env.data == null) env.data = extractJsonFromText(env.text);
      if (env.data == null) {
        var e0 = new Error('Empty or unparseable response from ' + (viaRelay ? 'relay' : 'TMDB') + '.');
        throw e0;
      }
      // TMDB error payload (relays may wrap it in HTTP 200, e.g. allorigins)
      if (typeof env.data.status_code === 'number' && typeof env.data.status_message === 'string') {
        var e1 = new Error(env.data.status_message + ' (TMDB ' + env.data.status_code + ')');
        e1.tmdbStatus = env.data.status_code;
        if (env.data.status_code === 7 || env.data.status_code === 3 || env.data.status_code === 31) e1.status = 401;
        throw e1;
      }
      if (!env.ok) {
        var e2 = new Error('TMDB request failed (' + env.status + ').');
        e2.status = env.status;
        throw e2;
      }
      return env.data;
    }

    function tryRelay(i) {
      if (i >= self.relays.length) {
        var e = new Error('Could not reach TMDB directly or through any relay. Your network may be blocking themoviedb.org entirely — try again later or check your connection.');
        e.networkFailure = true;
        return Promise.reject(e);
      }
      var relayUrl = self.relays[i].replace('{url-raw}', url).replace('{url}', encodeURIComponent(url));

      // An error carrying status/tmdbStatus means TMDB itself answered
      // through this relay (good route, even for a 401). Anything else —
      // relay throttled, 5xx, junk body — means try the next relay.
      function settle(err) {
        if (err && (err.tmdbStatus != null || err.status != null)) {
          self._route = { type: 'relay', index: i };
          throw err;
        }
        return tryRelay(i + 1);
      }

      return fetchEnvelope(relayUrl).then(function (env) {
        try {
          var data = parseEnvelope(env, true);
          self._route = { type: 'relay', index: i };
          return data;
        } catch (err) {
          return settle(err);
        }
      }, settle);
    }

    if (self._route.type === 'relay') {
      return tryRelay(self._route.index);
    }
    if (self.relays.length === 0) {
      return fetchEnvelope(url).then(function (env) { return parseEnvelope(env, false); });
    }
    return fetchEnvelope(url).then(function (env) {
      try {
        return parseEnvelope(env, false);
      } catch (err) {
        // Unparseable direct response (e.g. an ISP block page served as
        // HTTP 200 HTML) — bypass via the relay chain. Real TMDB errors
        // carry status/tmdbStatus and are surfaced as-is.
        if (err && (err.status != null || err.tmdbStatus != null)) throw err;
        return tryRelay(0);
      }
    }, function (err) {
      // Transport failure (blocked/TLS/timed out) — bypass via relay chain
      if (err && (err.status != null || err.tmdbStatus != null)) throw err;
      return tryRelay(0);
    });
  };

  // ------------------------------------------------------------------------
  // STEP A — NATURAL INTEREST → KEYWORD RESOLUTION
  // ------------------------------------------------------------------------
  MovieRecommendationEngine.prototype.resolveKeywords = function (interestKeywords) {
    var self = this;
    var phrases = (interestKeywords || []).map(function (s) { return String(s).trim(); }).filter(Boolean);
    if (phrases.length === 0) return Promise.resolve({ joined: '', resolved: [], missed: [] });

    return Promise.all(phrases.map(function (phrase) {
      return self._get('/search/keyword', { query: phrase }).then(function (data) {
        var best = data.results && data.results[0];
        return best ? { phrase: phrase, id: best.id, name: best.name } : { phrase: phrase, id: null, name: null };
      }).catch(function () { return { phrase: phrase, id: null, name: null }; });
    })).then(function (resolved) {
      var matched = resolved.filter(function (r) { return r.id != null; });
      // OR-join (pipe) so any trope match widens the net
      return { joined: matched.map(function (r) { return r.id; }).join('|'), resolved: matched, missed: resolved.filter(function (r) { return !r.id; }) };
    });
  };

  // ------------------------------------------------------------------------
  // STEP B — OBSCURITY & CATALOG DEPTH CALIBRATION
  // ------------------------------------------------------------------------
  MovieRecommendationEngine.prototype.calibrateObscurity = function (tierKey) {
    var tier = OBSURITY_TIERS[tierKey] || OBSURITY_TIERS.hidden_gem;
    return {
      'vote_count.gte': tier['vote_count.gte'],
      'vote_count.lte': tier['vote_count.lte'],
      'vote_average.gte': tier['vote_average.gte'],
      mPrior: tier.mPrior,
      band: tier.band,
      label: tier.label
    };
  };

  // ------------------------------------------------------------------------
  // BUILD /discover/movie PARAMS (bypasses /movie/popular entirely)
  // ------------------------------------------------------------------------
  MovieRecommendationEngine.prototype.buildDiscoverParams = function (profile, keywordJoined, page) {
    var p = profile;
    var cal = this.calibrateObscurity(p.obscurityTier);
    var range = p.releaseYearRange || DEFAULT_PROFILE.releaseYearRange;
    var maxYear = Math.min(range.maxYear || new Date().getFullYear(), new Date().getFullYear());

    var params = {
      include_adult: 'false',
      sort_by: 'vote_average.desc',
      'vote_count.gte': Math.max(cal['vote_count.gte'], Math.round((p.minRating != null ? p.minRating : cal['vote_average.gte']) * 4)),
      'vote_count.lte': cal['vote_count.lte'],
      'vote_average.gte': p.minRating != null ? p.minRating : cal['vote_average.gte'],
      'primary_release_date.gte': (range.minYear || 1960) + '-01-01',
      'primary_release_date.lte': maxYear + '-12-31',
      without_keywords: this.adultFilterKeyword,
      page: page || 1
    };

    if (p.includedGenres && p.includedGenres.length) params.with_genres = p.includedGenres.join(',');       // comma = AND
    if (p.excludedGenres && p.excludedGenres.length) params.without_genres = p.excludedGenres.join(',');
    if (keywordJoined) params.with_keywords = keywordJoined;                                                // pipe = OR
    if (p.languages && p.languages.length) params.with_original_language = p.languages.join('|');            // pipe = OR

    return params;
  };

  // ------------------------------------------------------------------------
  // STEP C — MULTI-PAGE DEEP FETCH & SEED MERGING (concurrent branches)
  // ------------------------------------------------------------------------
  MovieRecommendationEngine.prototype.fetchDiscoverCandidates = function (profile, keywordJoined, pages) {
    var self = this;
    var jobs = [];
    for (var i = 1; i <= pages; i++) {
      jobs.push(self._get('/discover/movie', self.buildDiscoverParams(profile, keywordJoined, i)));
    }
    return Promise.all(jobs).then(function (responses) {
      var out = [];
      responses.forEach(function (r) { out = out.concat(r.results || []); });
      return out;
    });
  };

  MovieRecommendationEngine.prototype.fetchSeedCandidates = function (seedMovieIds) {
    var self = this;
    var ids = (seedMovieIds || []).slice(0, 5);
    var jobs = [];
    var seedHits = {}; // movieId -> [seed titles that recommended it]

    ids.forEach(function (id) {
      jobs.push(
        self._get('/movie/' + id + '/recommendations', { page: 1 }).then(function (r) {
          return { seedId: id, kind: 'recommendations', results: r.results || [] };
        }),
        self._get('/movie/' + id + '/similar', { page: 1 }).then(function (r) {
          return { seedId: id, kind: 'similar', results: r.results || [] };
        })
      );
    });

    return Promise.all(jobs).then(function (batches) {
      var merged = {}; // id -> movie (first sighting wins)
      var seedTitleLookup = {};

      // Collect seed titles for human-readable match reasons
      var titleJobs = ids.map(function (id) {
        return self._get('/movie/' + id).then(function (m) { seedTitleLookup[id] = m.title; })
          .catch(function () { seedTitleLookup[id] = 'Seed #' + id; });
      });

      batches.forEach(function (batch) {
        batch.results.forEach(function (movie) {
          if (!movie || !movie.id) return;
          if (!merged[movie.id]) merged[movie.id] = movie;
          if (!seedHits[movie.id]) seedHits[movie.id] = [];
          var entry = seedTitleLookup[batch.seedId] || ('Seed #' + batch.seedId);
          if (seedHits[movie.id].indexOf(entry) === -1) seedHits[movie.id].push(entry);
        });
      });

      return Promise.all(titleJobs).then(function () {
        // Re-label now that titles are known
        Object.keys(seedHits).forEach(function (mid) {
          seedHits[mid] = seedHits[mid].map(function (t) {
            if (typeof t === 'string' && t.indexOf('Seed #') === 0) {
              var sid = parseInt(t.replace('Seed #', ''), 10);
              return seedTitleLookup[sid] || t;
            }
            return t;
          });
        });
        return { candidates: Object.keys(merged).map(function (k) { return merged[k]; }), seedHits: seedHits, seedsUsed: ids };
      });
    });
  };

  // ------------------------------------------------------------------------
  // STEP D — CUSTOM WEIGHTED SCORING & RANKING
  // ------------------------------------------------------------------------
  MovieRecommendationEngine.prototype._hardFiltersPass = function (movie, profile) {
    var genreIds = movie.genre_ids || [];
    // Excluded genres are strict
    if (profile.excludedGenres && profile.excludedGenres.length) {
      for (var i = 0; i < genreIds.length; i++) {
        if (profile.excludedGenres.indexOf(genreIds[i]) !== -1) return false;
      }
    }
    // Languages are strict when specified
    if (profile.languages && profile.languages.length) {
      if (profile.languages.indexOf(movie.original_language) === -1) return false;
    }
    // Era window (client-side guard for seed-branch candidates)
    var range = profile.releaseYearRange || DEFAULT_PROFILE.releaseYearRange;
    var year = movie.release_date ? parseInt(String(movie.release_date).slice(0, 4), 10) : null;
    if (year) {
      if (range.minYear && year < range.minYear) return false;
      if (range.maxYear && year > range.maxYear) return false;
    }
    // Rating floor
    if (profile.minRating != null && (movie.vote_average || 0) < profile.minRating) return false;
    return true;
  };

  MovieRecommendationEngine.prototype.scoreCandidate = function (movie, ctx) {
    var score = 0;
    var reasons = [];
    var genreIds = movie.genre_ids || [];

    // 1. Genre overlap (+15 / match; -50 excluded — kept for scoring completeness)
    var overlap = 0;
    genreIds.forEach(function (g) { if (ctx.includedGenreSet[g]) overlap++; });
    if (overlap > 0) {
      score += overlap * 15;
      reasons.push('Matches ' + overlap + ' of your genres');
    }
    if (genreIds.some(function (g) { return ctx.excludedGenreSet[g]; })) {
      score -= 50;
      reasons.push('Contains an excluded genre');
    }

    // 2. Cross-seed frequency boost (+25 per additional seed)
    var seeds = ctx.seedHits[movie.id] || [];
    if (seeds.length > 1) {
      score += 25 * (seeds.length - 1);
      reasons.push('Recommended by ' + seeds.length + ' of your seed films');
    } else if (seeds.length === 1) {
      reasons.push('Similar to ' + seeds[0]);
    }

    // 3. Quality-to-Popularity Bayesian weighting
    //    WR = (v/(v+m))*R + (m/(v+m))*C  — a 7.8 @ 300 votes beats a 6.2 @ 10,000
    var R = movie.vote_average || 0;
    var v = movie.vote_count || 0;
    var m = ctx.mPrior;
    var wr = (v / (v + m)) * R + (m / (v + m)) * C_GLOBAL;
    score += (wr - 6.0) * 25;

    // 4. Obscurity band fit (soft calibration for seed-branch candidates)
    if (v < ctx.band[0]) { score -= 20; }
    else if (v > ctx.band[1]) {
      score -= 30;
      if (ctx.tierKey !== 'mainstream') reasons.push('More mainstream than your ' + ctx.tierLabel);
    }

    // Obscurity-flavoured quality reason
    if (R >= ctx.cal['vote_average.gte'] && reasons.length < 4) {
      reasons.push(ctx.tierLabel + ' (Rating ' + R.toFixed(1) + ')');
    }

    // 5. Language affinity
    if (ctx.languageSet[movie.original_language]) {
      score += 5;
      if (reasons.length < 4) {
        reasons.push((LANGUAGE_NAMES[movie.original_language] || movie.original_language.toUpperCase()) + '-language cinema');
      }
    }

    // 6. Era alignment nudge
    var year = movie.release_date ? parseInt(String(movie.release_date).slice(0, 4), 10) : null;
    if (year) score += 3;

    // 7. Novelty jitter (±5%) so repeat queries feel fresh
    if (ctx.jitter > 0) {
      score *= 1 + (Math.random() * 2 - 1) * ctx.jitter;
    }

    return { matchScore: Math.round(score * 10) / 10, matchReason: reasons.slice(0, 4) };
  };

  // ------------------------------------------------------------------------
  // MAIN PIPELINE — discover(profile, { limit, pages })
  // ------------------------------------------------------------------------
  MovieRecommendationEngine.prototype.discover = function (profile, options) {
    var self = this;
    options = options || {};
    var limit = options.limit || 24;
    var pages = options.pages || 3;

    var p = Object.assign({}, DEFAULT_PROFILE, profile || {});
    p.releaseYearRange = Object.assign({}, DEFAULT_PROFILE.releaseYearRange, (profile && profile.releaseYearRange) || {});
    p.includedGenres = p.includedGenres || [];
    p.excludedGenres = p.excludedGenres || [];
    p.languages = p.languages || [];
    p.seedMovieIds = (p.seedMovieIds || []).slice(0, 5);

    var cal = self.calibrateObscurity(p.obscurityTier);

    return self.resolveKeywords(p.interestKeywords).then(function (kw) {
      var branches = [self.fetchDiscoverCandidates(p, kw.joined, pages)];
      if (p.seedMovieIds.length) branches.push(self.fetchSeedCandidates(p.seedMovieIds));

      return Promise.all(branches).then(function (results) {
        var discoverPool = results[0] || [];
        var seedPool = results[1] || { candidates: [], seedHits: {}, seedsUsed: [] };

        // Merge + dedupe into a single map, strip seeds and hard-filtered titles
        var map = {};
        discoverPool.concat(seedPool.candidates).forEach(function (movie) {
          if (!movie || !movie.id) return;
          if (p.seedMovieIds.indexOf(movie.id) !== -1) return; // never recommend the seeds back
          if (!self._hardFiltersPass(movie, p)) return;
          if (!map[movie.id]) map[movie.id] = movie;
        });

        var includedGenreSet = {};
        p.includedGenres.forEach(function (g) { includedGenreSet[g] = true; });
        var excludedGenreSet = {};
        p.excludedGenres.forEach(function (g) { excludedGenreSet[g] = true; });
        var languageSet = {};
        p.languages.forEach(function (l) { languageSet[l] = true; });

        var ctx = {
          includedGenreSet: includedGenreSet,
          excludedGenreSet: excludedGenreSet,
          languageSet: languageSet,
          seedHits: seedPool.seedHits || {},
          mPrior: cal.mPrior,
          band: cal.band,
          cal: cal,
          tierKey: p.obscurityTier,
          tierLabel: cal.label,
          jitter: self.noveltyJitter
        };

        var ranked = Object.keys(map).map(function (id) {
          var movie = map[id];
          var scored = self.scoreCandidate(movie, ctx);
          return Object.assign({}, movie, { matchScore: scored.matchScore, matchReason: scored.matchReason });
        });

        ranked.sort(function (a, b) { return b.matchScore - a.matchScore; });

        return {
          count: ranked.length,
          movies: ranked.slice(0, limit),
          meta: {
            tier: cal.label,
            keywordsMatched: kw.resolved.map(function (r) { return r.name; }),
            keywordsMissed: kw.missed.map(function (r) { return r.phrase; }),
            seedsUsed: seedPool.seedsUsed || [],
            poolSize: ranked.length,
            fetched: discoverPool.length + (seedPool.candidates || []).length,
            viaRelay: self._route.type === 'relay'
          }
        };
      });
    });
  };

  // ------------------------------------------------------------------------
  // ENRICHMENT — full details for the detail view
  // ------------------------------------------------------------------------
  MovieRecommendationEngine.prototype.getMovieFullDetails = function (movieId) {
    return this._get('/movie/' + movieId, {
      append_to_response: 'keywords,credits,videos,watch/providers'
    });
  };

  // Seed picker helper for the UI
  MovieRecommendationEngine.prototype.searchMovies = function (query) {
    return this._get('/search/movie', { query: query, include_adult: 'false' })
      .then(function (data) { return data.results || []; });
  };

  // ------------------------------------------------------------------------
  // EXPORTS
  // ------------------------------------------------------------------------
  var api = {
    MovieRecommendationEngine: MovieRecommendationEngine,
    TMDB_GENRES: TMDB_GENRES,
    LANGUAGE_NAMES: LANGUAGE_NAMES,
    OBSURITY_TIERS: OBSURITY_TIERS,
    DEFAULT_PROFILE: DEFAULT_PROFILE
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.MovieRecommendationEngine = MovieRecommendationEngine;
  global.TMDB_GENRES = TMDB_GENRES;
  global.TMDB_LANGUAGE_NAMES = LANGUAGE_NAMES;
  global.TMDB_OBSURITY_TIERS = OBSURITY_TIERS;

})(typeof window !== 'undefined' ? window : globalThis);
