# 𓂀 KEMET AR — Egyptian Relief Color AR

**Arabic-first, free, open-source-style, mobile-first augmented-reality coloring web app** deployed entirely on **GitHub Pages**, with no app server, no login, no analytics, and no paid APIs.

**Repository:** https://github.com/waleedzidan2020/kemetAr_Test

**Expected Pages URL after enabling deployment:** https://waleedzidan2020.github.io/kemetAr_Test/

## What's implemented

- Premium responsive Arabic/RTL landing page; camera AR scanner (MindAR + A-Frame) with detection status, adjustable overlay opacity, before/after toggle and fullscreen control.
- Multiple image targets stored together in one `targets.mind` file, matched in order to a transparent image overlay for each target.
- Tracking smoothing through MindAR's built-in One Euro filtering options (this is **not** full 3D SLAM).
- Local **Studio** at `studio.html`: add pairs of reference + color overlay images, compile `targets.mind` in the browser, save a project in IndexedDB for local camera testing, or export a deploy-ready ZIP bundle with the compiled binary, overlays and JSON configuration.
- Browser-compiled illustrative demo. **Demo artwork is newly drawn and is not an Egyptian archaeological artifact.** For the demo, show `assets/demo-target.svg` on another screen or print it, open the demo camera on your phone, then aim at the image.
- PWA manifest and service worker. Runtime libraries (MindAR, A-Frame, JSZip) are **copied into the deployed GitHub Pages site** by the workflow; no runtime CDN is needed. All camera/video processing stays in the visitor's browser.

## Publish this site on GitHub Pages

1. Go to **Settings → Pages** for this repository.
2. Under **Build and deployment**, choose **GitHub Actions** as Source.
3. The workflow `.github/workflows/pages.yml` installs free libraries, checks JavaScript, assembles static files in `_site`, and deploys on each push to `main`.
4. Check **Actions → Deploy Kemet AR to GitHub Pages** until it succeeds.
5. Open https://waleedzidan2020.github.io/kemetAr_Test/.

GitHub App access to repository files does not necessarily grant the ability to enable Pages in Settings. Only the repository owner can change that setting if not already enabled.

## Add real reliefs / multiple photo angles

1. Take a **clear, largely front-facing** photograph of a reasonably planar wall relief. For wider angles, add additional reference photos as **independent targets**; these do not become an automatic 3D model.
2. Create a **transparent PNG** colored layer matching each reference photo **pixel-for-pixel in geometry** (not a second photograph with another perspective).
3. Open the site's **استوديو النقوش** page. Add one row per target; optionally label each angle. Choose reference and color files, and click **تجهيز targets.mind**.
4. Click **اختبر بالكاميرا** to save to your browser and open a local preview. This preview **does not publish files** or send them to GitHub.
5. Click **تحميل ملفات النشر ZIP**, extract locally, then add/replace these files **in the repository**:

```
targets/targets.mind
data/targets.json
assets/overlays/0.png
assets/overlays/1.png
...
```

6. Commit them to `main`. GitHub Actions publishes the updated site; the home **افتح كاميرا النقوش** button will now open the published targets. A binary `.mind` cannot be represented as a plain text placeholder; it has to be generated from actual photos.

Example configuration exported by Studio:

```json
{
  "name": "Temple relief",
  "mind": "targets/targets.mind",
  "targets": [
    {"title":"Front","width":1200,"height":900,"overlay":"assets/overlays/0.png"},
    {"title":"Left angle","width":1200,"height":900,"overlay":"assets/overlays/1.png"}
  ]
}
```

**Caution:** AR image tracking is best for flat/mostly flat surfaces and reasonable angles. It can wobble or lose alignment under glare, low detail, fast motion and extreme oblique viewing. A real continuous 3D surface-anchored AR solution requires calibrated reconstruction/SLAM and compatible platform support; this repository is an operational **image-target AR foundation**, not a guaranteed 3D SLAM system.

## Local development

```bash
npm install --legacy-peer-deps
npm run check
```

For camera testing use a secure origin (GitHub Pages HTTPS). Localhost is acceptable for desktop testing; opening files directly with `file://` is not. Browser compiler needs WebGL and can be slow on older phones. Camera permission is required.

## Privacy and cost

No user-uploaded photos leave the browser when compiling, previewing, or downloading. The demo/target assets are fetched from GitHub Pages. GitHub Pages has applicable usage limits; the software does not charge fees. Art-historical colors should be reviewed by specialists before any authenticity claims.

## Open-source dependencies

- [MindAR](https://github.com/hiukim/mind-ar-js) 1.2.5 (MIT)
- [A-Frame](https://github.com/aframevr/aframe) 1.5.0 (MIT)
- [JSZip](https://github.com/Stuk/jszip) 3.10.1 (MIT or GPLv3)

## Progressive reveal animation (optional)

When scanning a recognized target, use **ظهور التلوين** to choose:
- **فوري (Instant):** original overlay behavior, no animation;
- **تدريجي ناعم (Fade):** all painted pixels fade in smoothly;
- **من اليمين للشمال (Wipe):** colors are uncovered progressively from right to left, with a feathered edge.

The duration slider ranges from 1 to 8 seconds, and **إعادة العرض** restarts the effect while tracking a target. Choices are saved in browser local storage. Effect timing starts **only when a target is found**, is canceled on target loss, and restarts on reacquisition; the existing MindAR pose tracking stays unchanged. Any transparent PNG/SVG overlay supported by the app works with these effects. These modes do not add OpenCV or SLAM and do not generate new painted content: the existing Zamalek overlays primarily mark the shield's red lines.

## Full Colored Image (Zamalek: 4 views)

The live camera now has **نوع التلوين** with two options: **Logo Only** (existing four transparent SVG contours) and **Full Colored Image** (the four paper-only photographic overlays matched to the original photographs and `targetIndex` 0–3). The previously supplied colorized photos were perspective-aligned against the user’s original 720×1280 targets, clipped to the paper, resized/compressed to lightweight transparent WebP files, then mapped with `fullBounds` in `data/targets.json`.

The 4 target mappings are:
- 0: `zamalek-full-0.webp`, origin (241,408), size 245×334
- 1: `zamalek-full-1.webp`, origin (282,292), size 199×473
- 2: `zamalek-full-2.webp`, origin (308,304), size 264×411
- 3: `zamalek-full-3.webp`, origin (200,284), size 363×534

The page uses **separate target-anchored planes** for the full paper and logo-only, toggled without restarting MindAR. Both support instant / smooth fade / right-to-left wipe with duration and replay. The wall, fan, switches, and other surroundings remain live camera imagery; only the paper is overlaid. The colored photos are illustrative reconstructions, not official Zamalek logo assets. Alignment is calibrated from still images; it can require tuning after phone-camera tests.
