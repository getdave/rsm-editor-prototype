import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  TextControl,
  ToggleControl,
  Tooltip,
} from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { dragHandle, plus, trash, file, menu, help } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { getAdminNavItemById } from '../../constants/adminNav';

const HOME_LOCKED_TIP =
  "Home is always visible — it's the entry point to the editor, so it can't be turned off.";
const DEFAULT_SECTION_ID = 'group-main';

/** Display label per container type. Groups are never named. */
const TYPE_LABEL = { group: 'Group', folder: 'Folder', menu: 'Section' };
/** Folders use the file icon; menus use their own icon (default menus keep
 *  their original icon), falling back to the generic menu icon. */
const containerIconFor = (section) => {
  if (section.type === 'folder') return file;
  if (section.type === 'menu') return section.icon ?? menu;
  return null;
};

function SidebarNavCustomizer() {
  const {
    navLayout,
    homepageDisplayMode,
    toggleNavItemVisibility,
    moveNavLayoutEntry,
    addNavContainer,
    resetNavLayout,
    renameNavSection,
    deleteNavSection,
    exitNavEditMode,
  } = useAppState();

  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTargetState] = useState(null);
  const [ghostPosition, setGhostPosition] = useState(null);
  const dragStateRef = useRef({ id: null });

  const setDropTarget = useCallback((next) => {
    setDropTargetState((prev) => {
      if (
        prev?.targetId === next?.targetId &&
        prev?.position === next?.position &&
        prev?.sectionId === next?.sectionId
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  // Map every member item id to the section it lives in (for drop highlighting).
  const memberSectionMap = useMemo(() => {
    const map = new Map();
    for (const entry of navLayout) {
      if (entry.kind === 'section') {
        for (const item of entry.items ?? []) {
          map.set(item.id, entry.id);
        }
      }
    }
    return map;
  }, [navLayout]);

  const isDraggingSection = useMemo(
    () => navLayout.some((e) => e.kind === 'section' && e.id === draggingId),
    [navLayout, draggingId],
  );

  const getEntryLabel = useCallback(
    (id) => {
      const top = navLayout.find((e) => e.id === id);
      if (top) {
        if (top.kind === 'section') {
          if (top.id === DEFAULT_SECTION_ID) return 'Default';
          if (top.type === 'group') return 'Group';
          return top.label || `New ${TYPE_LABEL[top.type]?.toLowerCase() ?? 'section'}`;
        }
        return getAdminNavItemById(top.id, homepageDisplayMode)?.label ?? top.id;
      }
      return getAdminNavItemById(id, homepageDisplayMode)?.label ?? id;
    },
    [navLayout, homepageDisplayMode],
  );

  const draggingLabel = draggingId ? getEntryLabel(draggingId) : '';

  const resolveDrop = useCallback(
    (clientX, clientY) => {
      const draggedId = dragStateRef.current.id;
      if (!draggedId) return null;
      const el = document.elementFromPoint(clientX, clientY);
      if (!el) return null;

      const draggingSec = navLayout.some(
        (e) => e.kind === 'section' && e.id === draggedId,
      );

      if (draggingSec) {
        // Sections reorder only among top-level entries.
        const row = el.closest('[data-nav-toplevel]');
        if (!row) return null;
        const targetId = row.dataset.navEntryId;
        if (targetId === draggedId) return null;
        const rect = row.getBoundingClientRect();
        const position =
          clientY - rect.top < rect.height / 2 ? 'above' : 'below';
        return { targetId, position, sectionId: null };
      }

      const row = el.closest('[data-nav-entry-id]');
      if (row) {
        const targetId = row.dataset.navEntryId;
        if (targetId === draggedId) return null;
        // Dropping onto a container header drops the item inside that container.
        if (row.dataset.sectionHeader != null) {
          return { targetId, position: 'inside', sectionId: targetId };
        }
        // Otherwise it's a member item — reorder within its container only.
        // Items never escape to the top level.
        const sectionId = memberSectionMap.get(targetId);
        if (!sectionId) return null;
        const rect = row.getBoundingClientRect();
        const firstHalf = clientY - rect.top < rect.height / 2;
        return { targetId, position: firstHalf ? 'above' : 'below', sectionId };
      }

      const sectionBox = el.closest('[data-section-dropzone]');
      if (sectionBox) {
        const sid = sectionBox.dataset.sectionDropzone;
        return { targetId: sid, position: 'inside', sectionId: sid };
      }
      return null;
    },
    [navLayout, memberSectionMap],
  );

  useEffect(() => {
    if (!draggingId) return undefined;

    const handlePointerMove = (event) => {
      event.preventDefault();
      setGhostPosition({ x: event.clientX, y: event.clientY });
      setDropTarget(resolveDrop(event.clientX, event.clientY));
    };

    const finishDrag = (event) => {
      event.preventDefault();
      const target = resolveDrop(event.clientX, event.clientY);
      const draggedId = dragStateRef.current.id;
      if (draggedId && target) {
        moveNavLayoutEntry(draggedId, target.targetId, target.position);
      }
      dragStateRef.current.id = null;
      setDraggingId(null);
      setGhostPosition(null);
      setDropTarget(null);
    };

    const cancelDrag = (event) => {
      if (event.key !== 'Escape') return;
      dragStateRef.current.id = null;
      setDraggingId(null);
      setGhostPosition(null);
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
  }, [draggingId, moveNavLayoutEntry, resolveDrop, setDropTarget]);

  const startDrag = (event, id) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStateRef.current.id = id;
    setDraggingId(id);
    setGhostPosition({ x: event.clientX, y: event.clientY });
    setDropTarget(null);
  };

  const dragHandleFor = (id) => (
    <span
      className="snc-drag-handle"
      aria-label="Drag to reorder"
      role="button"
      tabIndex={-1}
      onPointerDown={(event) => startDrag(event, id)}
    >
      {dragHandle}
    </span>
  );

  const dropLineClass = (id) =>
    dropTarget?.targetId === id &&
    (dropTarget.position === 'above' || dropTarget.position === 'below')
      ? `is-drop-${dropTarget.position}`
      : '';

  const renderItemRow = (entry, { isTopLevel }) => {
    const item = getAdminNavItemById(entry.id, homepageDisplayMode);
    if (!item) return null;
    const isLocked = entry.id === 'home';
    const rowClass = [
      'snc-row',
      'snc-row--item',
      isTopLevel ? '' : 'snc-row--member',
      draggingId === entry.id ? 'is-dragging' : '',
      dropLineClass(entry.id),
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        key={entry.id}
        className={rowClass}
        data-nav-entry-id={entry.id}
        {...(isTopLevel ? { 'data-nav-toplevel': '' } : {})}
      >
        {dragHandleFor(entry.id)}
        {isLocked ? (
          <>
            <span className="snc-locked-name">{item.label}</span>
            <Tooltip text={HOME_LOCKED_TIP} placement="top">
              <Button
                className="snc-help"
                icon={help}
                size="small"
                showTooltip={false}
                label="Why can't this be turned off?"
              />
            </Tooltip>
            <ToggleControl
              className="snc-item-toggle snc-item-toggle--end"
              label={item.label}
              hideLabelFromVision
              checked
              disabled
              __nextHasNoMarginBottom
            />
          </>
        ) : (
          <ToggleControl
            className="snc-item-toggle"
            label={item.label}
            checked={!entry.hidden}
            onChange={() => toggleNavItemVisibility(entry.id)}
            __nextHasNoMarginBottom
          />
        )}
      </div>
    );
  };

  const renderContainer = (section) => {
    const items = section.items ?? [];
    const type = section.type ?? 'folder';
    const isDefaultSection = section.id === DEFAULT_SECTION_ID;
    const typeLabel = TYPE_LABEL[type] ?? 'Folder';
    const icon = containerIconFor(section);
    const sectionClass = [
      'snc-section',
      `snc-section--${type}`,
      draggingId === section.id ? 'is-dragging' : '',
      dropTarget?.sectionId === section.id && !isDraggingSection
        ? 'is-drop-into'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
    const headerClass = ['snc-row', 'snc-row--section', dropLineClass(section.id)]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        key={section.id}
        className={sectionClass}
        data-section-dropzone={section.id}
      >
        <div
          className={headerClass}
          data-nav-entry-id={section.id}
          data-nav-toplevel=""
          data-section-header=""
        >
          {dragHandleFor(section.id)}
          {icon && (
            <span className="snc-container-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {type === 'group' ? (
            <Text variant="body-sm" className="snc-container-label">
              {isDefaultSection ? 'Default' : 'Group'}
            </Text>
          ) : (
            <TextControl
              className="snc-section-input"
              label={`${typeLabel.toLowerCase()} name`}
              hideLabelFromVision
              value={section.label}
              placeholder={`New ${typeLabel.toLowerCase()}`}
              onChange={(value) => renameNavSection(section.id, value)}
              __nextHasNoMarginBottom
            />
          )}
          {!isDefaultSection && (
            <Button
              className="snc-delete-section"
              icon={trash}
              label="Delete section"
              size="small"
              onClick={() => deleteNavSection(section.id)}
            />
          )}
        </div>
        <div className="snc-section-body">
          {items.length === 0 ? (
            <Text variant="body-sm" className="snc-section-placeholder">
              Drag and drop items
            </Text>
          ) : (
            items.map((item) => renderItemRow(item, { isTopLevel: false }))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="snc">
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        className="snc-header"
      >
        <Text variant="body-sm" className="snc-title">
          Customize navigation
        </Text>
      </Stack>

      <div className="snc-list">
        {navLayout.map((entry) =>
          entry.kind === 'section'
            ? renderContainer(entry)
            : renderItemRow(entry, { isTopLevel: true }),
        )}
        <Button
          className="snc-add"
          icon={plus}
          variant="secondary"
          onClick={() => addNavContainer('menu')}
        >
          Add section
        </Button>
      </div>

      <Stack
        direction="row"
        align="center"
        justify="space-between"
        gap="sm"
        className="snc-footer"
      >
        <Button
          className="snc-reset"
          variant="tertiary"
          onClick={resetNavLayout}
        >
          Reset sidebar
        </Button>
        <Button
          className="snc-done"
          variant="primary"
          onClick={exitNavEditMode}
        >
          Done
        </Button>
      </Stack>

      {draggingId && ghostPosition ? (
        <div
          className="snc-drag-ghost"
          style={{
            transform: `translate3d(${ghostPosition.x + 12}px, ${ghostPosition.y + 12}px, 0)`,
          }}
          aria-hidden="true"
        >
          <span className="snc-drag-ghost__icon">{dragHandle}</span>
          <span className="snc-drag-ghost__label">{draggingLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

export default SidebarNavCustomizer;
