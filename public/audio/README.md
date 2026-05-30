# Audio Assets

Place an optional background music file here:

```text
public/audio/background-music.mp3
```

The app uses a manual play/pause button. If this file is missing, the music control reports that no music file is available and the app continues normally.

`background-music.mp3` is intentionally allowed by `.gitignore` so it can be committed when the file is rights-cleared and intentionally public. It will be publicly accessible after deployment.

Other audio files in this folder remain ignored by default unless they are explicitly allowed later.

You can also configure a public hosted MP3 URL with `VITE_BACKGROUND_MUSIC_URL`.
