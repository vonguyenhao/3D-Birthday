# 3D Birthday Book

A fullscreen magical 3D birthday book built with Vite, React, React Three Fiber, Drei, and Framer Motion.

The closed book starts with drifting magical star-orbs. The first click awakens the cover and forms a crab-inspired Cancer constellation emblem; the second click opens the book. After it opens, click the right page to go forward and click the left page to go back. A subtle hidden mark inside the open book reveals a sealed secret envelope. Opening the wax seal shows the unlock questions; after success, the book dissolves into stardust and the secret message appears as readable ember-glow sections in the air.

## Run Locally

```bash
npm install
npm run dev
```

Create `.env.local` in the project root:

```bash
SECRET_ANSWER_1=your_first_answer_here
SECRET_ANSWER_2=your_second_answer_here
SECRET_MESSAGE=your_secret_message_here
UNLOCK_TOKEN_SECRET=your_unlock_token_secret_here
PRIVATE_MEMORY_IMAGES_ENABLED=false
MEMORY_IMAGES_PREFIX=memories/
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
VITE_BACKGROUND_MUSIC_URL=
```

`.env.local` is correct for local secrets because Vite does not expose non-`VITE_` variables to browser code. The serverless API and the local Vite middleware can read these values on the server side, but the React frontend cannot.

`VITE_BACKGROUND_MUSIC_URL` is the exception: it is safe only for a public music URL because every `VITE_` variable is exposed to browser code. Never put answers, secret messages, tokens, or private media URLs in a `VITE_` variable.

## Long Secret Messages

`SECRET_MESSAGE` can be long and can include Vietnamese text. Escaped newlines are supported:

```bash
SECRET_MESSAGE=your_first_secret_line_here\nyour_second_secret_line_here
```

After successful unlock, the frontend receives the message from `/api/unlock`, converts escaped `\n` into real line breaks, and reveals it in centered sky-message sections. Each section pauses for roughly 7 seconds so the message can be read slowly. The secret is not rendered before the backend returns it.

## Book Interactions

- Click/tap the closed book once to awaken the cover.
- Watch the floating star-orbs gather into the crab-inspired Cancer emblem.
- Click/tap the closed book again to open it.
- Click/tap the pink cover to close it.
- Click/tap the right page to move forward.
- Click/tap the left page to move backward.
- Find the subtle glowing secret mark inside the open book and tap it to reveal the sealed envelope.
- Tap the wax seal/envelope to unfold the parchment letter and show the two questions.
- After successful unlock, the letter fades, the book releases the message, dissolves, and the secret text appears in the sky.
- Use Back to book or Escape to close the secret reveal and restore the open book.
- Use Replay to restart the reveal without calling `/api/unlock` again.
- Use Show full message to complete the animation and read the completed message in sections.
- After the secret is unlocked, the hidden seal remains in the book as a replay trigger and does not ask the questions again.

Opening the book, turning pages, unlocking the secret, and releasing the final message trigger subtle gold/white/pink sparkle effects.

The closed cover uses a two-step animated crab-inspired Cancer constellation emblem. Before the first click, glowing star-orbs drift around the cover edges. The first click sends them inward into a stylised shell, claw, and leg shape. The second click triggers a small sparkle burst from the formed emblem and opens the book.

## Optional Music

The music button uses a manual play/pause flow. Browsers block autoplay, so the app does not rely on autoplay.

Recommended options:

- Local public MP3 fallback: `public/audio/background-music.mp3`
- Hosted public MP3 URL: `VITE_BACKGROUND_MUSIC_URL=https://example.com/music.mp3`

If `VITE_BACKGROUND_MUSIC_URL` is set, the app uses that URL. If it is empty, the app falls back to:

```text
public/audio/background-music.mp3
```

If the file or URL is missing/unavailable, the app disables the music control gracefully and continues running.

`public/audio/background-music.mp3` is public after deployment if committed. Only use music that is rights-cleared and intentionally public.

The repository is configured so `public/audio/background-music.mp3` can be tracked, while other audio files under `public/audio/` remain ignored unless explicitly allowed later. If you do not want the music file in GitHub, keep `VITE_BACKGROUND_MUSIC_URL` pointed at a public hosted MP3 instead.

YouTube is not recommended as the primary background music source. It is not a direct audio file, cannot be used cleanly as an `<audio>` source, requires a heavier iframe/player, may show YouTube UI/branding, and still needs manual user interaction. Treat YouTube as an optional external link or fallback only.

## Optional Public Memory Placeholders

Place only non-sensitive placeholder memory images in:

```text
public/images/memories/
```

The sample hotspots look for:

```text
public/images/memories/memory-1.jpg
public/images/memories/memory-2.jpg
```

If an image is missing, the lightbox shows a friendly fallback instead of crashing. Files in `public` are served directly by the browser and are not secret, so do not put private images there.

Real image files under `public/images/memories/` are ignored by git by default, except `public/images/memories/README.md`.

## Phase 2 Private Images with Vercel Blob

Images in `public/` are not private. Do not place sensitive photos there.

For private memory photos, keep real images out of GitHub and out of `public/`. This project now has a Vercel Blob private-storage foundation.

How it works:

- `/api/unlock` can return a short-lived `unlockToken` when `UNLOCK_TOKEN_SECRET` is configured.
- The token expires after about 15 minutes.
- The token does not contain secret answers or the secret message.
- `/api/memory-images` validates the token and lists private Vercel Blob image metadata when private images are enabled.
- `/api/memory-image` validates the token, prefix, and file extension, then proxies the private image response to the browser.
- The frontend only requests private images after unlock and never receives `BLOB_READ_WRITE_TOKEN`.

Vercel setup:

1. Create a Vercel Blob store with Private access.
2. Connect it to the Vercel project so `BLOB_READ_WRITE_TOKEN` is available in environment variables.
3. Set `UNLOCK_TOKEN_SECRET` to a long random value.
4. Set `PRIVATE_MEMORY_IMAGES_ENABLED=true`.
5. Set `MEMORY_IMAGES_PREFIX=memories/`.
6. Upload private images to the Blob store under that prefix, for example `memories/photo-1.jpg`.
7. Use only `.jpg`, `.jpeg`, `.png`, `.webp`, or `.gif` images.

This protects against direct public URL access, but the intended viewer can still screenshot or save anything visible in their browser.

## Phase 2 Music Options

For the best background-music UX, prefer a short compressed MP3 or hosted audio file over a YouTube embed. MP3/audio gives cleaner play/pause/loop/volume control and avoids iframe UI or YouTube branding.

If the audio is safe to publish and small, `public/audio/background-music.mp3` is fine. If you do not want to commit the file to GitHub, host it from storage/CDN and load it with `VITE_BACKGROUND_MUSIC_URL`.

Treat YouTube as an optional fallback or external link, not the main seamless background music implementation.

## Cover Animation

The previous static cover title/emblem has been replaced with a lightweight R3F crab-shaped constellation layer attached to the cover surface. The first closed-book click forms the emblem; the second click opens the book. The effect is decorative only and does not affect the secure unlock flow.

## Test Unlock API Locally

PowerShell example:

```powershell
$body = @{ answer1 = "your_first_answer_here"; answer2 = "your_second_answer_here" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:5173/api/unlock" -Method Post -ContentType "application/json" -Body $body
```

The response returns `success: true` and the secret message only when both answers match the environment variables. If `UNLOCK_TOKEN_SECRET` is configured, it also returns `unlockToken` and `unlockTokenExpiresAt`. Incorrect answers return a generic friendly message and never leak correct answers.

Test future private image foundation after unlock:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5173/api/memory-images" -Headers @{ Authorization = "Bearer your_unlock_token_here" }
```

If `PRIVATE_MEMORY_IMAGES_ENABLED=false`, this endpoint returns an empty/not-configured response. If private images are enabled and Vercel Blob is configured, it returns safe image metadata only.

Test a proxied private image after listing metadata:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:5173/api/memory-image?token=your_unlock_token_here&pathname=memories%2Fphoto-1.jpg"
```

## Deploy on Vercel

- Build command: `npm run build`
- Output directory: `dist`
- API endpoint: `/api/unlock`
- Add these environment variables in Vercel project settings:
  - `SECRET_ANSWER_1`
  - `SECRET_ANSWER_2`
  - `SECRET_MESSAGE`
  - `UNLOCK_TOKEN_SECRET` for private image access tokens
  - `PRIVATE_MEMORY_IMAGES_ENABLED=true` when Vercel Blob private images are ready
  - `BLOB_READ_WRITE_TOKEN` from the connected Vercel Blob store
  - `MEMORY_IMAGES_PREFIX=memories/`
  - Optional public music URL: `VITE_BACKGROUND_MUSIC_URL`
- Add `public/audio/background-music.mp3` before deployment only if the file is rights-cleared and intentionally public.
- Add only safe public placeholder images under `public/images/memories/`.
- No database, auth provider, or persistent backend storage is required.
