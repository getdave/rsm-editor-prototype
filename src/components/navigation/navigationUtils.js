/**
 * Collect unique page IDs referenced by menu items (recurses into children).
 * Used as source of truth for “is this page linked in this menu?” — not `page.inMenu`.
 */
export function collectPageIdsInMenu(items) {
  const ids = new Set();
  function walk(list) {
    if (!list?.length) {
      return;
    }
    for (const entry of list) {
      if (entry.pageId) {
        ids.add(entry.pageId);
      }
      if (entry.children?.length) {
        walk(entry.children);
      }
    }
  }
  walk(items);
  return ids;
}
