# 3D Birthday Book Project Status

## 1. Project Overview

A fullscreen magical 3D birthday book experience. The receiver opens a keepsake book, flips through greeting and memory pages by clicking the pages themselves, discovers a subtle locked page, unlocks private secret pages through `/api/unlock`, and reads the secret message inside the 3D book.

## 2. Current Status

- Overall status: Complete
- Last updated timestamp: 2026-05-28 14:17 ACST
- Current working state: Closed-book interaction redesign completed. The book now starts with drifting cover particles, first click forms the crab-inspired Cancer emblem, and second click opens the book while existing book, unlock, music, and private image flows remain intact.

## 3. Completed Work

- [x] Repository inspected
- [x] Dependencies checked
- [x] 3D book scene created
- [x] Basic greeting added
- [x] Secret unlock form added
- [x] API endpoint added
- [x] Environment variable example added
- [x] Unlock success/error states added
- [x] Mobile responsiveness checked
- [x] Build/test completed
- [x] Visible Back/Next/Turn Page overlays removed
- [x] Page navigation changed to click/tap right page forward and left page backward
- [x] Writing/reply page removed
- [x] Reply localStorage logic removed
- [x] Secret message kept inside book pages
- [x] Magical sparkle/light effects added
- [x] README updated
- [x] Phase 2 music strategy added
- [x] YouTube documented as not recommended for primary background music
- [x] `VITE_BACKGROUND_MUSIC_URL` public hosted MP3 option added
- [x] Media `.gitignore` safety added
- [x] Private image strategy documented
- [x] Unlock token foundation added
- [x] Vercel Blob dependency added
- [x] `/api/memory-images` token-gated Vercel Blob listing endpoint added
- [x] `/api/memory-image` token-gated private image proxy endpoint added
- [x] Local public `public/audio/background-music.mp3` explicitly allowed by `.gitignore`
- [x] Old closed-cover “Birthday Book” text removed
- [x] Old circular cover emblem removed
- [x] Animated Cancer constellation cover added
- [x] Floating-points-to-constellation sequence added
- [x] Closed-cover hover shimmer/brightening added
- [x] Click-open cover sparkle burst added
- [x] Abstract constellation layout replaced with a crab-inspired Cancer emblem
- [x] Crab body, claws, and legs represented with mirrored constellation stars and lines
- [x] Oversized bubble-like star halos reduced
- [x] Two-step closed-book interaction added
- [x] Initial floating star-orbs around the cover added
- [x] First closed-book click now forms the Cancer crab emblem without opening the book
- [x] Second closed-book click opens the book after formation completes

## 4. Files Changed

| File | Change Summary | Reason |
| ---- | -------------- | ------ |
| `src/App.jsx` | Added cover awakened/formed state and callback wiring. | Supports first-click formation and second-click opening without changing the open-book flow. |
| `src/components/BirthdayBookScene.jsx` | Added closed-book click gating for unawakened/forming/formed cover states and passed cover state into the constellation. | First click forms the emblem; second click opens only after formation completes. |
| `src/components/CoverConstellation.jsx` | Replaced abstract constellation with a 14-star crab-inspired Cancer emblem, outside drifting orbs, click-triggered inward formation, smaller halos, hover shimmer, idle twinkle, dust particles, and click-open burst. | Makes the closed cover interaction visible, intentional, and clearly Cancer / Cu Giai inspired. |
| `src/components/PageTurnControls.jsx` | Replaced visible Back/Turn buttons with invisible page hit areas and subtle hover edge glow. | Keeps navigation natural and uncluttered. |
| `src/components/BookPage.jsx` | Removed reply page rendering and reduced unlocked-page label clutter. | Keeps focus on greeting, memory, locked hint, and secret pages. |
| `src/components/MagicPageEffect.jsx` | Added reusable R3F sparkle/shimmer effect. | Provides magical feedback on open, page turn, unlock, and first secret reveal. |
| `src/components/MemoryHotspot.jsx` | Kept optional memory hotspots and graceful lightbox trigger. | Memory images remain optional without breaking navigation. |
| `src/components/WritingPage.jsx` | Deleted. | Writing/reply feature was removed by request. |
| `src/styles.css` | Removed writing and visible page-button CSS; kept compact memory hotspot styling. | Removes unused UI and visual clutter. |
| `README.md` | Documented the first-click awaken and second-click open cover interaction. | Keeps documentation aligned with current UX. |
| `BIRTHDAY_BOOK_PROJECT_STATUS.md` | Updated current redesign status, two-step cover interaction, files changed, testing, and limitations. | Required progress tracking. |
| `src/components/MusicControl.jsx` | Added `VITE_BACKGROUND_MUSIC_URL` support with local MP3 fallback. | Allows hosted public MP3 music without committing audio. |
| `api/_unlockToken.js` | Added short-lived HMAC unlock token helper. | Foundation for future private memory image access without a database. |
| `api/unlock.js` | Optionally returns `unlockToken` when `UNLOCK_TOKEN_SECRET` is configured. | Keeps normal unlock working while enabling future private image APIs. |
| `api/memory-images.js` | Added token-protected Vercel Blob metadata listing with feature-flag and storage checks. | Lists private images only after unlock without exposing Blob credentials. |
| `api/memory-image.js` | Added token-protected private image proxy endpoint with prefix and extension validation. | Serves private Blob images through the API instead of exposing permanent URLs. |
| `vite.config.js` | Added local dev middleware for `/api/memory-images` and `/api/memory-image`. | Allows local testing of private image endpoints. |
| `.env.example` | Added `UNLOCK_TOKEN_SECRET`, `PRIVATE_MEMORY_IMAGES_ENABLED`, `MEMORY_IMAGES_PREFIX`, `BLOB_READ_WRITE_TOKEN`, and `VITE_BACKGROUND_MUSIC_URL` placeholders. | Documents Phase 2 env configuration safely. |
| `.gitignore` | Allows only `public/audio/background-music.mp3` plus media README files; ignores other public audio and memory images. | Allows the confirmed public music file while preventing accidental private media commits. |
| `public/audio/README.md` | Documented that `background-music.mp3` is intentionally public if committed. | Clarifies rights and deployment visibility. |
| `public/images/memories/README.md` | Documented Vercel Blob private storage requirement for personal photos. | Clarifies public folder is not private. |
| `package.json` | Added `@vercel/blob`. | Required for Vercel Blob listing and private image retrieval. |
| `package-lock.json` | Locked `@vercel/blob`. | Keeps installs reproducible. |

## 5. Key Technical Decisions

- Page navigation is handled by clicking the open book itself: right half goes forward, left half goes backward.
- Visible page navigation labels/buttons were removed; only a subtle edge glow appears on desktop hover.
- The writing/reply page was removed completely, including state persistence and component code.
- `/api/unlock` remains the security boundary. The frontend does not contain secret answers or the secret message before successful unlock.
- Secret text is normalized and paginated after the API returns it, preserving Vietnamese characters and escaped newlines.
- `MagicPageEffect` uses lightweight R3F particles and a subtle shimmer instead of heavy post-processing.
- Reduced-motion users receive fewer particles and shorter movement.
- Music uses `VITE_BACKGROUND_MUSIC_URL` only for public hosted MP3 URLs; otherwise it falls back to `/audio/background-music.mp3`.
- YouTube is not used as the primary music source because it requires an iframe/player and is not a clean `<audio>` source.
- The confirmed local music file `public/audio/background-music.mp3` is allowed to be committed if it is rights-cleared and intentionally public.
- Other public audio files and all public memory images are ignored by default to prevent accidental private media commits.
- Private images use Vercel Blob private storage. The API validates a short-lived unlock token, lists safe metadata, and proxies image bytes through `/api/memory-image`.
- `BLOB_READ_WRITE_TOKEN` is server-only and must never use a `VITE_` prefix.
- The closed cover constellation is a 3D layer attached to the cover pivot, not a separate HTML overlay, so it stays visually connected to the book as the cover opens.
- The closed-book state model now separates unawakened, forming, formed, and open behavior.
- The first closed-book click awakens the cover instead of opening the book.
- The second closed-book click opens the book only after formation completes.
- The cover emblem now uses a crab-like structure: compact central shell stars, mirrored upper claw stars, and lower leg extensions.
- Initial unawakened particles are positioned outside the cover-emblem area and drift around the cover edges.
- The constellation forms once from outside drifting star-orbs into the crab-inspired layout and then remains in a subtle idle state to avoid a distracting repeating loop.
- Formation is staggered so the body resolves first, then claws and legs become readable.
- Reduced-motion mode skips most formation movement and settles the constellation quickly.

## 6. Bugs / Issues Found

| Issue | Status | Fix |
| ----- | ------ | --- |
| Page navigation looked messy with visible Back/Turn overlays. | Fixed | Removed visible navigation buttons and page-count labels. |
| Page navigation needed to feel like a real book. | Fixed | Open-book clicks now route by left/right page side. |
| Writing/reply feature no longer matched the desired experience. | Fixed | Removed reply page, localStorage logic, component, and CSS. |
| Sparkle particles initially looked too large. | Fixed | Reduced particle size, opacity, and count for a subtler premium effect. |
| Left-page back navigation was unreliable with narrow hit meshes. | Fixed | Moved navigation decision to the root book click handler. |
| Build reports a large JS chunk warning because Three.js/R3F are sizeable. | Not blocking | Build succeeds; future code splitting can reduce the warning. |
| Real media could be accidentally committed from `public/`. | Fixed | `.gitignore` allows only README docs and the confirmed `public/audio/background-music.mp3`; other public audio/memory images stay ignored. |
| Private images need protection from direct public URLs. | Fixed for Phase 2 foundation | Added token helper, `/api/memory-images` metadata listing, and `/api/memory-image` proxy endpoint for Vercel Blob private storage. |
| YouTube was considered for music. | Documented | Kept YouTube out of implementation and documented it as a fallback/link only. |
| Private image endpoints could expose paths outside the intended prefix. | Fixed | Added prefix, path traversal, backslash, and image-extension checks. |
| Closed cover looked static and generic. | Fixed | Removed the old title/ring and added the animated Cancer constellation cover. |
| Cover animation needed to feel attached to the book. | Fixed | Rendered stars, lines, shimmer, and particles inside the cover pivot group on the cover surface. |
| Cancer constellation still read too abstractly. | Fixed | Rebuilt the star layout as a stylised crab silhouette with body, claws, and legs. |
| Star halos looked too bubble-like. | Fixed | Reduced halo scale and opacity around the main stars. |
| Cover animation did not feel intentional enough. | Fixed | Added visible initial floating star-orbs and a first-click inward formation sequence. |
| First click opened the book too quickly to show the cover magic. | Fixed | First click now forms the emblem; second click opens after formation completes. |

## 7. Remaining Tasks

- [ ] Confirm the exact `public/audio/background-music.mp3` file is rights-cleared before staging it.
- [ ] Add only safe public placeholder images at `public/images/memories/memory-1.jpg` and `memory-2.jpg`, or keep real images in private storage.
- [ ] Tune final page text density after final real greeting/secret copy is chosen.
- [ ] Optional: code-split the 3D scene to reduce the build chunk warning.
- [ ] Configure real Vercel Blob private storage in Vercel and upload private images under `MEMORY_IMAGES_PREFIX`.
- [ ] Optional: tune crab-emblem proportions after visual review on the final device.

## 8. How to Run Locally

Install dependencies:

```bash
npm install
```

Create `.env.local`:

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

Run the dev server:

```bash
npm run dev
```

Test unlock API locally:

```powershell
$body = @{ answer1 = "your_first_answer_here"; answer2 = "your_second_answer_here" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:5173/api/unlock" -Method Post -ContentType "application/json" -Body $body
```

Test interactions:

- Watch the initial closed cover: glowing star-orbs drift around the cover edges.
- Click/tap the closed book once; it should stay closed while particles gather into a crab-inspired Cancer emblem.
- Wait for the lines and emblem to settle.
- Click/tap the closed book again; it should trigger a small cover sparkle burst and open.
- Hover the closed book on desktop to see a restrained shimmer and brighter claw/body stars.
- Click/tap the pink cover to close it.
- Click/tap the right page to go forward.
- Click/tap the left page to go backward.
- Tap the subtle glowing lock inside the book to open the unlock modal.
- Submit incorrect answers, then correct answers.
- Continue with right-page clicks to reach the secret pages.
- Click memory hotspot dots to open the lightbox.
- Use the music button; missing audio should not crash the app.
- Test hosted music by setting `VITE_BACKGROUND_MUSIC_URL` to a public MP3 URL and restarting the dev server.
- Test `/api/memory-images` with a valid unlock token; it returns empty/not-configured while `PRIVATE_MEMORY_IMAGES_ENABLED=false`.
- Test `/api/memory-image` with a valid unlock token and a safe pathname after Vercel Blob is configured.

## 9. How to Deploy

Vercel deployment notes:

- Add `SECRET_ANSWER_1`, `SECRET_ANSWER_2`, and `SECRET_MESSAGE` in Vercel project environment variables.
- Build command: `npm run build`
- Output directory: `dist`
- API endpoint: `/api/unlock`
- Optional local public music path: `public/audio/background-music.mp3`
- Optional public hosted music URL: `VITE_BACKGROUND_MUSIC_URL`
- Optional public memory placeholder path: `public/images/memories/`
- Private image token secret: `UNLOCK_TOKEN_SECRET`
- Private image feature flag: `PRIVATE_MEMORY_IMAGES_ENABLED=true` when Blob is ready
- Private image Blob token: `BLOB_READ_WRITE_TOKEN`
- Private image prefix: `MEMORY_IMAGES_PREFIX=memories/`
- No database, auth provider, or persistent backend storage is required.

## 10. Final Verification

- npm install completed: Yes, dependencies are installed.
- npm run dev checked: Yes, fresh Vite server returned HTTP 200 on local port 5183.
- npm run build checked: Yes, build completed successfully.
- App loads: Yes, local HTTP smoke test returned the app shell successfully.
- Closed cover text removed: Yes, source check confirms visible cover “Birthday Book” text was removed.
- Old circular cover emblem removed: Yes, source check confirms `ringGeometry` is no longer used in the scene.
- Crab-inspired Cancer cover added: Yes, `CoverConstellation` is attached to the cover pivot and uses a body/claw/leg star layout.
- Abstract constellation replaced: Yes, the prior six-star zigzag layout was replaced with a 14-star crab crest.
- Initial floating particles added: Yes, unawakened stars drift around the cover edges before the first click.
- First click does not open the book: Yes, closed-book click wakes the cover when `coverAwakened` is false.
- First click forms crab emblem: Yes, stars interpolate from outside drifting positions into staggered crab body, claw, and leg targets.
- Constellation lines fade in cleanly: Yes, body lines appear first, followed by claw and leg lines.
- Emblem remains visible before opening: Yes, the book stays closed after formation and waits for the second click.
- Second click opens the book: Yes, opening is gated until `coverFormed` is true.
- Idle constellation animation added: Yes, formed stars twinkle, lines shimmer, and dust particles drift subtly.
- Hover effect added: Yes, cover hover brightens stars/lines and increases shimmer.
- Click-open sparkle burst added: Yes, closed-book click increments `openBurstKey` before opening.
- Book opens by clicking book: Yes.
- Pink cover closes book: Previously verified and code path unchanged except navigation cleanup.
- No large Back/Next/Turn overlays remain: Yes, DOM/source checks found no visible page-corner buttons or removed labels.
- Right page goes forward: Yes, verified by reaching the locked page.
- Left page goes backward: Yes, verified by returning from the locked page before reopening it.
- Page turn animation works: Yes, existing turn sheet remains and natural click path triggers it.
- Hidden unlock flow works: Yes, glowing in-book lock opens the modal.
- Incorrect answers show friendly error: Yes.
- Correct answers unlock secret pages: Yes.
- Secret appears inside book only: Yes, DOM check confirmed the secret was not present as external text.
- Long secret pagination remains: Yes, pagination utility unchanged from previous verified flow.
- Writing/reply page removed: Yes, component deleted and DOM/source checks found no reply textarea.
- Sparkles on open/page turn/unlock/secret reveal: Yes, `MagicPageEffect` is wired to all four triggers and browser run showed no runtime errors.
- Music control checked: Yes, control remains stable when audio is missing.
- Image hotspots checked: Yes, memory hotspot behavior remains available with graceful missing-image fallback.
- Mobile layout checked: Yes, previous mobile fit changes remain; natural page clicks use the same Canvas click model.
- No secrets exposed in frontend code: Yes, source/build searches found no server secret env usage in frontend files.
- Known limitations: Build emits a non-fatal large chunk warning due to Three.js/R3F.
- Phase 2 music strategy checked: Yes, configurable public MP3 URL plus confirmed local public MP3 fallback.
- Phase 2 private image foundation checked: Yes, token helper, Vercel Blob metadata listing, and private image proxy endpoint added.
- Private image API checked: Yes, no-token access returns 401, disabled config returns a safe empty response, missing Blob token returns a safe server error, and unsafe paths return 400.
- Media gitignore checked: Yes, `public/audio/background-music.mp3` is allowed; other public audio and public memory image files remain ignored.
- YouTube primary music checked: Not implemented by design.
- Phase 3 closed-book star animation: Implemented as animated crab-inspired Cancer constellation cover sequence.
