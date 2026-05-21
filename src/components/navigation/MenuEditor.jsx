import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  Button,
  CheckboxControl,
  DropdownMenu,
  MenuGroup,
  MenuItem,
  TextControl,
  Tooltip,
} from '@wordpress/components';
import { Page } from '@wordpress/admin-ui';
import {
  archive,
  category,
  chevronDown,
  chevronRight,
  customLink,
  dragHandle,
  file,
  home,
  image,
  moreVertical,
  page as pageIcon,
  plus,
  link as linkIconGlyph,
  postList,
  store,
  tag,
} from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { navigationAdvancedTargets } from '../../data/mockData';
import RenameMenuItemModal from './RenameMenuItemModal';
import DeleteMenuItemConfirmModal from '../modals/DeleteMenuItemConfirmModal';
import AddPagesToMenuModal from './AddPagesToMenuModal';

const MAX_MENU_LEVEL = 1;
const CONTROL_SELECTOR = 'button, a, input, select, textarea, [role="menuitem"]';
const LONG_PRESS_DRAG_DELAY_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 6;

const SOURCE_TYPE_META = {
  page: { label: 'Page', icon: pageIcon },
  post: { label: 'Post', icon: postList },
  product: { label: 'Product', icon: store },
  category: { label: 'Category', icon: category },
  tag: { label: 'Tag', icon: tag },
  brand: { label: 'Brand', icon: store },
  'product-category': { label: 'Product category', icon: category },
  'product-tag': { label: 'Product tag', icon: tag },
  'post-type-archive': { label: 'Archive', icon: archive },
  'media-image': { label: 'Image', icon: image },
  'media-document': { label: 'File', icon: file },
  media: { label: 'Media', icon: image },
  'custom-url': { label: 'Custom link', icon: customLink },
  email: { label: 'Email', icon: customLink },
  phone: { label: 'Phone', icon: customLink },
  anchor: { label: 'Anchor', icon: customLink },
  url: { label: 'Link', icon: linkIconGlyph },
};

function urlForPageSlug(slug) {
  if (!slug) {
    return '';
  }
  if (slug === 'home') {
    return '/';
  }
  return `/${slug.replace(/^\/+|\/+$/g, '')}/`;
}

function sourceTypeForUrl(url) {
  if (!url) return 'url';
  if (url.startsWith('mailto:')) return 'email';
  if (url.startsWith('tel:')) return 'phone';
  if (url.startsWith('#')) return 'anchor';
  return 'custom-url';
}

function slugFromUrl(url) {
  if (!url) {
    return '';
  }

  try {
    const parsedUrl = new URL(url, 'https://example.com');
    return parsedUrl.pathname.replace(/^\/+|\/+$/g, '') || parsedUrl.hostname;
  } catch {
    return url.replace(/^\/+|\/+$/g, '');
  }
}

function typeLabelForPage(page) {
  if (page?.isDynamic || page?.isCollection) {
    return page.collectionBadge || page.type || 'Archive';
  }
  return 'Page';
}

function roleLabelForPage(page) {
  if (page?.isFrontPage) {
    return 'Homepage';
  }
  return null;
}

function sourceTypeForPage(page) {
  if (page?.isFrontPage) {
    return 'page';
  }
  if (page?.isPostsPage || page?.isShopPage || page?.isArchiveListing) {
    return 'post-type-archive';
  }
  return 'page';
}

function statusLabelForTarget(status) {
  if (status === 'draft') {
    return 'Draft';
  }
  if (status === 'private') {
    return 'Private';
  }
  if (status === 'pending') {
    return 'Pending';
  }
  if (status === 'active') {
    return 'Active';
  }
  return 'Published';
}

function isLiveTarget(status) {
  return status === 'live' || status === 'published';
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}

function isMediaUrl(url) {
  return /\.(pdf|doc|docx|jpg|jpeg|png|gif|webp|svg|mp4|mov|mp3|wav)$/i.test(
    url,
  );
}

function isPreviewableTarget(sourceType, url) {
  if (!url) {
    return false;
  }
  if (isExternalUrl(url) || isMediaUrl(url)) {
    return false;
  }
  if (
    sourceType.startsWith('media') ||
    sourceType === 'custom-url' ||
    sourceType === 'email' ||
    sourceType === 'phone' ||
    sourceType === 'anchor'
  ) {
    return false;
  }

  return true;
}

function resolveMenuItemTarget(item, pages, advancedTargetsByUrl) {
  const linkedPage = item.pageId
    ? pages.find((page) => page.id === item.pageId)
    : null;

  if (linkedPage) {
    const sourceType = item.sourceType || sourceTypeForPage(linkedPage);
    const typeLabel = item.typeLabel || typeLabelForPage(linkedPage);
    const url = item.url || item.linkLabel || urlForPageSlug(linkedPage.slug);
    const status = linkedPage.status || item.status || 'live';
    return {
      sourceType,
      typeLabel,
      icon: linkedPage.isFrontPage
        ? home
        : linkedPage.isPostsPage
        ? postList
        : SOURCE_TYPE_META[sourceType]?.icon ?? pageIcon,
      roleLabel: item.roleLabel || roleLabelForPage(linkedPage),
      targetName: linkedPage.name,
      status,
      statusLabel: statusLabelForTarget(status),
      url,
      isLive: isLiveTarget(status),
      canPreview: true,
      previewPage: linkedPage,
    };
  }

  const advancedTarget = item.url ? advancedTargetsByUrl.get(item.url) : null;
  const sourceType =
    item.sourceType || advancedTarget?.sourceType || sourceTypeForUrl(item.url);
  const typeLabel =
    item.typeLabel ||
    advancedTarget?.typeLabel ||
    SOURCE_TYPE_META[sourceType]?.label ||
    'Link';
  const status = item.status || advancedTarget?.status || 'live';
  const url = item.url || item.linkLabel || '';
  const canPreview = isPreviewableTarget(sourceType, url);

  return {
    sourceType,
    typeLabel,
    icon: SOURCE_TYPE_META[sourceType]?.icon ?? linkIconGlyph,
    roleLabel: item.roleLabel || advancedTarget?.roleLabel || null,
    targetName: item.targetName || advancedTarget?.name || item.label,
    status,
    statusLabel: statusLabelForTarget(status),
    url,
    isLive: isLiveTarget(status),
    canPreview,
    previewPage: canPreview
      ? {
          id: item.pageId || advancedTarget?.pageId || item.id || url || item.label,
          slug: slugFromUrl(url),
          name: item.targetName || advancedTarget?.name || item.label,
          type: typeLabel,
          isLive: isLiveTarget(status),
          isSystem: false,
          isDynamic: true,
          category: 'content',
          status,
          sourceType,
        }
      : null,
  };
}

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

function MenuEditor({ menu, onUpdateMenu, onBack, onPreviewItem }) {
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
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [detailsAnchor, setDetailsAnchor] = useState(null);
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dropTarget, setDropTargetState] = useState(null);
  const [dragGhostPosition, setDragGhostPosition] = useState(null);
  const dragStateRef = useRef({ itemId: null });
  const didDragRef = useRef(false);
  const pendingPressRef = useRef(null);
  const clickCancelledRef = useRef(false);
  const detailsPopoverRef = useRef(null);

  const advancedTargetsByUrl = useMemo(() => {
    const entries = navigationAdvancedTargets
      .filter((target) => target.url)
      .map((target) => [target.url, target]);
    return new Map(entries);
  }, []);

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

  const clearPendingPress = useCallback(() => {
    const press = pendingPressRef.current;
    if (!press) {
      return;
    }

    window.clearTimeout(press.timerId);
    window.removeEventListener('pointermove', press.handleMove);
    window.removeEventListener('pointerup', press.handleUp);
    window.removeEventListener('pointercancel', press.handleCancel);
    pendingPressRef.current = null;
  }, []);

  const activatePendingDrag = useCallback(
    (press) => {
      if (pendingPressRef.current !== press) {
        return;
      }

      clearPendingPress();
      clickCancelledRef.current = true;
      didDragRef.current = true;
      dragStateRef.current.itemId = press.itemId;
      setSelectedItemId(null);
      setDetailsAnchor(null);
      setDraggingItemId(press.itemId);
      setDragGhostPosition({ x: press.lastX, y: press.lastY });
      setDropTarget(null);
    },
    [clearPendingPress, setDropTarget],
  );

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
        targetName: row.name,
        ...(row.typeLabel ? { typeLabel: row.typeLabel } : {}),
        ...(row.status ? { status: row.status } : {}),
        ...(row.isLive !== undefined ? { isLive: row.isLive } : {}),
        ...(row.linkLabel ? { linkLabel: row.linkLabel } : {}),
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
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setDetailsAnchor(null);
    }
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
      didDragRef.current = true;
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
      didDragRef.current = false;
      clickCancelledRef.current = false;
      setDraggingItemId(null);
      setDragGhostPosition(null);
      setDropTarget(null);
    };

    const cancelDrag = (event) => {
      if (event.key !== 'Escape') {
        return;
      }
      dragStateRef.current.itemId = null;
      didDragRef.current = false;
      clickCancelledRef.current = false;
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

  useEffect(() => () => clearPendingPress(), [clearPendingPress]);

  useEffect(() => {
    if (!selectedItemId) {
      return undefined;
    }

    const closeDetailsOnOutsidePointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (detailsPopoverRef.current?.contains(target)) {
        return;
      }

      if (target.closest('[data-nav-menu-item-id]')) {
        return;
      }

      setSelectedItemId(null);
      setDetailsAnchor(null);
    };

    document.addEventListener(
      'pointerdown',
      closeDetailsOnOutsidePointerDown,
      true,
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeDetailsOnOutsidePointerDown,
        true,
      );
    };
  }, [selectedItemId]);

  const beginItemPress = (event, itemId) => {
    if (event.button !== 0) {
      return;
    }
    if (event.target.closest(CONTROL_SELECTOR)) {
      return;
    }

    event.preventDefault();
    clearPendingPress();
    clickCancelledRef.current = false;
    didDragRef.current = false;

    const rowRect = event.currentTarget.getBoundingClientRect();
    const press = {
      itemId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      rowRect: {
        top: rowRect.top,
        left: rowRect.left,
        width: rowRect.width,
        height: rowRect.height,
      },
      timerId: null,
      handleMove: null,
      handleUp: null,
      handleCancel: null,
    };

    press.handleMove = (moveEvent) => {
      if (moveEvent.pointerId !== press.pointerId) {
        return;
      }

      const deltaX = moveEvent.clientX - press.startX;
      const deltaY = moveEvent.clientY - press.startY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > LONG_PRESS_MOVE_TOLERANCE) {
        clickCancelledRef.current = true;
        clearPendingPress();
        return;
      }

      press.lastX = moveEvent.clientX;
      press.lastY = moveEvent.clientY;
    };

    press.handleUp = (upEvent) => {
      if (upEvent.pointerId !== press.pointerId) {
        return;
      }
      clearPendingPress();
    };

    press.handleCancel = (cancelEvent) => {
      if (cancelEvent.pointerId !== press.pointerId) {
        return;
      }
      clickCancelledRef.current = true;
      clearPendingPress();
    };

    press.timerId = window.setTimeout(() => {
      activatePendingDrag(press);
    }, LONG_PRESS_DRAG_DELAY_MS);

    pendingPressRef.current = press;
    window.addEventListener('pointermove', press.handleMove);
    window.addEventListener('pointerup', press.handleUp);
    window.addEventListener('pointercancel', press.handleCancel);
  };

  const beginHandleDrag = (event, itemId) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    clearPendingPress();
    clickCancelledRef.current = true;
    didDragRef.current = true;
    dragStateRef.current.itemId = itemId;
    setSelectedItemId(null);
    setDetailsAnchor(null);
    setDraggingItemId(itemId);
    setDragGhostPosition({ x: event.clientX, y: event.clientY });
    setDropTarget(null);
  };

  const openItemDetails = (itemId, anchorElement) => {
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setDetailsAnchor(null);
      return;
    }

    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      const flyoutWidth = 284;
      const gutter = 12;
      const left = Math.min(
        rect.right + gutter,
        window.innerWidth - flyoutWidth - gutter,
      );

      setDetailsAnchor({
        top: Math.max(gutter, rect.top),
        left: Math.max(gutter, left),
      });
    }

    setSelectedItemId(itemId);
  };

  const handleItemPointerUp = (event, itemId) => {
    if (event.button !== 0) {
      return;
    }
    if (event.target.closest(CONTROL_SELECTOR)) {
      return;
    }

    const pendingPress = pendingPressRef.current;
    if (pendingPress?.itemId === itemId && pendingPress.pointerId === event.pointerId) {
      const shouldOpen = !clickCancelledRef.current;
      clearPendingPress();
      if (shouldOpen) {
        event.preventDefault();
        openItemDetails(itemId, event.currentTarget);
      }
      clickCancelledRef.current = false;
      return;
    }

    if (clickCancelledRef.current) {
      clickCancelledRef.current = false;
      return;
    }

    if (dragStateRef.current.itemId === itemId && !didDragRef.current) {
      event.preventDefault();
      openItemDetails(itemId, event.currentTarget);
    }
  };

  const handleItemKeyDown = (event, itemId) => {
    if (
      event.target !== event.currentTarget &&
      event.target.closest(CONTROL_SELECTOR)
    ) {
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    openItemDetails(itemId, event.currentTarget);
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

  const previewItemTarget = (targetMeta) => {
    if (!targetMeta.canPreview || !targetMeta.previewPage) {
      return;
    }

    onPreviewItem?.(targetMeta.previewPage);
    setSelectedItemId(null);
    setDetailsAnchor(null);
  };

  const renderTargetDetailsPopover = (item, targetMeta) => (
    <div
      ref={detailsPopoverRef}
      className="nav-item-details-popover"
      role="dialog"
      aria-label={`${item.label} link details`}
      style={detailsAnchor ?? undefined}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <TextControl
        __nextHasNoMarginBottom
        __next40pxDefaultSize
        className="nav-item-details-popover__text-control"
        label="Text"
        value={item.label}
        readOnly
        onChange={() => {}}
      />

      <div className="nav-item-details-popover__section">
        <label className="nav-item-details-popover__label">Link to</label>
        <button
          type="button"
          className="nav-item-details-popover__target-card"
          onClick={() => {
            window.alert('Changing the linked target is not implemented in this prototype.');
          }}
        >
          <div className="nav-item-details-popover__target-head">
            <strong>{targetMeta.targetName}</strong>
            <span
              className="nav-item-details-popover__chevron"
              aria-hidden="true"
            >
              {chevronDown}
            </span>
          </div>
          {targetMeta.url ? (
            <div className="nav-item-details-popover__path">
              {targetMeta.url}
            </div>
          ) : null}
          <div className="nav-item-details-popover__meta">
            <span className="nav-item-details-popover__meta-row">
              <span className="nav-item-details-popover__meta-label">
                Type
              </span>
              <span>{targetMeta.typeLabel}</span>
            </span>
            <span className="nav-item-details-popover__meta-row">
              <span className="nav-item-details-popover__meta-label">
                Status
              </span>
              <span className="nav-item-details-popover__status">
                <span
                  className={`url-dot${targetMeta.isLive ? '' : ' url-draft-dot'}`}
                  role="status"
                  aria-label={targetMeta.statusLabel}
                />
                {targetMeta.statusLabel}
              </span>
            </span>
          </div>
        </button>
      </div>

      <CheckboxControl
        __nextHasNoMarginBottom
        className="nav-item-details-popover__checkbox"
        label="Open in new tab"
        checked={openInNewTab}
        onChange={setOpenInNewTab}
      />

      <div className="nav-item-details-popover__footer">
        <Button
          variant="secondary"
          className="nav-item-details-popover__button"
        >
          Edit
        </Button>
        <Button
          variant="secondary"
          className="nav-item-details-popover__button"
          disabled={!targetMeta.canPreview}
          onClick={() => previewItemTarget(targetMeta)}
        >
          Preview
        </Button>
      </div>
    </div>
  );

  const renderMenuItem = (item, level = 0, siblings = [], index = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const canMoveUp = index > 0;
    const canMoveDown = index < siblings.length - 1;
    const targetMeta = resolveMenuItemTarget(
      item,
      allPages,
      advancedTargetsByUrl,
    );
    const rowIcon = targetMeta.icon;
    const isSelected = selectedItemId === item.id;
    const activeDropPosition =
      dropTarget?.itemId === item.id ? dropTarget.position : null;
    const rowClasses = [
      'nav-menu-editor-item',
      isSelected ? 'is-selected' : '',
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
          role="button"
          tabIndex={0}
          aria-expanded={isSelected}
          onPointerDown={(event) => beginItemPress(event, item.id)}
          onPointerUp={(event) => handleItemPointerUp(event, item.id)}
          onKeyDown={(event) => handleItemKeyDown(event, item.id)}
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

          <button
            type="button"
            className="nav-item-drag-handle"
            aria-label={`Drag ${item.label}`}
            onPointerDown={(event) => beginHandleDrag(event, item.id)}
          >
            {dragHandle}
          </button>
          <span className="nav-item-icon">{rowIcon}</span>
          <span className="nav-item-main">
            <span className="nav-item-label">{item.label}</span>
            {targetMeta.roleLabel ? (
              <span className="nav-item-role-label">
                {targetMeta.roleLabel}
              </span>
            ) : null}
            <Tooltip text={targetMeta.statusLabel} placement="top">
              <span className="nav-item-status-dot">
                <span
                  className={`url-dot${targetMeta.isLive ? '' : ' url-draft-dot'}`}
                  role="status"
                  aria-label={targetMeta.statusLabel}
                />
              </span>
            </Tooltip>
          </span>

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
        {isSelected ? renderTargetDetailsPopover(item, targetMeta) : null}

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
            Navigation Menus
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
