# Stroke-Mono Fill Integrity Warnings

Icons in `packs/icons-stroke-mono` that contain hardcoded `fill="#..."` attributes.
These icons have outlined (expanded) strokes in Figma instead of live stroke paths.
The fix must be applied in the Figma source file.

**Total affected: 3** · Fully outlined: 0 · Mixed (fill + stroke): 3

---

## Mixed (fill + stroke)

These icons use both fills and strokes. The fills may be intentional (e.g. screen bezels,
rack details) or may indicate partial outlining. Review case-by-case.

| Preview                                                          | Name             |
| ---------------------------------------------------------------- | ---------------- |
| <img src="./icons-stroke-mono/Crosshair.svg" height="24" />      | `Crosshair`      |
| <img src="./icons-stroke-mono/DiamondWarning.svg" height="24" /> | `DiamondWarning` |
| <img src="./icons-stroke-mono/Patch.svg" height="24" />          | `Patch`          |
