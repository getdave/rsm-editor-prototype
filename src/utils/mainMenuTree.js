/**
 * @param {Array<{ pageId: string, children?: Array }>} items
 * @param {string} pageId
 */
export function menuTreeHasPageId(items, pageId) {
  if (!items?.length) return false;
  for (const item of items) {
    if (item.pageId === pageId) return true;
    if (item.children?.length && menuTreeHasPageId(item.children, pageId)) {
      return true;
    }
  }
  return false;
}

/**
 * Immutable: removes any item (any depth) whose pageId matches.
 * @param {Array<{ pageId: string, children?: Array }>} items
 * @param {string} pageId
 */
export function removeItemsByPageId(items, pageId) {
  if (!items?.length) return [];
  return items
    .filter((item) => item.pageId !== pageId)
    .map((item) => ({
      ...item,
      children: item.children?.length
        ? removeItemsByPageId(item.children, pageId)
        : [],
    }));
}

/**
 * Appends a top-level link if that pageId is not already in the tree.
 * @param {Array} items
 * @param {{ id: string, name: string }} page
 */
export function appendTopLevelPageIfMissing(items, page) {
  if (menuTreeHasPageId(items, page.id)) return items;
  return [
    ...items,
    {
      id: `nav-${page.id}-${Date.now()}`,
      pageId: page.id,
      label: page.name,
      children: [],
    },
  ];
}

/**
 * @param {Array<{ id: string, items: Array }>} menus
 * @param {string} pageId
 */
export function removePageFromAllMenus(menus, pageId) {
  if (!menus?.length) return [];
  return menus.map((menu) => ({
    ...menu,
    items: removeItemsByPageId(menu.items || [], pageId),
  }));
}
