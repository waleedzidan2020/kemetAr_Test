# Kemet AR

Free, static Arabic-first augmented reality color-overlay experience hosted on GitHub Pages.

- **Live site:** https://waleedzidan2020.github.io/kemetAr_Test/
- **Studio:** https://waleedzidan2020.github.io/kemetAr_Test/studio.html

## Current project state

The previous Zamalek color overlays (four SVG logo layers and four WebP full-paper layers) have been **removed from the current branch**, along with their live AR mappings and the obsolete full/logo selection.

`data/targets.json` has **zero published image targets** so the live AR button will inform visitors that a new target is needed instead of attempting to load removed images. The previously uploaded four-angle `targets/targets.mind` binary remains in the repository **only until the user supplies the new one-image replacement**. It is not used in published AR while the target array is empty.

The sample illustrative demo uses `assets/demo-target.svg` and `assets/demo-color.svg`, which are independent of the removed real-photo Zamalek assets. The viewer still supports instant display, smooth fade-in, right-to-left reveal, duration 1–8 seconds, replay, opacity controls, and camera tracking with MindAR.

## Publish the new single-image experiment

1. Supply the new one-target `targets.mind` binary and its original/colored source images.
2. Replace `targets/targets.mind` (do not use the old four-view file).
3. Align an overlay with the one source photo. Add it to `assets/overlays/`.
4. Change `data/targets.json` to a single target entry with the correct dimensions, title, and overlay path.
5. Commit to `main`; `.github/workflows/pages.yml` deploys the static site with GitHub Actions.

All processing is browser-side. No backend or paid API is required. GitHub Pages has normal plan usage limits.

## Development

```bash
npm install --legacy-peer-deps
npm run check
```

MindAR, A-Frame and JSZip are bundled in the deployment to serve without third-party runtime CDNs.
