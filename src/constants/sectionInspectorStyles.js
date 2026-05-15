/** Block-style presets for pattern sections (inspector + canvas stub). */
export const DEFAULT_SECTION_STYLE_ID = 'default';

export const SECTION_STYLE_OPTIONS = [
  { id: 'default', label: 'Default', previewMod: 'default' },
  { id: 'style-1', label: 'Style 1', previewMod: 'style-1' },
  { id: 'style-2', label: 'Style 2', previewMod: 'style-2' },
  { id: 'style-3', label: 'Style 3', previewMod: 'style-3' },
  { id: 'style-4', label: 'Style 4', previewMod: 'style-4' },
  { id: 'style-5', label: 'Style 5', previewMod: 'style-5' },
];

/** Class on `.e-sec` for canvas stubs (matches plan: default + numeric). */
export function sectionStyleSurfaceClass(styleId) {
  if (!styleId || styleId === DEFAULT_SECTION_STYLE_ID) {
    return 'e-sec--style-default';
  }
  const n = String(styleId).replace(/^style-/, '');
  return `e-sec--style-${n}`;
}
