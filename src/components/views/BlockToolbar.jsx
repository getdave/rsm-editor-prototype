import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@wordpress/components';
import { Text } from '@wordpress/ui';
import {
  chevronDown,
  chevronUp,
  dragHandle,
  moreVertical,
  styles,
} from '@wordpress/icons';

const EDGE = 8;

/** Keep the floating block toolbar visible inside `.edit-scroll` (flip below / clamp X). */
export default function BlockToolbar({
  toolbarKey,
  meta,
  onToggleListView,
  settingsSidebarOpen,
  setInspectorFlashSignal,
  setInspectorBlockTabSignal,
  setSettingsSidebarOpen,
  globalPartEditActive = false,
  onGlobalPartEdit,
  onGlobalPartEditExit,
}) {
  const ref = useRef(null);
  const rafIdRef = useRef(0);
  const [flipBelow, setFlipBelow] = useState(false);
  const [translateX, setTranslateX] = useState(0);

  const Icon = meta.icon;
  const isPatternSection = Boolean(meta.isPatternSection);
  const isTemplatePart = Boolean(meta.isTemplatePart);

  const clampToCanvas = useCallback(() => {
    const el = ref.current;
    const scrollEl = el?.closest('.edit-scroll');
    if (!el || !scrollEl) {
      flushSync(() => {
        setFlipBelow(false);
        setTranslateX(0);
      });
      return;
    }

    const sr = scrollEl.getBoundingClientRect();

    flushSync(() => {
      setFlipBelow(false);
      setTranslateX(0);
    });

    let rect = el.getBoundingClientRect();
    let flip = rect.top < sr.top + EDGE;

    if (flip) {
      flushSync(() => setFlipBelow(true));
      rect = el.getBoundingClientRect();

      if (rect.bottom > sr.bottom - EDGE) {
        flushSync(() => setFlipBelow(false));
        rect = el.getBoundingClientRect();
      }
    }

    let dx = 0;
    if (rect.left + dx < sr.left + EDGE) dx = sr.left + EDGE - rect.left;
    if (rect.right + dx > sr.right - EDGE) dx = sr.right - EDGE - rect.right;
    flushSync(() => setTranslateX(dx));
  }, []);

  useLayoutEffect(() => {
    clampToCanvas();

    const el = ref.current;
    const scrollEl = el?.closest('.edit-scroll');
    if (!scrollEl || !el) return undefined;

    const scheduleClamp = () => {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = 0;
        clampToCanvas();
      });
    };

    scrollEl.addEventListener('scroll', scheduleClamp, { passive: true });
    window.addEventListener('resize', scheduleClamp);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(scheduleClamp);
      ro.observe(scrollEl);
      ro.observe(el);
    }

    return () => {
      scrollEl.removeEventListener('scroll', scheduleClamp);
      window.removeEventListener('resize', scheduleClamp);
      cancelAnimationFrame(rafIdRef.current);
      if (ro) ro.disconnect();
    };
  }, [toolbarKey, globalPartEditActive, clampToCanvas]);

  return (
    <div
      ref={ref}
      className={`sec-bar block-toolbar${isPatternSection ? ' block-toolbar--pattern-section' : ''}${isTemplatePart ? ' block-toolbar--template-part' : ''}${flipBelow ? ' block-toolbar--flip-below' : ''}`}
      role="toolbar"
      style={translateX ? { transform: `translateX(${translateX}px)` } : undefined}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="bt-pill">
        <Button
          className="bt-pill-icon"
          label={`${meta.label} — toggle document overview`}
          icon={Icon}
          onClick={(e) => {
            e.stopPropagation();
            onToggleListView();
          }}
        />
        <Text variant="body-sm" className="bt-pill-label">{meta.label}</Text>
      </div>
      <span className="bt-sep" aria-hidden />
      <Button className="bt-tb-btn" label="Drag" icon={dragHandle} />
      <div className="bt-move-stack" role="group" aria-label="Reorder">
        <Button className="bt-move-btn" label="Move up" icon={chevronUp} iconSize={14} />
        <Button className="bt-move-btn" label="Move down" icon={chevronDown} iconSize={14} />
      </div>
      <span className="bt-sep" aria-hidden />
      {isPatternSection ? (
        <>
          <Button
            className="bt-tb-edit"
            variant="tertiary"
            icon={styles}
            label="Change Design"
            onClick={(e) => {
              e.stopPropagation();
              if (settingsSidebarOpen) {
                setInspectorFlashSignal((n) => n + 1);
              }
              setInspectorBlockTabSignal((n) => n + 1);
              setSettingsSidebarOpen(true);
            }}
          />
          <span className="bt-sep" aria-hidden />
        </>
      ) : null}
      {isTemplatePart && onGlobalPartEdit ? (
        <>
          {globalPartEditActive ? (
            <div className="bt-global-part-actions" role="group" aria-label="Editing global template part">
              <Button
                variant="primary"
                className="bt-tb-edit bt-global-part-exit"
                onClick={(e) => {
                  e.stopPropagation();
                  onGlobalPartEditExit();
                }}
              >
                Exit
              </Button>
            </div>
          ) : (
            <Button
              variant="tertiary"
              className="bt-tb-edit"
              onClick={(e) => {
                e.stopPropagation();
                onGlobalPartEdit();
              }}
            >
              Edit
            </Button>
          )}
          <span className="bt-sep" aria-hidden />
        </>
      ) : null}
      <Button className="bt-tb-btn" label="Options" icon={moreVertical} />
    </div>
  );
}
