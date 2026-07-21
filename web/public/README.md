# Shokhi web assets

Brand and illustration files served from `/` (this `public/` folder). Favicons live in
`web/app/` (`favicon.ico`, `icon.png`, `apple-icon.png`) — Next.js auto-serves those.

| File | What it is | Used where |
| --- | --- | --- |
| `shokhi-mark.png` | **Light** logo mark (current). ~512px, optimized. | Navbar brand + small chat/reply avatars (`components/LogoMark.tsx`); source for the favicons. |
| `shokhi-mark-dark.png` | **Dark** logo mark (the original). Kept for later use — e.g. on light/pale surfaces or a future dark mode. | Not wired up yet; available when needed. |
| `mascot-3d.png` | The default 3D cartoon (fallback for every page). | Any page whose own pose file is missing. |
| `mascot-3d-hero.png` | Home hero pose (welcoming / confident). | Landing hero. |
| `mascot-3d-chat.png` | Chat pose (sitting, both hands on cheeks, thoughtful & caring). | Chat welcome screen. |
| `mascot-3d-learn.png` | Learn pose (holding an open book / curious "learning"). | Learn page header. |
| `mascot-3d-hotline.png` | Hotline pose (holding / talking on a phone). | Hotline card. |
| `og.png` | Social-share preview image. | Open Graph / Twitter card (see `app/layout.tsx`). |

## Adding the 3D cartoon (and per-page poses)
Save each render here. Best results:
- **Transparent background** (generate on plain white, then remove.bg), **portrait / full-body**
- ~600–1000px tall, ideally **under ~500KB**
- Keep the same character (dusty-rose kurta, sage salwar/orna, ponytail) — only change the pose.

`Mascot3D` uses a fallback chain per page: **`mascot-3d-<page>.png` → `mascot-3d.png` → SVG**, so a
page shows its own pose if present, otherwise the default, and never breaks. To add/replace a page's
pose, drop the matching `mascot-3d-<page>.png` and clear the image cache (see below).

## Note: replacing an image with the same filename
Next.js caches optimized images. After overwriting a file (e.g. `shokhi-mark.png`) but
keeping the name, clear the cache so the new one shows:

```bash
rm -rf web/.next/cache/images
```
