function sentenceCase(value) {
  if (!value) return '';
  const text = String(value).trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
}

export function getDocumentOptionsLabel(document, options = {}) {
  const { isGlobalOverride = false, isTemplate = false } = options;

  if (isGlobalOverride) return 'Template part options';
  if (isTemplate) return 'Template options';
  if (document?.type) return `${sentenceCase(document.type)} options`;
  if (document?.isPageDesign) return 'Page design options';
  return 'Document options';
}
