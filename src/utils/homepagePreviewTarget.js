import { HOMEPAGE_DISPLAY_LATEST } from '../data/mockData';

export const HOMEPAGE_LATEST_POSTS_DESIGN_ID = 'blog-home-root';
const LATEST_POSTS_HOME_LABEL = 'Latest posts';

function normalizeLatestPostsHomepageTarget(target) {
  if (!target) return null;
  return {
    ...target,
    name: LATEST_POSTS_HOME_LABEL,
    shortName: LATEST_POSTS_HOME_LABEL,
    type: 'Template',
    templateLabel: LATEST_POSTS_HOME_LABEL,
    previewLabel: LATEST_POSTS_HOME_LABEL,
    actionLabel: 'Edit template',
    scopeNotice: 'Edits sync to the Latest posts homepage template.',
  };
}

/**
 * Resolve the document visitors see at the site's main address.
 * Mirrors WordPress Reading settings while keeping Home previews consistent.
 */
export function resolveHomepagePreviewTarget({
  homepageDisplayMode,
  frontPageId,
  pages = [],
  pageDesigns = [],
  currentPage = null,
}) {
  const fallback = currentPage ?? pages[0] ?? null;

  if (homepageDisplayMode === HOMEPAGE_DISPLAY_LATEST) {
    return normalizeLatestPostsHomepageTarget(
      pageDesigns.find(
        (design) => design.id === HOMEPAGE_LATEST_POSTS_DESIGN_ID,
      ),
    ) ?? fallback;
  }

  return pages.find((page) => page.id === frontPageId) ?? fallback;
}
