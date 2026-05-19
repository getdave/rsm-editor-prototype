import { getPageContent } from '../services/pageContentService';

/**
 * Layout bucket for Pages grid wireframe thumbnails (metadata only).
 * @typedef {'page'|'error'|'cart'|'checkout'|'archive-list'|'archive-grid'|'single-product'|'single-post'} PageWireframeVariant
 */

/**
 * @param {object|null|undefined} page
 * @returns {PageWireframeVariant}
 */
export function getPageWireframeVariant(page) {
  if (page?.isShopPage) {
    return 'archive-grid';
  }

  if (page?.isArchiveListing || page?.sourceType === 'post-type-archive') {
    return 'archive-list';
  }

  const content = getPageContent(page);
  const layout = content?.layout ?? 'default';

  if (layout === 'error') {
    return 'error';
  }
  if (layout === 'ecommerce') {
    const t = content.sections?.[0]?.type;
    if (t === 'cart') {
      return 'cart';
    }
    return 'checkout';
  }
  if (layout === 'archive') {
    const secondary = content.sections?.[1];
    if (secondary?.type === 'product-grid') {
      return 'archive-grid';
    }
    return 'archive-list';
  }
  if (layout === 'single') {
    if (content.sections?.[0]?.type === 'product-detail') {
      return 'single-product';
    }
    return 'single-post';
  }
  return 'page';
}
