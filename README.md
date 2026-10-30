# Architecture portfolio study

A responsive, scroll-driven portfolio inspired by the supplied Santal recordings. Includes kinetic typography, material studies, a CSS exploded facade model, project dialogs, service tabs, mobile navigation, and a local cookie preference.

## Run

Node.js 20.19+ or 22.12+ is required.

```sh
npm ci
npm run dev
```

Production: `npm run build`, then `npm run preview`.

Architectural images are cropped stills from the supplied recordings. Replace them with original project photography before release. Project names, studio copy, and contact details are demonstration content. The structural model approximates the reference using CSS, rather than the original 3D assets. No analytics or nonessential cookies are installed.

## Motion

The word field, value sequence, senses, structural model, and services use sticky viewports with scroll-controlled animation. Scrolling backwards reverses the scenes. Reduced-motion preferences remove pinning and keep content readable. The facade geometry is SVG in CSS 3D space, an approximation of the reference rather than its original model.

Run `npx playwright test` for desktop, mobile, scroll, and reduced-motion checks. This environment uses `/usr/bin/chromium`; change `executablePath` in `playwright.config.js` if your browser lives elsewhere.

## GPU effects

The experimental effects use WebGL2 with a CSS fallback. They are disabled for reduced motion. See [the research and implementation notes](docs/effects-research.md) for primary sources, selected techniques, and practical limits.

## Current art direction

[Form in Flux](docs/form-in-flux.md) replaces the earlier light-overlay experiment with a morphing reflective sculpture, image aperture, image-slice transitions, and shaded architectural plates. The notes distinguish original work, consulted artist sources, and approximations. Deployment runs through the GitHub Pages workflow on pushes to main.
