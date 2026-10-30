> Historical notes for the previously published overlay experiment. See [Form in Flux](form-in-flux.md) for the current local study.

# Special-effects study — 30 October 2026

Primary sources consulted:

- [MDN: WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) — modern rendering pipelines and GPU compute. Prototyped a WebGPU render pipeline and WGSL. The software adapter lost its device under rendering, so the published experiment uses the verified WebGL2 path. No compute simulation is claimed.
- [MDN: WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) — bounded drawing buffers, few draw calls, no blocking readbacks, and context loss. Used one full-screen triangle, a 1.4-million-pixel desktop cap / 650,000 on coarse-pointer devices, a pixel-ratio cap, and paused rendering outside selected scenes and hidden tabs.
- [GL Transitions: DirectionalWarp, by pschroen](https://github.com/gl-transitions/gl-transitions/blob/master/transitions/DirectionalWarp.glsl) — a warped directional wipe. Inspired the transition concept; the shipped shader is an original procedural spectral band, not a copy of that implementation.
- [Three.js: WebGPU afterimage](https://threejs.org/examples/webgpu_postprocessing_afterimage.html) — researched temporal feedback and additive particle post-processing. Not selected for this version: ghosting the architecture and text would reduce clarity. The implementation does not use Three.js or a feedback buffer.

## Selected effects

1. **Domain-warped light field:** pointer-reactive interference contours behind the rotating typography. Analytic sine-based fields, not a physical fluid simulation.
2. **Prismatic transition band:** a scroll-controlled, warped spectral wipe layered over the existing material crossfade. It does not refract or distort DOM text or image pixels.
3. **Holographic facade scan:** an animated GPU scan and fine point grid, paired with a scroll-controlled scan plane and spectral SVG edges.
4. **Pointer-lit project images:** a local light sheen and parallax offset, only on hover-capable devices.
5. **Slit reveals:** clipped value headings and project dialogs, keeping text sharp.

## Compatibility and verification

The published implementation uses GLSL/WebGL2 procedural modes. The page continues with CSS effects if GPU initialization fails or a context is lost. Reduced motion allocates no GPU canvas. No new runtime dependency or external service is required.

Browser tests exercise all shader modes in Chromium software WebGL2, context loss, no-GPU, reduced-motion, desktop/mobile interactions, and scroll reversal. The WebGPU prototype accepted the pipeline but lost its device during rendering and was removed from the published implementation. These checks establish correctness on the test renderer, not performance or identical rendering on every physical GPU. Frame rate is capped around 30 fps on coarse-pointer devices and 60 fps otherwise; physical-device profiling remains separate.
