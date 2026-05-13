import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  DropdownMenu,
  MenuGroup,
  MenuItem,
  Popover,
} from '@wordpress/components';
import { Page } from '@wordpress/admin-ui';
import {
  chevronDown,
  chevronRight,
  dragHandle,
  moreVertical,
  page as pageIcon,
  plus,
  link as linkIconGlyph,
} from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import RenameMenuItemModal from './RenameMenuItemModal';
import DeleteMenuItemConfirmModal from '../modals/DeleteMenuItemConfirmModal';
import AddLinkPopover from './AddLinkPopover';
import CreatePagePopover from './CreatePagePopover';
import AddPagesToMenuModal from './AddPagesToMenuModal';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniquePageId(name, pagesList) {
  const base = slugify(name) || `page-${Date.now()}`;
  let id = base;
  let n = 0;
  while (pagesList.some((p) => p.id === id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

function MenuEditor({ menu, onUpdateMenu, onBack }) {
  const { pages: allPages, addPage, showSnackbar } = useAppState();
  const [expandedItems, setExpandedItems] = useState(new Set());
  /** When set, rename modal is open for this menu tree item (by reference shape). */
  const [renameTarget, setRenameTarget] = useState(null);
  /** When set, delete confirmation is open for this menu tree item. */
  const [itemPendingDelete, setItemPendingDelete] = useState(null);

  /** null | 'menu' | 'add-link' | 'create-page' */
  const [inserterView, setInserterView] = useState(null);
  const inserterAnchorRef = useRef(null);
  const [showAddPagesModal, setShowAddPagesModal] = useState(false);
  const [addPagesModalKey, setAddPagesModalKey] = useState(0);
  /** Nav item row ids that should play the attention flash (newly added links). */
  const [flashNavItemIds, setFlashNavItemIds] = useState([]);

  const closeInserter = () => setInserterView(null);

  const openAddPagesModal = useCallback(() => {
    setAddPagesModalKey((k) => k + 1);
    setShowAddPagesModal(true);
  }, []);

  const toggleInserterFromButton = () => {
    setInserterView((prev) => (prev ? null : 'menu'));
  };

  const addItemToMenu = (newItem) => {
    const item = {
      children: [],
      ...newItem,
    };
    onUpdateMenu({ items: [...menu.items, item] });
    setFlashNavItemIds([item.id]);
  };

  const addPageLinksFromPicker = useCallback(
    (selectedRows) => {
      if (!selectedRows?.length) {
        showSnackbar('Nothing was added to the menu.');
        setShowAddPagesModal(false);
        return;
      }
      const ts = Date.now();
      const newItems = selectedRows.map((row, index) => ({
        id: `nav-page-${row.id}-${ts}-${index}`,
        label: row.name,
        pageId: row.id,
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
    // Clear flash class after animation (~4s cycle)
    const t = window.setTimeout(() => {
      setFlashNavItemIds([]);
    }, 4200);
    return () => window.clearTimeout(t);
  }, [flashNavItemIds]);

  const flashNavItemIdSet = useMemo(
    () => new Set(flashNavItemIds),
    [flashNavItemIds],
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
    const removeFromItems = (items) => {
      return items.filter((item) => {
        if (item.id === itemId) return false;
        if (item.children && item.children.length > 0) {
          item.children = removeFromItems(item.children);
        }
        return true;
      });
    };

    onUpdateMenu({ items: removeFromItems([...menu.items]) });
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

    return (
      <div key={item.id} className="nav-menu-item-wrapper">
        <div
          className={`nav-menu-editor-item${flashNavItemIdSet.has(item.id) ? ' flash-highlight' : ''}`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
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
            <button
              type="button"
              className="nav-item-drag-handle"
              aria-label="Drag to reorder"
              title="Drag to reorder"
            >
              {dragHandle}
            </button>

            <DropdownMenu
              icon={moreVertical}
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

  const pageActions = (
    <Button
      variant="secondary"
      onClick={openAddPagesModal}
      className="nav-header-add-btn"
    >
      Add pages
    </Button>
  );

  const quickInserter = (
    <>
      <div className="nav-add-item-dropdown">
        <Button
          ref={inserterAnchorRef}
          icon={plus}
          label="Add to menu"
          className="nav-add-page-btn"
          onClick={toggleInserterFromButton}
          aria-expanded={inserterView !== null}
          aria-haspopup="dialog"
        />
      </div>
      {inserterView ? (
        <Popover
          anchorRef={inserterAnchorRef}
          placement="bottom-start"
          onClose={closeInserter}
          offset={4}
          focusOnMount="firstElement"
        >
          <div key={inserterView} className="nav-inserter-popover-shell">
            {inserterView === 'menu' ? (
              <div className="nav-inserter-menu">
                <div className="nav-inserter-menu-header">Add to menu</div>
                <MenuGroup>
                  <MenuItem
                    icon={pageIcon}
                    onClick={() => {
                      closeInserter();
                      openAddPagesModal();
                    }}
                  >
                    Add pages
                  </MenuItem>
                  <MenuItem
                    icon={linkIconGlyph}
                    onClick={() => setInserterView('add-link')}
                  >
                    Add Link
                  </MenuItem>
                </MenuGroup>
                <MenuGroup>
                  <MenuItem
                    icon={plus}
                    onClick={() => setInserterView('create-page')}
                  >
                    Create new page
                  </MenuItem>
                </MenuGroup>
              </div>
            ) : null}
            {inserterView === 'add-link' ? (
              <AddLinkPopover
                onBack={() => setInserterView('menu')}
                onCancel={closeInserter}
                onSave={({ label: linkLabel, url }) => {
                  addItemToMenu({
                    id: `nav-link-${Date.now()}`,
                    label: linkLabel,
                    url,
                  });
                  showSnackbar(`Added "${linkLabel}" to the menu`);
                  closeInserter();
                }}
              />
            ) : null}
            {inserterView === 'create-page' ? (
              <CreatePagePopover
                onBack={() => setInserterView('menu')}
                onCancel={closeInserter}
                onSave={({ name, publishImmediately }) => {
                  const pageId = uniquePageId(name, allPages);
                  const newPage = {
                    id: pageId,
                    slug: pageId,
                    name,
                    type: 'Page',
                    isLive: publishImmediately,
                    inMenu: true,
                    isSystem: false,
                    category: 'content',
                    status: publishImmediately ? 'live' : 'draft',
                    level: 0,
                    authorDisplay: 'John Doe',
                  };
                  addPage(newPage);
                  addItemToMenu({
                    id: `nav-page-${pageId}-${Date.now()}`,
                    label: name,
                    pageId,
                  });
                  showSnackbar(`Created page "${name}" and added it to the menu`);
                  closeInserter();
                }}
              />
            ) : null}
          </div>
        </Popover>
      ) : null}
    </>
  );

  return (
    <Page
      className="split-view-stage nav-editor-frame"
      breadcrumbs={breadcrumbs}
      actions={pageActions}
      showSidebarToggle={false}
    >
      <div className="nav-editor-inner">
        <div className="nav-menu-editor-items">
          {menu.items.length === 0 ? (
            <>
              <div className="nav-empty-state">
                <p>No items in this menu yet</p>
                <p className="nav-empty-hint">
                  Use &quot;Add pages&quot; above or the + button below to add links.
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
          onConfirm={addPageLinksFromPicker}
        />
      ) : null}
    </Page>
  );
}

export default MenuEditor;
