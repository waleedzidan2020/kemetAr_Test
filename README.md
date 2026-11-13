# KEMET AR — Single Image Zamalek Demo

Static augmented reality hosted at https://waleedzidan2020.github.io/kemetAr_Test/ with no paid APIs.

## Current published setup

- **One** MindAR image target: `targets/targets.mind`, 720 × 1280, targetIndex 0.
- The committed `.mind` is **byte-identical** to the user's uploaded `targets2.mind` (SHA256 `6f367c1c009c8f18cc06d5ce8743aba96a8adb0c7f8c99e832392f2e65f2ae85`).
- One transparent SVG color layer: `assets/overlays/zamalek-single.svg`.
- The viewer includes instant, smooth Fade, and right-to-left Reveal modes, duration 1–8 seconds, replay, and opacity. Default opacity is 100%.
- The paper, red double shield, hand-drawn archer and Arabic writing remain anchored to the original photograph's pixel coordinates. The surrounding wall, fan and switches remain visible via the live camera, not a frozen replacement photo.
- A separate self-contained illustrative camera demo and the optional target compiler studio remain available.

## Deployment

GitHub Actions `.github/workflows/pages.yml` deploys the site on pushes to `main`. The one-time migration workflow extracted the original fourth target from the previous four-target file, verified the resulting binary's exact checksum against `targets2.mind`, and committed it. No runtime reconstruction is needed. Camera operation and physical registration still require validation on a mobile device.
