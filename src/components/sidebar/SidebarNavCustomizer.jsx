import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, TextControl, ToggleControl } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { dragHandle, plus, trash } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { getAdminNavItemById } from '../../constants/adminNav';

/**
 * Final splice index for moveLayoutEntry given a drop relative to a target row.
 * `position` is 'above' | 'below'. Accounts for the dragged entry being removed
 * before re-insertion.
 */
function computeToIndex(layout, draggedId, targetId, position) {
  const fromIndex = layout.findIndex((entry) => entry.id === draggedId);
  const targetIndex = layout.findIndex((entry) => entry.id === targetId);
  if (fromIndex === -1 || targetIndex === -1) {
    return null;
  }
  const desiredIndex = position === 'below' ? targetIndex + 1 : targetIndex;
  const toIndex = fromIndex < desiredIndex ? desiredIndex - 1 : desiredIndex;
  return { fromIndex, toIndex };
}

function SidebarNavCustomizer() {
  const {
    navLayout,
    homepageDisplayMode,
    toggleNavItemVisibility,
    reorderNavLayout,
    addNavSection,
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
      if (prev?.id === next?.id && prev?.position === next?.position) {
        return prev;
      }
      return next;
    });
  }, []);

  const labelForEntry = useCallback(
    (entry) =>
      entry.kind === 'section'
        ? entry.label
        : getAdminNavItemById(entry.id, homepageDisplayMode)?.label ?? entry.id,
    [homepageDisplayMode],
  );

  const draggingLabel = useMemo(() => {
    if (!draggingId) return '';
    const entry = navLayout.find((e) => e.id === draggingId);
    return entry ? labelForEntry(entry) : '';
  }, [draggingId, navLayout, labelForEntry]);

  const resolveDrop = useCallback((clientX, clientY) => {
    const draggedId = dragStateRef.current.id;
    if (!draggedId) return null;
    const element = document.elementFromPoint(clientX, clientY);
    const row = element?.closest?.('[data-nav-entry-id]');
    if (!row) return null;
    const targetId = row.dataset.navEntryId;
    if (targetId === draggedId) return null;
    const rect = row.getBoundingClientRect();
    const position = clientY - rect.top < rect.height / 2 ? 'above' : 'below';
    return { id: targetId, position };
  }, []);

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
        const indices = computeToIndex(
          navLayout,
          draggedId,
          target.id,
          target.position,
        );
        if (indices) {
          reorderNavLayout(indices.fromIndex, indices.toIndex);
        }
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
  }, [draggingId, navLayout, reorderNavLayout, resolveDrop, setDropTarget]);

  const startDrag = (event, id) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStateRef.current.id = id;
    setDraggingId(id);
    setGhostPosition({ x: event.clientX, y: event.clientY });
    setDropTarget(null);
  };

  const renderRow = (entry) => {
    const dropPosition =
      dropTarget?.id === entry.id ? dropTarget.position : null;
    const rowClass = [
      'snc-row',
      `snc-row--${entry.kind}`,
      draggingId === entry.id ? 'is-dragging' : '',
      dropPosition ? `is-drop-${dropPosition}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const handle = (
      <span
        className="snc-drag-handle"
        aria-label="Drag to reorder"
        role="button"
        tabIndex={-1}
        onPointerDown={(event) => startDrag(event, entry.id)}
      >
        {dragHandle}
      </span>
    );

    if (entry.kind === 'section') {
      return (
        <div key={entry.id} className={rowClass} data-nav-entry-id={entry.id}>
          {handle}
          <TextControl
            className="snc-section-input"
            label="Section name"
            hideLabelFromVision
            value={entry.label}
            placeholder="Section name"
            onChange={(value) => renameNavSection(entry.id, value)}
            __nextHasNoMarginBottom
          />
          <Button
            className="snc-delete-section"
            icon={trash}
            label="Delete section"
            size="small"
            onClick={() => deleteNavSection(entry.id)}
          />
        </div>
      );
    }

    const item = getAdminNavItemById(entry.id, homepageDisplayMode);
    if (!item) return null;
    // Home is the admin landing surface — always visible, toggle locked on.
    const isLocked = entry.id === 'home';
    return (
      <div key={entry.id} className={rowClass} data-nav-entry-id={entry.id}>
        {handle}
        <ToggleControl
          className="snc-item-toggle"
          label={item.label}
          checked={isLocked ? true : !entry.hidden}
          disabled={isLocked}
          onChange={() => toggleNavItemVisibility(entry.id)}
          __nextHasNoMarginBottom
        />
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

      <div className="snc-list">{navLayout.map(renderRow)}</div>

      <Stack direction="column" gap="sm" className="snc-footer">
        <Button
          className="snc-add-section"
          icon={plus}
          variant="secondary"
          onClick={addNavSection}
        >
          Add section
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
