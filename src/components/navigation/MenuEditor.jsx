import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  DropdownMenu,
  MenuGroup,
  MenuItem,
} from '@wordpress/components';
import { Page } from '@wordpress/admin-ui';
import {
  chevronDown,
  chevronRight,
  moreVertical,
  page as pageIcon,
  plus,
  link as linkIconGlyph,
} from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import RenameMenuItemModal from './RenameMenuItemModal';
import DeleteMenuItemConfirmModal from '../modals/DeleteMenuItemConfirmModal';
import AddPagesToMenuModal from './AddPagesToMenuModal';

const MAX_MENU_LEVEL = 1;

function getSubtreeDepth(item) {
  if (!item.children?.length) {
    return 0;
  }

  return 1 + Math.max(...item.children.map(getSubtreeDepth));
}

function getMenuItemMeta(items, itemId, level = 0, ancestors = []) {
  for (const item of items) {
    if (item.id === itemId) {
      return { item, level, ancestors };
    }

    if (item.children?.length) {
      const match = getMenuItemMeta(item.children, itemId, level + 1, [
        ...ancestors,
        item.id,
      ]);
      if (match) {
        return match;
      }
    }
  }

  return null;
}

function removeMenuItem(items, itemId) {
  let removedItem = null;
  let changed = false;
  const nextItems = [];

  for (const item of items) {
    if (item.id === itemId) {
      removedItem = item;
      changed = true;
      continue;
    }

    if (item.children?.length) {
      const result = removeMenuItem(item.children, itemId);
      if (result.removedItem) {
        removedItem = result.removedItem;
        changed = true;
        nextItems.push({ ...item, children: result.items });
        continue;
      }
    }

    nextItems.push(item);
  }

  return {
    items: changed ? nextItems : items,
    removedItem,
  };
}

function insertMenuItemRelative(items, targetId, itemToInsert, position) {
  let inserted = false;

  const nextItems = items.flatMap((item) => {
    if (item.id === targetId) {
      inserted = true;
      return position === 'above'
        ? [itemToInsert, item]
        : [item, itemToInsert];
    }

    if (item.children?.length) {
      const result = insertMenuItemRelative(
        item.children,
        targetId,
        itemToInsert,
        position,
      );
      if (result.inserted) {
        inserted = true;
        return [{ ...item, children: result.items }];
      }
    }

    return [item];
  });

  return { items: inserted ? nextItems : items, inserted };
}

function insertMenuItemInside(items, targetId, itemToInsert) {
  let inserted = false;

  const nextItems = items.map((item) => {
    if (item.id === targetId) {
      inserted = true;
      return {
        ...item,
        children: [...(item.children || []), itemToInsert],
      };
    }

    if (item.children?.length) {
      const result = insertMenuItemInside(item.children, targetId, itemToInsert);
      if (result.inserted) {
        inserted = true;
        return { ...item, children: result.items };
      }
    }

    return item;
  });

  return { items: inserted ? nextItems : items, inserted };
}

function isValidDropTarget(items, draggedId, targetId, position) {
  if (!draggedId || !targetId || draggedId === targetId) {
    return false;
  }

  const draggedMeta = getMenuItemMeta(items, draggedId);
  const targetMeta = getMenuItemMeta(items, targetId);
  if (!draggedMeta || !targetMeta) {
    return false;
  }

  if (targetMeta.ancestors.includes(draggedId)) {
    return false;
  }

  const draggedDepth = getSubtreeDepth(draggedMeta.item);

  if (position === 'inside') {
    return targetMeta.level === 0 && draggedDepth === 0;
  }

  return targetMeta.level + draggedDepth <= MAX_MENU_LEVEL;
}

function moveMenuItem(items, draggedId, targetId, position) {
  if (!isValidDropTarget(items, draggedId, targetId, position)) {
    return items;
  }

  const removal = removeMenuItem(items, draggedId);
  if (!removal.removedItem) {
    return items;
  }

  const itemToInsert = {
    ...removal.removedItem,
    children: removal.removedItem.children || [],
  };

  if (position === 'inside') {
    const result = insertMenuItemInside(
      removal.items,
      targetId,
      itemToInsert,
    );
    return result.inserted ? result.items : items;
  }

  const result = insertMenuItemRelative(
    removal.items,
    targetId,
    itemToInsert,
    position,
  );
  return result.inserted ? result.items : items;
}

function MenuEditor({ menu, onUpdateMenu, onBack }) {
  const { pages: allPages, showSnackbar } = useAppState();
  const [expandedItems, setExpandedItems] = useState(new Set());
  /** When set, rename modal is open for this menu tree item (by reference shape). */
  const [renameTarget, setRenameTarget] = useState(null);
  /** When set, delete confirmation is open for this menu tree item. */
  const [itemPendingDelete, setItemPendingDelete] = useState(null);

  const [showAddPagesModal, setShowAddPagesModal] = useState(false);
  const [addPagesModalKey, setAddPagesModalKey] = useState(0);
  /** Nav item row ids that should play the attention flash (newly added links). */
  const [flashNavItemIds, setFlashNavItemIds] = useState([]);
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dropTarget, setDropTargetState] = useState(null);
  const [dragGhostPosition, setDragGhostPosition] = useState(null);
  const dragStateRef = useRef({ itemId: null });

  const setDropTarget = useCallback((nextTarget) => {
    setDropTargetState((prevTarget) => {
      if (
        prevTarget?.itemId === nextTarget?.itemId &&
        prevTarget?.position === nextTarget?.position
      ) {
        return prevTarget;
      }
      return nextTarget;
    });
  }, []);

  const openAddPagesModal = useCallback(() => {
    setAddPagesModalKey((k) => k + 1);
    setShowAddPagesModal(true);
  }, []);

  const addLinksFromPicker = useCallback(
    (selectedRows) => {
      if (!selectedRows?.length) {
        showSnackbar('Nothing was added to the menu.');
        setShowAddPagesModal(false);
        return;
      }
      const ts = Date.now();
      const newItems = selectedRows.map((row, index) => ({
        id: `nav-${row.id}-${ts}-${index}`,
        label: row.navLabel ?? row.name,
        ...(row.navPageId || row.pageId || row.category === 'content'
          ? { pageId: row.navPageId ?? row.pageId ?? row.id }
          : {}),
        ...(row.navUrl || row.url ? { url: row.navUrl ?? row.url } : {}),
        ...(row.sourceType ? { sourceType: row.sourceType } : {}),
        children: [],
      }));
      onUpdateMenu({ items: [...menu.items, ...newItems] });
      setFlashNavItemIds(newItems.map((i) => i.id));
      showSnackbar(
        `Added ${newItems.length} link${newItems.length === 1 ? '' : 's'} to the menu`,
      );
      setShowAddPagesModal(false);
    },
    [menu.items, onUpdateMenu, showSnackbar],
  );

  useEffect(() => {
    if (flashNavItemIds.length === 0) {
      return undefined;
    }
    // Clear flash class after animation (4s + small buffer)
    const t = window.setTimeout(() => {
      setFlashNavItemIds([]);
    }, 4100);
    return () => window.clearTimeout(t);
  }, [flashNavItemIds]);

  const flashNavItemIdSet = useMemo(
    () => new Set(flashNavItemIds),
    [flashNavItemIds],
  );
  const draggedItem = useMemo(
    () =>
      draggingItemId
        ? getMenuItemMeta(menu.items, draggingItemId)?.item ?? null
        : null,
    [draggingItemId, menu.items],
  );

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const removeItem = (itemId) => {
    onUpdateMenu({ items: removeMenuItem(menu.items, itemId).items });
  };

  const moveItem = (itemId, direction) => {
    const findAndMove = (items) => {
      const index = items.findIndex((item) => item.id === itemId);
      if (index === -1) {
        return items.map((item) => ({
          ...item,
          children: item.children ? findAndMove(item.children) : [],
        }));
      }

      const newItems = [...items];
      if (direction === 'up' && index > 0) {
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      } else if (direction === 'down' && index < items.length - 1) {
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      }

      return newItems;
    };

    onUpdateMenu({ items: findAndMove([...menu.items]) });
  };

  const resolveDropTarget = useCallback(
    (clientX, clientY) => {
      const draggedId = dragStateRef.current.itemId;
      if (!draggedId) {
        return null;
      }

      const element = document.elementFromPoint(clientX, clientY);
      const row = element?.closest?.('[data-nav-menu-item-id]');
      if (!row) {
        return null;
      }

      const targetId = row.dataset.navMenuItemId;
      const rect = row.getBoundingClientRect();
      const y = clientY - rect.top;
      let position = 'inside';

      if (y < rect.height * 0.3) {
        position = 'above';
      } else if (y > rect.height * 0.7) {
        position = 'below';
      }

      if (!isValidDropTarget(menu.items, draggedId, targetId, position)) {
        return null;
      }

      return { itemId: targetId, position };
    },
    [menu.items],
  );

  useEffect(() => {
    if (!draggingItemId) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      event.preventDefault();
      setDragGhostPosition({ x: event.clientX, y: event.clientY });
      setDropTarget(resolveDropTarget(event.clientX, event.clientY));
    };

    const finishDrag = (event) => {
      event.preventDefault();
      const target = resolveDropTarget(event.clientX, event.clientY);
      const draggedId = dragStateRef.current.itemId;

      if (draggedId && target) {
        const nextItems = moveMenuItem(
          menu.items,
          draggedId,
          target.itemId,
          target.position,
        );

        if (nextItems !== menu.items) {
          onUpdateMenu({ items: nextItems });
          if (target.position === 'inside') {
            setExpandedItems((prev) => new Set(prev).add(target.itemId));
          }
        }
      }

      dragStateRef.current.itemId = null;
      setDraggingItemId(null);
      setDragGhostPosition(null);
      setDropTarget(null);
    };

    const cancelDrag = (event) => {
      if (event.key !== 'Escape') {
        return;
      }
      dragStateRef.current.itemId = null;
      setDraggingItemId(null);
      setDragGhostPosition(null);
      setDropTarget(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('keydown', cancelDrag);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('keydown', cancelDrag);
    };
  }, [
    draggingItemId,
    menu.items,
    onUpdateMenu,
    resolveDropTarget,
    setDropTarget,
  ]);

  const startDraggingItem = (event, itemId) => {
    if (event.button !== 0) {
      return;
    }
    if (event.target.closest('button, a, input, select, textarea')) {
      return;
    }

    event.preventDefault();
    dragStateRef.current.itemId = itemId;
    setDraggingItemId(itemId);
    setDragGhostPosition({ x: event.clientX, y: event.clientY });
    setDropTarget(null);
  };

  const renameItemLabel = (itemId, newLabel) => {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      return;
    }

    const updateInTree = (items) =>
      items.map((entry) => {
        if (entry.id === itemId) {
          return { ...entry, label: trimmed };
        }
        if (entry.children?.length) {
          return { ...entry, children: updateInTree(entry.children) };
        }
        return entry;
      });

    onUpdateMenu({ items: updateInTree([...menu.items]) });
  };

  const renderMenuItem = (item, level = 0, siblings = [], index = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const canMoveUp = index > 0;
    const canMoveDown = index < siblings.length - 1;
    const rowIcon = item.url ? linkIconGlyph : pageIcon;
    const activeDropPosition =
      dropTarget?.itemId === item.id ? dropTarget.position : null;
    const rowClasses = [
      'nav-menu-editor-item',
      flashNavItemIdSet.has(item.id) ? 'flash-highlight' : '',
      draggingItemId === item.id ? 'is-dragging' : '',
      activeDropPosition ? `is-drop-${activeDropPosition}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div key={item.id} className="nav-menu-item-wrapper">
        <div
          className={rowClasses}
          data-nav-menu-item-id={item.id}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
          onPointerDown={(event) => startDraggingItem(event, item.id)}
        >
          {hasChildren && (
            <button
              className="nav-item-toggle"
              onClick={() => toggleExpanded(item.id)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? chevronDown : chevronRight}
            </button>
          )}
          {!hasChildren && <span className="nav-item-spacer" />}

          <span className="nav-item-icon">{rowIcon}</span>
          <span className="nav-item-label">{item.label}</span>

          <div className="nav-item-actions">
            <DropdownMenu
              icon={moreVertical}
              iconSize={20}
              label="Menu item options"
              className="nav-item-dropdown"
              popoverProps={{ placement: 'bottom-end' }}
              toggleProps={{
                variant: 'tertiary',
              }}
            >
              {({ onClose }) => (
                <MenuGroup>
                  <MenuItem
                    onClick={() => {
                      moveItem(item.id, 'up');
                      onClose();
                    }}
                    disabled={!canMoveUp}
                  >
                    Move up
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      moveItem(item.id, 'down');
                      onClose();
                    }}
                    disabled={!canMoveDown}
                  >
                    Move down
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setRenameTarget({
                        id: item.id,
                        label: item.label,
                        pageId: item.pageId,
                        url: item.url,
                      });
                      onClose();
                    }}
                  >
                    Rename
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      // Placeholder: Add submenu link not yet implemented
                      onClose();
                    }}
                  >
                    Add submenu link
                  </MenuItem>
                  <MenuItem
                    isDestructive
                    onClick={() => {
                      setItemPendingDelete({
                        id: item.id,
                        label: item.label,
                        pageId: item.pageId,
                        url: item.url,
                        children: item.children,
                      });
                      onClose();
                    }}
                  >
                    Delete
                  </MenuItem>
                </MenuGroup>
              )}
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="nav-menu-children">
            {item.children.map((child, childIndex) =>
              renderMenuItem(child, level + 1, item.children, childIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  const breadcrumbs = (
    <nav className="nav-editor-breadcrumbs" aria-label="Breadcrumbs">
      <ul className="nav-editor-breadcrumbs__list">
        <li className="nav-editor-breadcrumbs__crumb">
          <button
            type="button"
            className="nav-editor-breadcrumbs__parent"
            onClick={onBack}
          >
            Navigation
          </button>
          <span className="nav-editor-breadcrumbs__sep" aria-hidden="true">
            /
          </span>
        </li>
        <li className="nav-editor-breadcrumbs__crumb nav-editor-breadcrumbs__crumb--current">
          <h1 className="nav-editor-breadcrumbs__title" aria-current="page">
            {menu.name}
          </h1>
        </li>
      </ul>
    </nav>
  );

  const quickInserter = (
    <div className="nav-add-item-dropdown">
      <Button
        icon={plus}
        label="Add to menu"
        className="nav-add-page-btn"
        onClick={openAddPagesModal}
        aria-haspopup="dialog"
      />
    </div>
  );
  const dragGhostIcon = draggedItem?.url ? linkIconGlyph : pageIcon;

  return (
    <Page
      className="split-view-stage nav-editor-frame"
      breadcrumbs={breadcrumbs}
      showSidebarToggle={false}
    >
      <div className="nav-editor-inner">
        <div className="nav-menu-editor-items">
          {menu.items.length === 0 ? (
            <>
              <div className="nav-empty-state">
                <p>No items in this menu yet</p>
                <p className="nav-empty-hint">
                  Use the + button below to add links.
                </p>
              </div>
              {quickInserter}
            </>
          ) : (
            <>
              {menu.items.map((item, index) =>
                renderMenuItem(item, 0, menu.items, index),
              )}
              {quickInserter}
            </>
          )}
        </div>
      </div>

      {draggedItem && dragGhostPosition ? (
        <div
          className="nav-menu-drag-ghost"
          style={{
            transform: `translate3d(${dragGhostPosition.x + 12}px, ${dragGhostPosition.y + 12}px, 0)`,
          }}
          aria-hidden="true"
        >
          <span className="nav-menu-drag-ghost__icon">{dragGhostIcon}</span>
          <span className="nav-menu-drag-ghost__label">{draggedItem.label}</span>
        </div>
      ) : null}

      {renameTarget ? (
        <RenameMenuItemModal
          key={renameTarget.id}
          item={renameTarget}
          linkedPageTitle={
            renameTarget.pageId
              ? allPages.find((p) => p.id === renameTarget.pageId)?.name ?? ''
              : ''
          }
          linkedHref={renameTarget.url || undefined}
          onClose={() => setRenameTarget(null)}
          onSave={(newLabel) => {
            renameItemLabel(renameTarget.id, newLabel);
            setRenameTarget(null);
          }}
        />
      ) : null}
      {itemPendingDelete ? (
        <DeleteMenuItemConfirmModal
          item={itemPendingDelete}
          onClose={() => setItemPendingDelete(null)}
          onConfirm={() => {
            removeItem(itemPendingDelete.id);
            setItemPendingDelete(null);
          }}
        />
      ) : null}
      {showAddPagesModal ? (
        <AddPagesToMenuModal
          key={addPagesModalKey}
          onClose={() => setShowAddPagesModal(false)}
          pages={allPages}
          menuItems={menu.items}
          onConfirm={addLinksFromPicker}
        />
      ) : null}
    </Page>
  );
}

export default MenuEditor;
