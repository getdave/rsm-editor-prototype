/**
 * Editor modes for the Block Editor.
 *
 * The Block Editor is a single full-size canvas that activates a *mode* based on
 * what the user is editing. Modes are derived automatically from content shape
 * (see `pageContentService.getEditModeContent`) — there is no manual switch.
 *
 * Extend by adding a new mode to `EDITOR_MODES` and a case to `getEditorMode`.
 */

export const EDITOR_MODES = Object.freeze({
  PAGE: 'page',
  TEMPLATE: 'template',
});

/**
 * Derive the editor mode from the content currently being edited.
 *
 * @param {object | null | undefined} content - Output of `getEditModeContent`.
 * @returns {'page' | 'template'}
 */
export function getEditorMode(content) {
  if (content?.wordpressContext?.type === 'template') {
    return EDITOR_MODES.TEMPLATE;
  }
  return EDITOR_MODES.PAGE;
}

export const isTemplateMode = (mode) => mode === EDITOR_MODES.TEMPLATE;
export const isPageMode = (mode) => mode === EDITOR_MODES.PAGE;
