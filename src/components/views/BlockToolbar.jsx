import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@wordpress/components';
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
    const el = ref.current;
    const scrollEl = el?.closest('.edit-scroll');

    const scheduleClamp = () => {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = 0;
        clampToCanvas();
      });
    };

    scheduleClamp();

    if (!scrollEl || !el) {
      return () => cancelAnimationFrame(rafIdRef.current);
    }

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
      style={translateX ? { transform: `translateX(${translateX}px)` } : undefined}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Toolbar label={`${meta.label} block tools`} className="block-toolbar-bar">
        <ToolbarGroup>
          <ToolbarButton
            icon={Icon}
            text={meta.label}
            label={`${meta.label} — toggle document overview`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleListView();
            }}
          />
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton icon={dragHandle} label="Drag" />
          <ToolbarButton icon={chevronUp} label="Move up" />
          <ToolbarButton icon={chevronDown} label="Move down" />
        </ToolbarGroup>

        {isPatternSection ? (
          <ToolbarGroup>
            <ToolbarButton
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
          </ToolbarGroup>
        ) : null}

        {isTemplatePart && onGlobalPartEdit ? (
          <ToolbarGroup>
            {globalPartEditActive ? (
              <ToolbarButton
                isPressed
                onClick={(e) => {
                  e.stopPropagation();
                  onGlobalPartEditExit();
                }}
              >
                Exit
              </ToolbarButton>
            ) : (
              <ToolbarButton
                onClick={(e) => {
                  e.stopPropagation();
                  onGlobalPartEdit();
                }}
              >
                Edit
              </ToolbarButton>
            )}
          </ToolbarGroup>
        ) : null}

        <ToolbarGroup>
          <ToolbarButton icon={moreVertical} label="Options" />
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
}
