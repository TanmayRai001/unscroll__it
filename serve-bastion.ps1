# The Overgrown Bastion — tiny local web server
# Serves this folder at http://localhost:8099 (starts only if not already running)
$root = $PSScriptRoot
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 8099)
try { $listener.Start() } catch { exit }   # already serving from another window
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8'; '.png'='image/png'; '.jpg'='image/jpeg'; '.svg'='image/svg+xml'; '.ico'='image/x-icon'; '.json'='application/json; charset=utf-8'; '.mp3'='audio/mpeg' }

# Sound Sanctuary tracks: the site requests clean names under assets/audio/,
# while the uploaded originals live in the user's Downloads folder. A real
# file placed in assets/audio/ always wins over this alias map.
$downloads = Join-Path $env:USERPROFILE 'Downloads'
# Lord Algernon voice reference: the uploaded ElevenLabs sample is byte-for-byte
# identical to vintage_radio_dj.mp3 (MD5 BBA23426...), which already sits in this
# folder. This alias exposes it under the assets dir under a clear, non-playing
# name; the original in Downloads is never touched.
$audioAliases = @{
  'assets/voice/REFERENCE-voice-sample.mp3' = 'ElevenLabs_2026-10-03T13_41_07_Johnny Dynamite - Vintage Radio DJ_pvc_sp112_s50_sb75_v4.mp3'
  'assets/audio/long-whale.mp3' = 'symphocat_-_long_whale_song_short_version_nightcorebot_nightcorebot_(mp3.pm).mp3'
  'assets/audio/green-to-blue.mp3' = 'daniel._-_green_to_blue_(mp3.pm).mp3'
  'assets/audio/the-beach.mp3' = 'Lil_Swervo_Jr._-_The_Beach_Instrumental_slow_(mp3.pm).mp3'
  'assets/audio/a-way-out.mp3' = 'my_head_is_empty_Miranda_Rain_-_a_way_out_(mp3.pm).mp3'
  'assets/audio/milk-casette.mp3' = 'milk_casette_-_x._(mp3.pm).mp3'
  'assets/audio/c418-minecraft.mp3' = 'C418_-_Minecraft_main_theme_(mp3.pm).mp3'
  'assets/audio/save-me.mp3' = 'my_head_is_empty_Miranda_Rain_-_save_me_(mp3.pm).mp3'
}
while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $requestLine = $reader.ReadLine()
    while ($true) { $line = $reader.ReadLine(); if ($null -eq $line -or $line -eq '') { break } }
    $parts = $requestLine -split ' '
    $path = if ($parts.Length -gt 1) { $parts[1] } else { '/' }
    $file = $path.Split('?')[0].Trim('/')
    if ($file -eq '') { $file = 'index.html' }
    $file = [System.Uri]::UnescapeDataString($file)
    $full = Join-Path $root $file
    if (-not [System.IO.File]::Exists($full) -and $audioAliases.ContainsKey($file)) {
      $aliased = Join-Path $downloads $audioAliases[$file]
      if ([System.IO.File]::Exists($aliased)) { $full = $aliased }
    }
    if ([System.IO.File]::Exists($full)) {
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ctype = $types[$ext]; if (-not $ctype) { $ctype = 'application/octet-stream' }
      $header = "HTTP/1.1 200 OK`r`nContent-Type: $ctype`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
      $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($hb, 0, $hb.Length)
      $stream.Write($bytes, 0, $bytes.Length)
    } else {
      $body = 'not found'
      $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n$body"
      $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($hb, 0, $hb.Length)
    }
  } catch {} finally { $client.Close() }
}
