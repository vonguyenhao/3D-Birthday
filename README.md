# 3D Birthday Book

A fullscreen magical 3D birthday book built with Vite, React, React Three Fiber, Drei, and Framer Motion.

The book opens by clicking/tapping the closed cover. After it opens, click the right page to go forward and click the left page to go back. Secret pages unlock through `/api/unlock` and render only inside the 3D book.

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
VITE_BACKGROUND_MUSIC_URL=
```

`.env.local` is correct for local secrets because Vite does not expose non-`VITE_` variables to browser code. The serverless API and the local Vite middleware can read these values on the server side, but the React frontend cannot.

`VITE_BACKGROUND_MUSIC_URL` is the exception: it is safe only for a public music URL because every `VITE_` variable is exposed to browser code. Never put answers, secret messages, tokens, or private media URLs in a `VITE_` variable.

## Long Secret Messages

`SECRET_MESSAGE` can be long and can include Vietnamese text. Escaped newlines are supported:

```bash
SECRET_MESSAGE=your_first_secret_line_here\nyour_second_secret_line_here
```

After successful unlock, the frontend receives the message from `/api/unlock`, converts escaped `\n` into real line breaks, and paginates the message across secret book pages.

## Book Interactions

- Click/tap the closed book to open it.
- Click/tap the pink cover to close it.
- Click/tap the right page to move forward.
- Click/tap the left page to move backward.
- Find the subtle glowing lock inside the book and tap it to open the unlock modal.
- After successful unlock, continue with normal right-page navigation to reach the secret pages.

Opening the book, turning pages, unlocking the secret, and reaching the secret pages trigger subtle gold/white/pink sparkle effects.

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

Do not push real music files unless they are rights-cleared and intentionally public. Real audio files under `public/audio/` are ignored by git by default, except `public/audio/README.md`.

YouTube is not recommended as the primary background music source. It is not a direct audio file, cannot be used cleanly as an `<audio>` source, requires a heavier iframe/player, may show YouTube UI/branding, and still needs manual user interaction. Treat YouTube as an optional external link or fallback only.

## Optional Memory Images

Place optional memory photos in:

```text
public/images/memories/
```

The sample hotspots look for:

```text
public/images/memories/memory-1.jpg
public/images/memories/memory-2.jpg
```

If an image is missing, the lightbox shows a friendly fallback instead of crashing. Files in `public` are served directly by the browser and are not secret, so do not put private images there unless they are safe to publish.

Real image files under `public/images/memories/` are ignored by git by default, except `public/images/memories/README.md`.

## Phase 2 Private Images

Images in `public/` are not private. Do not place sensitive photos there.

For private memory photos, keep real images out of GitHub and out of `public/`. Use private object storage such as Vercel Blob private storage, AWS S3 private buckets, or a similar service.

Phase 2 foundation:

- `/api/unlock` can return a short-lived `unlockToken` when `UNLOCK_TOKEN_SECRET` is configured.
- The token expires after about 15 minutes.
- The token does not contain secret answers or the secret message.
- `/api/memory-images` validates the token and currently returns an empty/not-configured response.
- A future implementation can connect `/api/memory-images` to private storage and return signed URLs or proxy image responses.

This protects against direct public URL access, but the intended viewer can still screenshot or save anything visible in their browser.

## Phase 2 Music Options

For the best background-music UX, prefer a short compressed MP3 or hosted audio file over a YouTube embed. MP3/audio gives cleaner play/pause/loop/volume control and avoids iframe UI or YouTube branding.

If the audio is safe to publish and small, `public/audio/background-music.mp3` is fine. If you do not want to commit the file to GitHub, host it from storage/CDN and load it from a configured URL in a future phase.

Treat YouTube as an optional fallback or external link, not the main seamless background music implementation.

## Phase 3 Idea

Future enhancement: while the book is closed on first load, add subtle stars around the cover, faint page-edge glow, and occasional sparkle near the spine. Keep it calm and inviting, without extra text or loud animation.

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

Until private image storage is configured, this endpoint returns an empty/not-configured response.

## Deploy on Vercel

- Build command: `npm run build`
- Output directory: `dist`
- API endpoint: `/api/unlock`
- Add these environment variables in Vercel project settings:
  - `SECRET_ANSWER_1`
  - `SECRET_ANSWER_2`
  - `SECRET_MESSAGE`
- `UNLOCK_TOKEN_SECRET` for future private image access tokens
- `PRIVATE_MEMORY_IMAGES_ENABLED=false` until private image storage is implemented
- Optional public music URL: `VITE_BACKGROUND_MUSIC_URL`
- Add `public/audio/background-music.mp3` before deployment only if the file is rights-cleared and intentionally public.
- Add only safe public placeholder images under `public/images/memories/`.
- No database, auth provider, or persistent backend storage is required.
