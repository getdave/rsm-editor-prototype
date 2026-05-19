import { HOMEPAGE_DISPLAY_LATEST } from '../data/mockData';

export const HOMEPAGE_LATEST_POSTS_DESIGN_ID = 'blog-home-root';

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
    return (
      pageDesigns.find(
        (design) => design.id === HOMEPAGE_LATEST_POSTS_DESIGN_ID,
      ) ?? fallback
    );
  }

  return pages.find((page) => page.id === frontPageId) ?? fallback;
}
