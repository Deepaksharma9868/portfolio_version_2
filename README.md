# Deepak Sharma - Portfolio (portfolio_version_2)

A static portfolio built with HTML, CSS and JavaScript. No package installation or build step is required.

## Website code

- `dist/index.html`: portfolio content and section layout.
- `dist/style.css`: desktop/mobile styling and CSS motion.
- `dist/ambient-particles.js`: subtle particles throughout the site.
- `dist/intro.js` and `dist/intro-art.js`: loading and opening animation.
- `dist/app.js`: landing-page artwork, navigation, and global motion controls.
- `dist/work-reel.js`: project carousel.
- `dist/page-motion.js`: scroll reveals.
- `dist/about-art.js`: animated About sculpture.
- `dist/face-core.js` and `dist/face-particles.js`: rotatable 3D face and particle gathering.
- `dist/brand-motion.js`: shared motion buttons.
- `dist/credits.html`: asset attribution.
- `dist/assets/`: all images, mesh data, and required model license.
- `source-assets/`: original assets and source notes.
- `.openai/hosting.json`: existing Sites hosting configuration.

## Preview locally

From this repository folder run:

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. Use a local server so the 3D mesh can load via fetch.

## Push to GitHub

Repository: https://github.com/Deepaksharma9868/portfolio_version_2

This folder is connected to that repository as `origin`. All required website files are tracked. After making edits, review them, commit, and run `git push origin main`.

For static hosting, publish the contents of `dist/`; it contains the complete deployable website. Keep the assets directory alongside index.html and retain credits.html and the model license. Original source-assets are useful for editing but are not required by the running website.
