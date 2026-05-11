import { useState } from 'react';
import { Button, DropdownMenu, MenuGroup, MenuItem, Tooltip } from '@wordpress/components';
import { Page } from '@wordpress/admin-ui';
import { chevronDown, chevronRight, dragHandle, moreVertical, page as pageIcon, plus } from '@wordpress/icons';

function MenuEditor({ menu, onUpdateMenu, onBack }) {
  const [expandedItems, setExpandedItems] = useState(new Set());

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

  const renderMenuItem = (item, level = 0, siblings = [], index = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const canMoveUp = index > 0;
    const canMoveDown = index < siblings.length - 1;

    return (
      <div key={item.id} className="nav-menu-item-wrapper">
        <div
          className="nav-menu-editor-item"
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
          
          <span className="nav-item-icon">{pageIcon}</span>
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
                      // Placeholder: Add submenu link not yet implemented
                      onClose();
                    }}
                  >
                    Add submenu link
                  </MenuItem>
                  <MenuItem
                    isDestructive
                    onClick={() => {
                      removeItem(item.id);
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
      onClick={() => {
        // Placeholder: "Add pages" flow not yet implemented
      }}
      className="nav-header-add-btn"
    >
      Add Pages
    </Button>
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
            <div className="nav-empty-state">
              <p>No items in this menu yet</p>
              <p className="nav-empty-hint">
                Use &quot;Add Pages&quot; above to add links to this menu.
              </p>
            </div>
          ) : (
            <>
              {menu.items.map((item, index) =>
                renderMenuItem(item, 0, menu.items, index),
              )}
              <Tooltip text="Add page">
                <button
                  type="button"
                  className="nav-add-page-btn"
                  onClick={() => {
                    // Placeholder: "Add pages" flow not yet implemented
                  }}
                  aria-label="Add page"
                >
                  {plus}
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}

export default MenuEditor;
