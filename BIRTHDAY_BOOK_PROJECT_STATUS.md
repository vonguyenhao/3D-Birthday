# 3D Birthday Book Project Status

## 1. Project Overview

A fullscreen magical 3D birthday book experience. The receiver opens a keepsake book, reads greeting and memory pages, taps a subtle in-book secret mark, opens a sealed wax-stamped envelope to answer unlock questions through `/api/unlock`, then watches the book dissolve into stardust as the secret message appears in readable ember-glow sections in the air.

## 2. Current Status

- Overall status: Complete
- Last updated timestamp: 2026-05-31 02:48 ACST
- Current working state: Interaction bug pass completed. The dissolve remains a temporary cinematic state; Back to book restores the open book, page flipping is backed by invisible left/right page hit zones, and the hidden seal remains available after unlock so the already-unlocked secret can replay without another API call.

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
- [x] Secret message removed from book pages
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
- [x] Background/outside clicks no longer turn pages
- [x] Page turning restricted to left/right page hit areas
- [x] Unlock modal redesigned as a parchment-style secret letter
- [x] Vietnamese modal text encoding fixed
- [x] Hidden unlock mark made available from the open book without flipping to a hidden page
- [x] Magical book burn/dissolve reveal added
- [x] Secret message appears in the air in staged readable chunks after unlock
- [x] Secret page generation removed
- [x] Secret reveal close/back control added
- [x] Escape key closes the secret reveal
- [x] Secret reveal replay control added
- [x] Show full message control added
- [x] Secret message reveal changed from giant scroll block to staged readable chunks
- [x] Unlock modal refined into a less boxy parchment letter
- [x] Unlock modal vertical height reduced
- [x] Secret reveal timing slowed to roughly 7 seconds per section
- [x] Reveal timing constants added
- [x] Hidden unlock changed from immediate form to sealed envelope flow
- [x] Wax-seal click/tap opens the unlock letter
- [x] Unlock questions appear only after envelope opens
- [x] Correct unlock fades the letter before book dissolve
- [x] Secret reveal text restyled with warm ember/fire glow
- [x] Shared NFC/grapheme text utility added
- [x] Vietnamese text rendering protected from combining-mark splitting
- [x] Page text raycasting disabled so page clicks reach turn controls
- [x] Disabled page-turn hit planes removed so they do not block interactions
- [x] Book dissolve changed to temporary/non-destructive reveal state
- [x] Back to book restores the open book and saved page index
- [x] Page flipping works after returning from secret reveal
- [x] Hidden mark remains visible after unlock
- [x] Hidden mark replays existing unlocked secret without another API call
- [x] Closed-book click target made reliable with an invisible book-area hit button
- [x] Page flipping made persistent with invisible left/right page hit buttons
- [x] Hidden/replay seal made persistent with an invisible seal hit button
- [x] Removed fragile `coverFormed` state dependency from opening behavior

## 4. Files Changed

| File | Change Summary | Reason |
| ---- | -------------- | ------ |
| `src/App.jsx` | Added saved reveal return page state, robust spread-index clamping, non-destructive reveal close restoration, unlocked-secret replay routing, and invisible DOM hit zones for closed-book activation, page turns, and hidden seal replay. | Back to book restores the visible open book and page flipping, while the already unlocked secret can be replayed without another API call. |
| `src/components/BirthdayBookScene.jsx` | Added persistent in-book secret/replay mark, book burn/dissolve particles, interaction freeze during reveal, temporary book disappearance only while the reveal overlay is active, narrowed the pink-cover close hit area, and added reliable 3D cover/mark hit targets. | Unlock/replay remains accessible from the open book and success releases the message cinematically without permanently removing the book. |
| `src/components/CoverConstellation.jsx` | Replaced abstract constellation with a 14-star crab-inspired Cancer emblem, outside drifting orbs, click-triggered inward formation, smaller halos, hover shimmer, idle twinkle, dust particles, and click-open burst. | Makes the closed cover interaction visible, intentional, and clearly Cancer / Cu Giai inspired. |
| `src/components/PageTurnControls.jsx` | Replaced flat page-turn planes with shallow page-sized hit volumes, stopped click propagation, and rendered only enabled hit targets. | Page turns remain bound to actual active page interaction areas, and inactive areas do not block other clicks. |
| `src/components/BookPage.jsx` | Removed obsolete locked-secret page mark rendering, normalized title/body text before display, and disabled text raycasting. | The secret flow no longer uses a hidden book page, Vietnamese text stays composed, and page clicks reach the turn controls. |
| `src/components/SecretRevealScene.jsx` | Replaced the old continuous reveal paragraph with sentence/line chunking, staged section reveal, Back to book, Replay, Show full message, Escape close, completed-message section controls, named 7-second pacing constants, and grapheme-aware chunk sizing. | Displays the unlocked secret romantically without rushing, breaking Vietnamese accents, or using a giant scrollable text block. |
| `src/components/MagicPageEffect.jsx` | Added reusable R3F sparkle/shimmer effect. | Provides magical feedback on open, page turn, unlock, and first secret reveal. |
| `src/components/MemoryHotspot.jsx` | Kept optional memory hotspots and graceful lightbox trigger. | Memory images remain optional without breaking navigation. |
| `src/components/WritingPage.jsx` | Deleted. | Writing/reply feature was removed by request. |
| `src/components/UnlockModal.jsx` | Rebuilt the unlock overlay as a sealed-envelope state flow: `sealed`, `opening`, `opened`, submitting/error, and `success`, while preserving the same answer payload and `/api/unlock` call. | Removes the immediate web-form feeling and makes hidden unlock feel like opening a secret letter. |
| `src/utils/text.js` | Added `normalizeDisplayText`, `splitGraphemes`, and `graphemeLength` using `Intl.Segmenter` with fallback. | Prevents Vietnamese combining marks from being split during pagination or reveal layout. |
| `src/utils/paginateText.js` | Uses NFC normalization and grapheme-aware word splitting/length checks. | Keeps Vietnamese text intact when wrapping/paginating page content. |
| `src/styles.css` | Added burgundy parchment envelope, wax seal, opening flap animation, unfolded letter styling, writing-line inputs, ember/fire sky-message text styling, and invisible interaction hit buttons for closed book/page/seal clicks. | Makes the unlock and final reveal feel more magical while keeping book interactions reliable and visually uncluttered. |
| `README.md` | Documented the sealed-envelope unlock flow, wax-seal interaction, dissolve transition, and slower ember-message reveal. | Keeps documentation aligned with current UX. |
| `BIRTHDAY_BOOK_PROJECT_STATUS.md` | Updated current redesign status, secret reveal flow, files changed, testing, and limitations. | Required progress tracking. |
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

- Page navigation is backed by invisible left/right DOM hit areas aligned to the open paper pages, with R3F page hit volumes retained as scene-level support.
- The open-book root group no longer infers page turns from generic click coordinates.
- The secret unlock mark is now a persistent subtle seal on the open book, so the user does not need to flip to a hidden page.
- Successful `/api/unlock` moves the app into `burning`, then `message`, instead of appending secret pages to the page model.
- During the burn/dissolve reveal, page and orbit interactions are disabled and the book shrinks/fades out behind magical embers, but this is only temporary.
- Back to book sets `revealStage` back to `idle`, reopens the book, restores/clamps the saved normal page index, and re-enables page controls.
- The hidden seal remains visible after unlock; in the unlocked state it acts as a replay trigger using the already stored `secretMessage`.
- The secret message is split into readable chunks after the book disappears, preserving Vietnamese characters and escaped line breaks.
- `SecretRevealScene` uses named timing constants: `INTRO_DELAY_MS`, `REVEAL_CHUNK_DELAY_MS`, `SHORT_SECTION_DELAY_MS`, `LONG_SECTION_DELAY_MS`, and `LINE_FADE_DURATION_MS`.
- The default reveal section pause is 7000ms, with shorter pauses for very small sections and longer pauses for full sections.
- Long completed messages use small section navigation instead of an internal scrollbar.
- Reveal controls are frontend-only and reuse the already unlocked message; Replay does not call `/api/unlock` again.
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
- The second closed-book click opens the book after the cover has been awakened; opening no longer depends on the visual formation callback timing.
- The cover emblem now uses a crab-like structure: compact central shell stars, mirrored upper claw stars, and lower leg extensions.
- Initial unawakened particles are positioned outside the cover-emblem area and drift around the cover edges.
- The constellation forms once from outside drifting star-orbs into the crab-inspired layout and then remains in a subtle idle state to avoid a distracting repeating loop.
- Formation is staggered so the body resolves first, then claws and legs become readable.
- Reduced-motion mode skips most formation movement and settles the constellation quickly.
- The unlock overlay keeps the same `/api/unlock` flow, but the user first sees a CSS-built sealed envelope. The form is not rendered until the envelope enters the opened state.
- The unlock component models `sealed`, `opening`, `opened`, submitting/error, and `success` states locally; success delays the existing `onUnlocked` callback briefly so the letter can fade before book dissolve starts.
- The final secret text uses ember-colored text shadows, flicker, and warm active-line sparkles while keeping the 7-second section pacing.
- User-facing dynamic text is normalized with `String(value).normalize('NFC')` before display where it is processed.
- Text length and long-word splitting use grapheme clusters via `Intl.Segmenter('vi', { granularity: 'grapheme' })` with `Array.from` fallback.
- Drei page text is made non-raycastable so clicking text on a page still triggers the active page-turn hit area behind it.

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
| Empty scene/background clicks could turn pages. | Fixed | Removed generic root-level open-book page-turn logic and moved navigation callbacks to page hit meshes only. |
| Unlock modal felt like a generic web popup. | Fixed | Restyled it as a parchment/secret-letter note with border details, warm paper color, seal, and corrected Vietnamese copy. |
| Secret flow depended on flipping to hidden pages. | Fixed | Removed secret pages and added a persistent in-book secret mark available from the open spread. |
| Page turning was blocking reliable access to the hidden page. | Fixed | Secret access no longer depends on page navigation. |
| Secret reveal needed to feel more cinematic. | Fixed | Added magical book dissolve and staged glowing sky-message reveal. |
| Secret reveal could not be exited. | Fixed | Added Back to book plus Escape key handling. |
| Secret reveal looked like a giant scrolling text document. | Fixed | Replaced the scrollable paragraph with chunked staged sections, active-line shimmer, and completed-message section navigation. |
| Typewriter reveal felt rough for long text. | Fixed | Reveals sentence/line chunks with fade/rise motion and a Show full message option. |
| Unlock modal still felt too much like a web form. | Fixed | Reduced title/form weight, removed boxed question cards, added paper writing lines, softened the submit button, and reduced vertical height. |
| Secret reveal advanced too quickly. | Fixed | Auto-advance now waits around 7 seconds per readable section, with named constants for future tuning. |
| Unlock experience still felt like a modal form. | Fixed | Hidden mark now shows a sealed envelope first; the wax seal opens an unfolded parchment letter before the form appears. |
| Final sky message needed more fire/ember emotion. | Fixed | Warmed text colors, glow, active-line shimmer, and subtle ember flicker. |
| Vietnamese accents could render as separated combining marks when text was processed. | Fixed | Added NFC normalization and grapheme-safe splitting/length checks across pagination, book page text, unlock letter text, and secret reveal chunks. |
| Page flipping became unreliable after interaction changes. | Fixed | Disabled page text raycasting and removed inactive hit planes so active left/right page hit areas receive clicks reliably. |
| Book stayed gone after the cinematic secret reveal. | Fixed | Back to book now resets reveal state to idle, forces the book open, and restores a valid saved page index. |
| Hidden mark disappeared after unlock. | Fixed | Hidden mark is always rendered while the book is open and not revealing; after unlock it becomes a replay seal. |
| Replaying the secret required answering again. | Fixed | Clicking the unlocked seal starts the reveal with the stored secret message and does not call `/api/unlock`. |
| Closed-book second click could miss because cover constellation raycasts did not always bubble to the open handler. | Fixed | Added a closed-only invisible book-area hit button and removed the fragile `coverFormed` gate. |
| Page flipping could remain unreliable after returning from reveal because 3D page raycasts competed with cover/page scene meshes. | Fixed | Added invisible left/right page hit buttons that remount whenever the book is open and `revealStage` is idle. |
| Hidden/replay seal could be visually present but hard to click after unlock. | Fixed | Added an invisible seal hit button above the page hit zones; the unlocked seal routes directly to stored-message replay. |

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
- Click/tap on visible page text as well as blank paper; page flipping should still work through the active page hit area.
- Click/tap empty background or outside the book; pages should not turn.
- Tap the subtle glowing secret mark inside the open book to show the sealed envelope.
- Tap the wax seal/envelope and confirm the letter opens before questions appear.
- Confirm the opened letter appears as parchment, not a standard modal form.
- Submit incorrect answers, then correct answers.
- After correct answers, confirm the modal closes, the book dissolves, and the secret message appears in the air in readable glowing chunks.
- Use Show full message to complete a long reveal, then use Earlier/Later to review completed sections.
- Confirm each reveal section remains visible for about 7 seconds before auto-advancing.
- Click Back to book or press Escape after the reveal; the open book should return on the same valid spread.
- After returning, flip pages forward/backward and click the hidden seal again; it should replay the existing secret without asking questions.
- Test Vietnamese text containing accents in `.env.local` `SECRET_MESSAGE`; accents should stay attached in the reveal.
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
- Closed cover text removed: Yes, source check confirms visible cover "Birthday Book" text was removed.
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
- Right page goes forward: Yes, click handling is bound to the right page hit area.
- Left page goes backward: Yes, click handling is bound to the left page hit area.
- Page text no longer blocks page turns: Yes, Drei `Text` meshes on book pages have raycasting disabled.
- Disabled page hit areas no longer block interactions: Yes, inactive previous/next hit planes now render as `null`.
- Background/outside clicks do not turn pages: Yes, open-book root click navigation was removed and page turning is only wired through `PageTurnControls`.
- Page turn animation works: Yes, existing turn sheet remains and natural click path triggers it.
- Hidden unlock flow works: Yes, glowing in-book lock opens the modal.
- Unlock modal visual redesign checked: Yes, modal now uses a parchment/secret-letter style with decorative border, paper texture, seal, and letter-styled fields.
- Unlock modal polish checked: Yes, modal is flatter, less boxy, shorter, and uses soft paper writing areas instead of harsh input boxes.
- Vietnamese modal text checked: Yes, question prompts, note, button text, and fallback error text render as proper Vietnamese instead of mojibake.
- Vietnamese normalization checked: Yes, display helpers normalize to NFC and pagination/reveal length calculations use grapheme-aware splitting.
- Incorrect answers show friendly error: Yes.
- Correct answers trigger secret reveal: Yes, `/api/unlock` success sets the burn/dissolve reveal stage.
- Secret page dependency removed: Yes, source check found no `createSecretPages`, `locked-secret`, or secret page generation in `App`.
- Book dissolve added: Yes, the scene runs `BookBurnEffect`, disables controls, shrinks the book, and hides it when the reveal reaches message stage.
- Secret appears in the air: Yes, `SecretRevealScene` reveals backend message chunks with line-break preservation, fade/rise motion, and sparkle/shimmer accents.
- Secret reveal can be closed: Yes, Back to book and Escape return the app to the open book state.
- Secret reveal replay works: Yes, Replay restarts the chunk reveal from local state without calling `/api/unlock` again.
- Show full message works: Yes, the control completes the animation and opens the completed-message section view.
- Secret reveal pacing checked: Yes, readable sections now use approximately 7-second pauses before auto-advancing.
- Long secret handling remains: Yes, long messages are split into readable sections with Earlier/Later controls instead of a scrollable text block.
- Sealed envelope flow checked: Yes, hidden mark opens a sealed envelope first and the questions are only in the opened letter state.
- Correct unlock handoff checked: Yes, success moves the letter to a fade state before calling the existing unlock success handler and starting book dissolve.
- Ember text styling checked: Yes, final message uses warm gold/amber text glow, active-line ember sparkle, and subtle flicker.
- Non-destructive dissolve checked: Yes, Back to book returns `revealStage` to idle and restores the visible open book.
- Page index restoration checked: Yes, the app saves the current spread before reveal and clamps it to a valid normal page start when returning.
- Hidden seal after unlock checked: Yes, the seal remains visible and routes to replay instead of reopening the unlock questions.
- Replay without API checked: Yes, unlocked seal uses the stored `secretMessage` and does not call `/api/unlock`.
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
