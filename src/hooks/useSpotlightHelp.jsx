import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, CheckboxControl } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import { useAppState } from './useAppState';

const SpotlightHelpContext = createContext(null);
const STORAGE_PREFIX = 'rsm-spotlight-help-opt-out:';
const TARGET_TIMEOUT_MS = 3000;
const TARGET_PADDING = 8;
const PANEL_GAP = 16;
const PANEL_WIDTH = 320;

function getStorageKey(id) {
  return `${STORAGE_PREFIX}${id}`;
}

function hasPersistedDismissal(id) {
  if (!id || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(getStorageKey(id)) === '1';
  } catch {
    return false;
  }
}

function persistDismissal(id) {
  if (!id || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getStorageKey(id), '1');
  } catch {
    /* Ignore storage failures so contextual help never blocks the prototype. */
  }
}

function getTargetRect(target) {
  if (!target) return null;
  const rect = target.getBoundingClientRect();
  const top = Math.max(TARGET_PADDING, rect.top - TARGET_PADDING);
  const left = Math.max(TARGET_PADDING, rect.left - TARGET_PADDING);
  const right = Math.min(window.innerWidth - TARGET_PADDING, rect.right + TARGET_PADDING);
  const bottom = Math.min(window.innerHeight - TARGET_PADDING, rect.bottom + TARGET_PADDING);
  return {
    top,
    left,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getPanelPosition(rect, placement = 'auto') {
  if (!rect || typeof window === 'undefined') {
    return { top: PANEL_GAP, left: PANEL_GAP };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxLeft = Math.max(PANEL_GAP, viewportWidth - PANEL_WIDTH - PANEL_GAP);
  const centeredTop = clamp(
    rect.top + rect.height / 2 - 92,
    PANEL_GAP,
    Math.max(PANEL_GAP, viewportHeight - 220),
  );

  if (
    (placement === 'auto' || placement === 'right') &&
    rect.right + PANEL_GAP + PANEL_WIDTH <= viewportWidth
  ) {
    return { top: centeredTop, left: rect.right + PANEL_GAP };
  }

  if (
    (placement === 'auto' || placement === 'left') &&
    rect.left - PANEL_GAP - PANEL_WIDTH >= PANEL_GAP
  ) {
    return { top: centeredTop, left: rect.left - PANEL_GAP - PANEL_WIDTH };
  }

  if (
    (placement === 'auto' || placement === 'bottom') &&
    rect.bottom + PANEL_GAP + 180 <= viewportHeight
  ) {
    return {
      top: rect.bottom + PANEL_GAP,
      left: clamp(rect.left + rect.width / 2 - PANEL_WIDTH / 2, PANEL_GAP, maxLeft),
    };
  }

  return {
    top: Math.max(PANEL_GAP, rect.top - PANEL_GAP - 180),
    left: clamp(rect.left + rect.width / 2 - PANEL_WIDTH / 2, PANEL_GAP, maxLeft),
  };
}

function SpotlightHelpOverlay({ request, rect, onDismiss }) {
  const [shouldPersistDismissal, setShouldPersistDismissal] = useState(false);
  const panelPosition = getPanelPosition(rect, request.placement);
  const targetStyle = rect
    ? {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }
    : undefined;

  const scrimStyles = rect
    ? {
        top: { top: 0, left: 0, right: 0, height: `${rect.top}px` },
        bottom: { top: `${rect.bottom}px`, left: 0, right: 0, bottom: 0 },
        left: {
          top: `${rect.top}px`,
          left: 0,
          width: `${rect.left}px`,
          height: `${rect.height}px`,
        },
        right: {
          top: `${rect.top}px`,
          left: `${rect.right}px`,
          right: 0,
          height: `${rect.height}px`,
        },
      }
    : null;

  return (
    <div
      className="spotlight-help"
      aria-live="polite"
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      {scrimStyles && (
        <>
          <button
            type="button"
            className="spotlight-help__scrim"
            style={scrimStyles.top}
            aria-label="Dismiss help"
            onClick={onDismiss}
          />
          <button
            type="button"
            className="spotlight-help__scrim"
            style={scrimStyles.bottom}
            aria-label="Dismiss help"
            onClick={onDismiss}
          />
          <button
            type="button"
            className="spotlight-help__scrim"
            style={scrimStyles.left}
            aria-label="Dismiss help"
            onClick={onDismiss}
          />
          <button
            type="button"
            className="spotlight-help__scrim"
            style={scrimStyles.right}
            aria-label="Dismiss help"
            onClick={onDismiss}
          />
        </>
      )}
      {rect && (
        <>
          <button
            type="button"
            className="spotlight-help__target-blocker"
            style={targetStyle}
            aria-label="Dismiss help"
            onClick={onDismiss}
          />
          <div className="spotlight-help__target-ring" style={targetStyle} />
        </>
      )}
      <section
        className="spotlight-help__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spotlight-help-title"
        style={{
          top: `${panelPosition.top}px`,
          left: `${panelPosition.left}px`,
        }}
      >
        <Button
          className="spotlight-help__close"
          icon={closeSmall}
          label="Dismiss help"
          onClick={onDismiss}
        />
        <p className="spotlight-help__kicker">Quick help</p>
        <h2 id="spotlight-help-title" className="spotlight-help__title">
          {request.title}
        </h2>
        <p className="spotlight-help__description">
          {request.description}
        </p>
        {request.persist && (
          <CheckboxControl
            className="spotlight-help__persist"
            label="Don't show this again"
            checked={shouldPersistDismissal}
            onChange={setShouldPersistDismissal}
          />
        )}
        <div className="spotlight-help__actions">
          <Button
            variant="primary"
            onClick={() =>
              onDismiss({ persistDismissal: shouldPersistDismissal })
            }
          >
            OK
          </Button>
        </div>
      </section>
    </div>
  );
}

export function SpotlightHelpProvider({ children }) {
  const { showSnackbar } = useAppState();
  const [activeRequest, setActiveRequest] = useState(null);
  const [targetRect, setTargetRect] = useState(null);
  const targetRef = useRef(null);

  const dismissActiveHelp = useCallback((options = {}) => {
    setActiveRequest((current) => {
      if (current?.persist && options.persistDismissal) {
        persistDismissal(current.id);
      }
      return null;
    });
    targetRef.current = null;
    setTargetRect(null);
  }, []);

  const requestSpotlightHelp = useCallback((request) => {
    if (!request?.id || !request?.target) return false;
    if (request.persist && hasPersistedDismissal(request.id)) return false;

    setTargetRect(null);
    targetRef.current = null;
    setActiveRequest({
      placement: 'auto',
      scrollIntoView: true,
      ...request,
      requestedAt: Date.now(),
    });
    return true;
  }, []);

  const value = useMemo(
    () => ({
      requestSpotlightHelp,
      dismissSpotlightHelp: dismissActiveHelp,
    }),
    [dismissActiveHelp, requestSpotlightHelp],
  );

  useEffect(() => {
    if (!activeRequest) return undefined;

    let rafId = 0;
    let timeoutId = 0;
    let cancelled = false;
    const startedAt = window.performance.now();

    const measure = () => {
      const target = targetRef.current;
      if (!target || !document.body.contains(target)) return;
      setTargetRect(getTargetRect(target));
    };

    const findTarget = () => {
      if (cancelled) return;
      const target = document.querySelector(activeRequest.target);

      if (target) {
        targetRef.current = target;
        if (activeRequest.scrollIntoView !== false) {
          target.scrollIntoView({
            block: 'center',
            inline: 'center',
            behavior: 'smooth',
          });
        }
        rafId = window.requestAnimationFrame(measure);
        return;
      }

      if (window.performance.now() - startedAt >= TARGET_TIMEOUT_MS) {
        setActiveRequest(null);
        setTargetRect(null);
        showSnackbar('Help target could not be found in this view.');
        return;
      }

      timeoutId = window.setTimeout(findTarget, 50);
    };

    findTarget();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [activeRequest, showSnackbar]);

  useEffect(() => {
    if (!activeRequest || !targetRef.current) return undefined;

    let rafId = 0;
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        setTargetRect(getTargetRect(targetRef.current));
      });
    };

    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('scroll', scheduleMeasure, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('scroll', scheduleMeasure, true);
    };
  }, [activeRequest]);

  useEffect(() => {
    if (!activeRequest) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismissActiveHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRequest, dismissActiveHelp]);

  return (
    <SpotlightHelpContext.Provider value={value}>
      {children}
      {activeRequest && targetRect && (
        <SpotlightHelpOverlay
          request={activeRequest}
          rect={targetRect}
          onDismiss={dismissActiveHelp}
        />
      )}
    </SpotlightHelpContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- provider and hook intentionally share one context module.
export function useSpotlightHelp() {
  const context = useContext(SpotlightHelpContext);
  if (!context) {
    throw new Error('useSpotlightHelp must be used within SpotlightHelpProvider');
  }
  return context;
}
