# Form in Flux — direction study

This study revises the composition and transitions as a connected spatial experience. It is the current art-direction study, deployed through the repository’s GitHub Pages workflow.

## Research actually consulted

- [Patricio González Vivo and Jen Lowe — The Book of Shaders, Cellular Noise](https://thebookofshaders.com/12/): consulted the primary chapter through [its repository](https://github.com/patriciogonzalezvivo/thebookofshaders/tree/master/12). Distance fields and spatial relationships are useful ways of constructing images, rather than treating effects as decoration. The published chapter credits Steven Worley for cellular noise. This study uses a signed-distance sculpture; it does not implement Voronoi cells.
- [Patricio González Vivo — LYGIA](https://github.com/patriciogonzalezvivo/lygia): studied the artist's cross-platform shader toolkit and approach to composing small procedural functions. No LYGIA source is bundled here.
- [Matt DesLauriers — canvas-sketch](https://github.com/mattdesl/canvas-sketch): studied the generative-art sketch workflow and its documented export/review process. Applied this as a visual study with motion captures; canvas-sketch is not a dependency.
- [pmndrs — MeshTransmissionMaterial](https://github.com/pmndrs/drei/blob/master/src/core/MeshTransmissionMaterial.tsx): researched material thickness, distortion, and chromatic separation. The study's sculpture is reflective, with a procedural studio environment; it is not physically simulated glass. No material source was copied.

Artist websites beyond the permitted network destinations were not reviewed. This is source-based research and an original interpretation, not a survey of current exhibitions or a claim to reproduce any artist's work.

## Art direction

**Form, then space, then image.** The sculpture establishes a physical presence. Scrolling changes its orientation and topology. A photographic aperture then expands into the architectural work. Images later disassemble into staggered vertical slices. Typography shifts between a large architectural sans and an italic serif; existing section colors remain part of the composition.

## Implemented

- A signed-distance sculpture rendered with bounded ray marching, approximate reflections, and pointer-controlled orientation. Scroll morphs a twisted ring into a rounded solid.
- A spatial image aperture with a gently changing silhouette and separated RGB sampling at its edge.
- Real image-coordinate displacement and staggered slice transitions, with text rendered independently for clarity.
- An exploded set of shaded architectural plates in the engineering scene.
- A scene-local GPU canvas that moves between pinned viewports, replacing the earlier full-page light overlay.
- A static CSS sculpture and readable sections when GPU rendering is unavailable or reduced motion is requested.

## Limits

The studio reflections are procedural, not an HDR environment capture. The aperture is an artistic optical approximation. Ray marching is capped at 56 steps and a 480,000-pixel desktop / 230,000-pixel coarse-pointer drawing buffer. This trades edge sharpness for workload; physical-device profiling has not been performed. Photography remains cropped footage supplied for the reference study and requires replacement with owned project assets before a public release.
