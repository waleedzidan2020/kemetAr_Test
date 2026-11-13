# Zamalek multi-view AR linking

The supplied `targets.mind` was inspected using MessagePack decoding. It contains **4** image targets, all **720 × 1280**. The exact order was established by comparing the first tracking pyramid in each target against the user's original four photographs (Pearson correlations 0.9969–0.9989).

| targetIndex | Original user photo | Overlay |
|---|---|---|
| 0 | ca223aa2-c33c-4a42-b61c-bd7058955c16.jpg (distant view) | assets/overlays/zamalek-0.svg |
| 1 | ac5be85e-84d0-4ed5-92c1-b912e3027f37.jpg (side view) | assets/overlays/zamalek-1.svg |
| 2 | faf45c8e-bc0e-49b7-977f-c96ce3f7b88b.jpg (right view) | assets/overlays/zamalek-2.svg |
| 3 | f8388b79-9010-440d-85ff-e4f76a136cea.jpg (front view) | assets/overlays/zamalek-3.svg |

The four SVG overlays are **transparent, image-aligned 720x1280 vector layers**. Their vivid-red strokes cover only the hand-drawn shield and separator; the original black archer and Arabic text show through from the live camera. These are first-pass manual contour calibrations and should be tested on a physical phone before claiming pixel-perfect registration.

## Last required binary asset

`targets/targets.mind` is a **2,214,496-byte binary file** provided in the ChatGPT attachment. It still needs uploading to the GitHub repository in this exact location, using **Add file → Upload files**, because the available GitHub text connector cannot transfer arbitrary binary attachments directly. Do not recompile or reorder the targets. Once the binary file is present, the existing `data/targets.json` and four overlays provide the app's mapping.

The web app expects `data/targets.json` to match the supplied `.mind` file and does not recover if that file is missing. Test on the live GitHub Pages HTTPS site in camera mode.
