# Shokhi web assets

Brand and illustration files served from `/` (this `public/` folder). Favicons live in
`web/app/` (`favicon.ico`, `icon.png`, `apple-icon.png`) — Next.js auto-serves those.

| File | What it is | Used where |
| --- | --- | --- |
| `shokhi-mark.png` | **Light** logo mark (current). ~512px, optimized. | Navbar brand + small chat/reply avatars (`components/LogoMark.tsx`); source for the favicons. |
| `shokhi-mark-dark.png` | **Dark** logo mark (the original). Kept for later use — e.g. on light/pale surfaces or a future dark mode. | Not wired up yet; available when needed. |
| `mascot-3d.png` | ⛳ **DROP THE 3D CARTOON HERE** — a Bangladeshi girl in salwar kameez, long ponytail. | Landing hero, chat welcome screen, hotline card (`components/Mascot3D.tsx`). |
| `og.png` | Social-share preview image. | Open Graph / Twitter card (see `app/layout.tsx`). |

## Adding the 3D cartoon
Save the rendered image as **`mascot-3d.png`** here. Best results:
- **Transparent background**, **portrait / full-body** (she scales into the hero)
- ~600–1000px tall, ideally **under ~500KB**

Until that file exists, `Mascot3D` automatically falls back to the hand-drawn SVG
(`components/Mascot.tsx`), so the UI is never broken.

## Note: replacing an image with the same filename
Next.js caches optimized images. After overwriting a file (e.g. `shokhi-mark.png`) but
keeping the name, clear the cache so the new one shows:

```bash
rm -rf web/.next/cache/images
```
