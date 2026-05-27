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
```

`.env.local` is correct for local secrets because Vite does not expose non-`VITE_` variables to browser code. The serverless API and the local Vite middleware can read these values on the server side, but the React frontend cannot.

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

Place an optional background music file at:

```text
public/audio/background-music.mp3
```

The browser will not autoplay it. Use the small music button to play or pause. If the file is missing, the app disables the control gracefully.

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

## Phase 2 Private Images

Images in `public/` are not private. Do not place sensitive photos there.

For private memory photos, keep real images out of GitHub and out of `public/`. Use private object storage such as Vercel Blob private storage, AWS S3 private buckets, or a similar service. After unlock, a future serverless endpoint can validate an unlock token and return a short-lived signed URL or proxy the private image.

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

The response returns `success: true` and the secret message only when both answers match the environment variables. Incorrect answers return a generic friendly message and never leak correct answers.

## Deploy on Vercel

- Build command: `npm run build`
- Output directory: `dist`
- API endpoint: `/api/unlock`
- Add these environment variables in Vercel project settings:
  - `SECRET_ANSWER_1`
  - `SECRET_ANSWER_2`
  - `SECRET_MESSAGE`
- Add `public/audio/background-music.mp3` before deployment if music is desired.
- Add memory images under `public/images/memories/` if desired.
- No database, auth provider, or persistent backend storage is required.
