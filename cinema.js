/**
 * FILM DISCOVERY SANCTUARY — UI wiring
 * Binds the taste profile form to the MovieRecommendationEngine.
 * All motion flows through The Overgrown Bastion visual systems
 * (bastion.js: crosshair, curtains, sprouts, pollen, settle physics).
 */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
  var IMG_RELAY = 'https://images.weserv.nl/?url='; // image proxy for blocked networks
  var YOUTUBE_BASE = 'https://www.youtube.com/watch?v=';

  var engine = new window.MovieRecommendationEngine({});
  var GENRES = window.TMDB_GENRES;
  var LANGS = window.TMDB_LANGUAGE_NAMES;
  var LANG_CHOICES = ['en', 'ko', 'ja', 'hi', 'fr', 'es', 'de', 'it', 'zh', 'sv', 'da', 'no', 'pl', 'pt', 'tr'];

  // ------------------------------------------------------------------------
  // LOCAL TASTE STATE
  // ------------------------------------------------------------------------
  var state = {
    includedGenres: [],
    excludedGenres: [],
    keywords: [],
    seeds: [], // { id, title }
    obscurityTier: 'hidden_gem',
    languages: [],
    minYear: 1960,
    maxYear: new Date().getFullYear(),
    minRating: 6.5,
    lastMovies: []
  };

  var $ = function (id) { return document.getElementById(id); };

  // ------------------------------------------------------------------------
  // MICRO-HELPERS
  // ------------------------------------------------------------------------
  function pollenBurst(x, y) {
    if (reduceMotion) return;
    var colors = ['#E6B84D', '#68B87E'];
    for (var i = 0; i < 6; i++) {
      var dot = document.createElement('span');
      dot.className = 'pollen';
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
      dot.style.background = colors[i % 2];
      document.body.appendChild(dot);
      var dx = (Math.random() - 0.5) * 80;
      var dy = -35 - Math.random() * 60;
      var anim = dot.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.2)', opacity: 0 }
      ], { duration: 750 + Math.random() * 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      anim.onfinish = function () { dot.remove(); };
    }
  }

  // Shine glide for dynamically-created glass cards (bastion.js binds only static ones)
  function bindShine(card) {
    if (!window.matchMedia('(pointer: fine)').matches || reduceMotion) return;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--shine-x', (((e.clientX - r.left) / r.width) * r.width * 2.4 - r.width * 0.2).toFixed(0) + 'px');
    });
    card.addEventListener('mouseleave', function () { card.style.setProperty('--shine-x', '0px'); });
  }

  // Poster images: image.tmdb.org is ISP-blocked in some regions. First error
  // retries through the wsrv.nl image proxy; second error falls back to the
  // carved stone plate with the film's title.
  function bindPosters(host) {
    host.querySelectorAll('img[data-direct]').forEach(function (img) {
      img.addEventListener('error', function () {
        if (!img.dataset.relayed) {
          img.dataset.relayed = '1';
          img.src = IMG_RELAY + encodeURIComponent(img.getAttribute('data-direct').replace(/^https?:\/\//, ''));
          return;
        }
        var span = document.createElement('span');
        span.className = 'poster-fallback';
        span.textContent = img.getAttribute('data-title') || '';
        if (img.parentNode) img.parentNode.replaceChild(span, img);
      });
    });
  }

  // ------------------------------------------------------------------------
  // API KEY GATE
  // ------------------------------------------------------------------------
  function ensureKey() {
    if (engine.hasApiKey()) return true;
    showState('setup');
    return false;
  }

  // ------------------------------------------------------------------------
  // STATE SLAB (setup / idle / loading / error / empty)
  // ------------------------------------------------------------------------
  function showState(mode, payload) {
    var slab = $('resultsState');
    var grid = $('movieGrid');
    grid.classList.add('hidden');
    slab.classList.remove('hidden');
    slab.className = 'glass-card state-slab settle settled';

    if (mode === 'setup') {
      slab.innerHTML =
        '<span class="sigil" aria-hidden="true">🔑</span>' +
        '<h3>Bring Your TMDB Key</h3>' +
        '<p>This engine queries the TMDB API directly — and automatically tunnels around ISP-level TMDB blocks via a public relay.<br>Paste your free v3 API key: sign up at <strong>themoviedb.org</strong>, then <strong>Settings → API → API Key (v3 auth)</strong>. Stored only in your browser.</p>' +
        '<input id="apiKeyInput" class="stone-input" type="password" placeholder="TMDB v3 API key…" style="max-width: 300px;">' +
        '<button id="btnSaveKey" class="stone-btn small" type="button"><span>Seal the Key</span></button>';
      var save = $('btnSaveKey');
      save.addEventListener('click', function () {
        var v = ($('apiKeyInput').value || '').trim();
        if (!v) return;
        engine.setApiKey(v);
        pollenBurst(save.getBoundingClientRect().left + 30, save.getBoundingClientRect().top);
        showState('idle');
      });
    } else if (mode === 'loading') {
      slab.className = 'glass-card state-slab settle settled excavating';
      slab.innerHTML =
        '<span class="sigil" aria-hidden="true">⛏️</span>' +
        '<h3>Excavating the Catalog…</h3>' +
        '<p>Resolving tropes to keyword IDs, calibrating obscurity ceilings, and cross-pollinating seed recommendations.</p>';
    } else if (mode === 'error') {
      slab.className = 'glass-card state-slab settle settled error-slab';
      slab.innerHTML =
        '<span class="sigil" aria-hidden="true">🍂</span>' +
        '<h3>The Dig Hit Bedrock</h3>' +
        '<p>' + (payload && payload.message ? payload.message : 'Something went wrong querying TMDB.') + '</p>' +
        '<button id="btnRetry" class="stone-btn small" type="button"><span>Try Again</span></button>';
      $('btnRetry').addEventListener('click', runHarvest);
    } else if (mode === 'empty') {
      slab.innerHTML =
        '<span class="sigil" aria-hidden="true">🌱</span>' +
        '<h3>No Films Matched This Profile</h3>' +
        '<p>The obscurity ceiling may be too tight for these tropes. Widen the era window, lower the rating floor, or switch to a shallower tier.</p>';
    } else {
      slab.innerHTML =
        '<span class="sigil" aria-hidden="true">🗺️</span>' +
        '<h3>Set your taste profile</h3>' +
        '<p>Pick an obscurity depth, sprinkle in tropes you love, plant up to five seed films — then unearth the catalog the feeds never show you.</p>';
    }
  }

  function setFetching(on) {
    $('fetchVine').classList.toggle('growing', on);
    $('btnHarvest').disabled = on;
    $('btnHarvest').classList.toggle('is-loading', on);
  }

  // ------------------------------------------------------------------------
  // TASTE PANEL RENDERING
  // ------------------------------------------------------------------------
  function renderGenreChips() {
    var host = $('genreChips');
    host.innerHTML = '';
    Object.keys(GENRES).forEach(function (id) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = GENRES[id];
      var numId = parseInt(id, 10);
      if (state.includedGenres.indexOf(numId) !== -1) chip.classList.add('active');
      if (state.excludedGenres.indexOf(numId) !== -1) chip.classList.add('excluded-active');
      chip.title = 'Click: include · Click again: exclude · Third click: clear';
      chip.addEventListener('click', function (e) {
        pollenBurst(e.clientX, e.clientY);
        var inc = state.includedGenres.indexOf(numId);
        var exc = state.excludedGenres.indexOf(numId);
        if (inc !== -1) { state.includedGenres.splice(inc, 1); state.excludedGenres.push(numId); }
        else if (exc !== -1) { state.excludedGenres.splice(exc, 1); }
        else { state.includedGenres.push(numId); }
        renderGenreChips();
      });
      host.appendChild(chip);
    });
  }

  function renderLanguageChips() {
    var host = $('languageChips');
    host.innerHTML = '';
    LANG_CHOICES.forEach(function (code) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (state.languages.indexOf(code) !== -1 ? ' active' : '');
      chip.textContent = (LANGS[code] || code) + ' · ' + code.toUpperCase();
      chip.addEventListener('click', function (e) {
        pollenBurst(e.clientX, e.clientY);
        var i = state.languages.indexOf(code);
        if (i !== -1) state.languages.splice(i, 1); else state.languages.push(code);
        renderLanguageChips();
      });
      host.appendChild(chip);
    });
  }

  function renderKeywordChips() {
    var host = $('keywordChipRow');
    host.innerHTML = '';
    state.keywords.forEach(function (kw) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip active';
      chip.innerHTML = kw + '<span class="x">✕</span>';
      chip.addEventListener('click', function () {
        state.keywords = state.keywords.filter(function (k) { return k !== kw; });
        renderKeywordChips();
      });
      host.appendChild(chip);
    });
  }

  function renderSeedChips() {
    var host = $('seedChipRow');
    host.innerHTML = '';
    state.seeds.forEach(function (seed) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip seed-chip';
      chip.title = 'Remove seed';
      chip.innerHTML = '❦ ' + seed.title + '<span class="x">✕</span>';
      chip.addEventListener('click', function () {
        state.seeds = state.seeds.filter(function (s) { return s.id !== seed.id; });
        renderSeedChips();
      });
      host.appendChild(chip);
    });
    $('seedCountHint').textContent = state.seeds.length + ' / 5';
  }

  function addSeed(id, title) {
    if (state.seeds.length >= 5) return;
    if (state.seeds.some(function (s) { return s.id === id; })) return;
    state.seeds.push({ id: id, title: title });
    renderSeedChips();
  }

  // ------------------------------------------------------------------------
  // SEED SEARCH (debounced /search/movie)
  // ------------------------------------------------------------------------
  var seedSearchTimer = null;
  var seedSearchSeq = 0;

  $('seedSearchInput').addEventListener('input', function (e) {
    var q = (e.target.value || '').trim();
    clearTimeout(seedSearchTimer);
    var box = $('seedResults');
    if (q.length < 2 || !engine.hasApiKey()) { box.classList.add('hidden'); return; }
    seedSearchTimer = setTimeout(function () {
      var seq = ++seedSearchSeq;
      engine.searchMovies(q).then(function (results) {
        if (seq !== seedSearchSeq) return; // stale response
        box.innerHTML = '';
        results.slice(0, 8).forEach(function (m) {
          var item = document.createElement('button');
          item.type = 'button';
          item.className = 'seed-result-item';
          var year = (m.release_date || '').slice(0, 4) || '????';
          item.innerHTML = '<span>' + m.title + '</span><span class="yr">' + year + '</span>';
          item.addEventListener('click', function () {
            addSeed(m.id, m.title);
            $('seedSearchInput').value = '';
            box.classList.add('hidden');
          });
          box.appendChild(item);
        });
        box.classList.toggle('hidden', results.length === 0);
      }).catch(function () { box.classList.add('hidden'); });
    }, 320);
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.seed-search-wrap')) {
      $('seedResults').classList.add('hidden');
    }
  });

  // ------------------------------------------------------------------------
  // TIER KEYS / SLIDER / KEYWORD ENTRY
  // ------------------------------------------------------------------------
  $('tierKeys').addEventListener('click', function (e) {
    var key = e.target.closest && e.target.closest('.tier-key');
    if (!key) return;
    pollenBurst(e.clientX, e.clientY);
    state.obscurityTier = key.getAttribute('data-tier');
    Array.prototype.forEach.call($('tierKeys').children, function (el) {
      el.classList.toggle('active', el === key);
    });
  });

  document.querySelectorAll('.trope-quick').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var kw = btn.getAttribute('data-kw');
      if (state.keywords.indexOf(kw) === -1) {
        state.keywords.push(kw);
        renderKeywordChips();
      }
      pollenBurst(e.clientX, e.clientY);
    });
  });

  $('keywordInput').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var parts = (e.target.value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    parts.forEach(function (p) {
      if (state.keywords.indexOf(p) === -1) state.keywords.push(p);
    });
    e.target.value = '';
    renderKeywordChips();
  });

  $('minRatingInput').addEventListener('input', function (e) {
    state.minRating = parseInt(e.target.value, 10) / 10;
    $('minRatingLabel').textContent = state.minRating.toFixed(1);
  });

  // ------------------------------------------------------------------------
  // HARVEST — run the 4-step engine pipeline
  // ------------------------------------------------------------------------
  function collectProfile() {
    state.minYear = parseInt($('minYearInput').value, 10) || 1900;
    state.maxYear = parseInt($('maxYearInput').value, 10) || new Date().getFullYear();
    return {
      includedGenres: state.includedGenres.slice(),
      excludedGenres: state.excludedGenres.slice(),
      interestKeywords: state.keywords.slice(),
      seedMovieIds: state.seeds.map(function (s) { return s.id; }),
      obscurityTier: state.obscurityTier,
      languages: state.languages.slice(),
      releaseYearRange: { minYear: state.minYear, maxYear: state.maxYear },
      minRating: state.minRating
    };
  }

  function runHarvest() {
    if (!ensureKey()) return;
    setFetching(true);
    showState('loading');

    engine.discover(collectProfile(), { limit: 24, pages: 3 }).then(function (result) {
      setFetching(false);
      state.lastMovies = result.movies;
      if (!result.movies.length) { showState('empty'); $('haulMeta').textContent = '0 films surfaced'; return; }
      renderResults(result);
    }).catch(function (err) {
      setFetching(false);
      var msg;
      if (err && (err.status === 401 || err.tmdbStatus === 7 || err.tmdbStatus === 31 || /valid key|api key/i.test(err.message || ''))) {
        msg = 'TMDB rejected the API key. Copy your v3 API key again from themoviedb.org → Settings → API and re-seal it. (Reached TMDB ' + (engine._route.type === 'relay' ? 'via relay' : 'directly') + ', so connectivity is fine — only the key was refused.)';
      } else if (err && err.networkFailure) {
        msg = 'TMDB is unreachable from your network — both direct and relay routes failed. This usually means themoviedb.org is blocked by your ISP and the public relays are having a moment. Wait a minute and press Try Again.';
      } else {
        msg = (err && err.message) || 'Unknown network error.';
      }
      showState('error', { message: msg });
    });
  }

  $('btnHarvest').addEventListener('click', function (e) {
    pollenBurst(e.clientX, e.clientY);
    runHarvest();
  });

  // Fresh haul: same profile, new novelty jitter
  $('btnFreshHaul').addEventListener('click', function () {
    if (state.lastMovies.length) runHarvest();
    else runHarvest();
  });

  // ------------------------------------------------------------------------
  // RESULTS RENDERING (staggered stone-settle entrances)
  // ------------------------------------------------------------------------
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderResults(result) {
    var slab = $('resultsState');
    var grid = $('movieGrid');
    slab.classList.add('hidden');
    grid.classList.remove('hidden');
    grid.innerHTML = '';

    var meta = result.meta;
    var bits = [result.movies.length + ' films', meta.tier.toLowerCase() + ' depth'];
    if (meta.keywordsMatched.length) bits.push('troves: ' + meta.keywordsMatched.slice(0, 3).join(', '));
    if (meta.seedsUsed.length) bits.push(meta.seedsUsed.length + ' seed' + (meta.seedsUsed.length > 1 ? 's' : '') + ' cross-pollinated');
    bits.push('pool of ' + meta.poolSize);
    if (meta.viaRelay) bits.push('tunneled via relay');
    $('haulMeta').textContent = bits.join(' • ');

    result.movies.forEach(function (movie, i) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'movie-card glass-card settle';
      card.style.setProperty('--d', Math.min(i, 10) * 70 + 'ms');

      var year = (movie.release_date || '').slice(0, 4) || '—';
      var rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—';
      var posterHtml = movie.poster_path
        ? '<img src="' + POSTER_BASE + movie.poster_path + '" alt="" loading="lazy" data-direct="' + POSTER_BASE + movie.poster_path + '" data-title="' + escapeHtml(movie.title) + '">'
        : '<span class="poster-fallback">' + escapeHtml(movie.title) + '</span>';

      var reasons = (movie.matchReason || []).map(function (r) {
        var cls = 'reason-chip';
        if (/Gem|Cult|Mainstream|Deep Cut/i.test(r)) cls += ' gem';
        if (/Similar|Recommended/i.test(r)) cls += ' seed';
        return '<span class="' + cls + '">' + escapeHtml(r) + '</span>';
      }).join('');

      card.innerHTML =
        '<span class="poster-wrap">' + posterHtml +
          '<span class="score-seal">' + Math.max(0, Math.round(movie.matchScore / 10)) + '</span>' +
        '</span>' +
        '<span class="movie-meta">' +
          '<span class="movie-title">' + escapeHtml(movie.title) + '</span>' +
          '<span class="movie-sub">' + year + ' • ★ ' + rating + ' • ' + (movie.vote_count || 0) + ' votes</span>' +
          '<span class="reason-chips">' + reasons + '</span>' +
        '</span>';

      card.addEventListener('click', function (e) {
        pollenBurst(e.clientX, e.clientY);
        openDetail(movie, e);
      });
      bindShine(card);
      grid.appendChild(card);
    });

    // Let the cards drop in like cut stones being laid
    bindPosters(grid);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        grid.querySelectorAll('.settle').forEach(function (el) { el.classList.add('settled'); });
      });
    });
  }

  // ------------------------------------------------------------------------
  // DETAIL MODAL — The Cartographer's View (vine-curtain ritual)
  // ------------------------------------------------------------------------
  var detailModal = $('detailModal');
  var currentDetailMovie = null;

  function openDetail(movie, e) {
    currentDetailMovie = movie;
    var host = $('detailContent');
    $('detailModalTitle').textContent = movie.title || 'The Cartographer\u2019s View';
    host.innerHTML = '<div class="state-slab excavating"><span class="sigil">📜</span><p>Unrolling the vellum…</p></div>';

    var ritual = window.BastionRitual;
    var show = function () {
      detailModal.classList.remove('hidden');
      var panel = detailModal.querySelector('.modal-panel');
      panel.classList.remove('ritual-enter');
      void panel.offsetWidth;
      panel.classList.add('ritual-enter');
    };
    if (ritual) ritual.sweep(show, null, e); else show();

    engine.getMovieFullDetails(movie.id).then(function (d) {
      var year = (d.release_date || '').slice(0, 4) || '—';
      var runtime = d.runtime ? d.runtime + ' min' : '—';
      var genres = (d.genres || []).map(function (g) { return g.name; }).join(' · ') || '—';
      var tagline = d.tagline ? '<div class="detail-tagline">"' + escapeHtml(d.tagline) + '"</div>' : '';
      var overview = d.overview ? escapeHtml(d.overview) : 'No synopsis inscribed in the archives.';
      var poster = d.poster_path
        ? '<img src="' + POSTER_BASE + d.poster_path + '" alt="" data-direct="' + POSTER_BASE + d.poster_path + '" data-title="' + escapeHtml(d.title) + '">'
        : '<span class="poster-fallback">' + escapeHtml(d.title) + '</span>';

      var kwList = ((d.keywords && d.keywords.keywords) || []).slice(0, 10).map(function (k) {
        return '<span class="chip" style="cursor:default;">' + escapeHtml(k.name) + '</span>';
      }).join('');

      var cast = ((d.credits && d.credits.cast) || []).slice(0, 6).map(function (c) {
        return '<span class="cast-chip"><span class="actor">' + escapeHtml(c.name) + '</span>' +
               '<span class="role">' + escapeHtml(c.character || '—') + '</span></span>';
      }).join('');

      var trailer = ((d.videos && d.videos.results) || []).find(function (v) {
        return v.site === 'YouTube' && v.type === 'Trailer';
      });
      var trailerBtn = trailer
        ? '<a class="stone-btn small" href="' + YOUTUBE_BASE + trailer.key + '" target="_blank" rel="noopener"><span>Watch Trailer</span></a>'
        : '';

      var providers = (d['watch/providers'] && d['watch/providers'].results && (d['watch/providers'].results.US || d['watch/providers'].results[Object.keys(d['watch/providers'].results)[0]]));
      var providerHtml = '';
      if (providers && providers.flatrate) {
        providerHtml = '<div class="detail-section"><div class="rail-label">Streaming On</div><div class="chip-row">' +
          providers.flatrate.slice(0, 6).map(function (p) {
            return '<span class="chip" style="cursor:default;">' + escapeHtml(p.provider_name) + '</span>';
          }).join('') + '</div></div>';
      }

      var reasons = (movie.matchReason || []).map(function (r) {
        return '<span class="reason-chip">' + escapeHtml(r) + '</span>';
      }).join('');

      host.innerHTML =
        '<div class="detail-top">' +
          '<span class="detail-poster">' + poster + '</span>' +
          '<div>' +
            '<h3 class="detail-title">' + escapeHtml(d.title) + '</h3>' +
            '<div class="detail-facts"><span>' + year + '</span><span>' + runtime + '</span>' +
              '<span>★ ' + (d.vote_average ? d.vote_average.toFixed(1) : '—') + '</span>' +
              '<span>' + (d.vote_count || 0) + ' votes</span><span>' + escapeHtml(d.original_language || '').toUpperCase() + '</span></div>' +
            '<div class="reason-chips" style="margin-bottom:0.7rem;">' + reasons + '</div>' +
            tagline +
            '<div class="detail-overview">' + overview + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="detail-section"><div class="rail-label">Genre Roots</div><div class="chip-row">' +
          '<span class="chip" style="cursor:default;">' + escapeHtml(genres) + '</span></div></div>' +
        (kwList ? '<div class="detail-section"><div class="rail-label">Tropes &amp; Keywords</div><div class="chip-row">' + kwList + '</div></div>' : '') +
        (cast ? '<div class="detail-section"><div class="rail-label">Principal Cast</div><div class="cast-row">' + cast + '</div></div>' : '') +
        providerHtml +
        '<div class="detail-actions">' +
          trailerBtn +
          '<button id="btnSeedFromDetail" class="stone-btn small" type="button"><span>Plant as Seed</span></button>' +
          '<a class="btn-ghost small" href="https://www.themoviedb.org/movie/' + d.id + '" target="_blank" rel="noopener"><span>Open in TMDB</span></a>' +
        '</div>';

      bindPosters(host);
      var seedBtn = $('btnSeedFromDetail');
      if (seedBtn) {
        seedBtn.addEventListener('click', function (e) {
          addSeed(d.id, d.title);
          pollenBurst(e.clientX, e.clientY);
          closeDetail();
        });
      }
    }).catch(function (err) {
      host.innerHTML = '<div class="state-slab error-slab"><span class="sigil">🍂</span>' +
        '<p>' + escapeHtml((err && err.message) || 'Could not load details.') + '</p></div>';
    });
  }

  function closeDetail(e) {
    var ritual = window.BastionRitual;
    if (ritual) {
      ritual.sweep(function () { detailModal.classList.add('hidden'); }, null, e);
    } else {
      detailModal.classList.add('hidden');
    }
  }

  $('btnCloseDetail').addEventListener('click', function (e) { closeDetail(e); });
  detailModal.addEventListener('click', function (e) {
    if (e.target === detailModal) closeDetail(e);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) closeDetail();
  });

  // ------------------------------------------------------------------------
  // BOOT
  // ------------------------------------------------------------------------
  renderGenreChips();
  renderLanguageChips();
  renderKeywordChips();
  renderSeedChips();
  $('minYearInput').value = state.minYear;
  $('maxYearInput').value = state.maxYear;
  if (!engine.hasApiKey()) showState('setup'); else showState('idle');

})();
