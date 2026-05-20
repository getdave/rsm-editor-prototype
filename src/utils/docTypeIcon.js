import { home, layout, page as pageIcon, postList, styles } from '@wordpress/icons';

/**
 * Resolve the icon that represents a document's type in the editor chrome.
 *
 * @param {object} page - Page/document object (may carry isPageDesign / isFrontPage / isPostsPage flags).
 * @param {{ isTemplate?: boolean }} [options] - When `isTemplate` is true, returns the template (layout) icon.
 * @returns {object} A @wordpress/icons element.
 */
export function docTypeIcon(page, { isTemplate = false } = {}) {
  if (isTemplate) return layout;
  if (page?.isPageDesign) return styles;
  if (page?.isFrontPage) return home;
  if (page?.isPostsPage) return postList;
  return pageIcon;
}
