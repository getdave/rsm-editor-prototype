import { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, MenuGroup, MenuItem, Tooltip } from '@wordpress/components';
import { Stack } from '@wordpress/ui';
import {
  chevronDown,
  layout,
  page as pageIcon,
  postList,
} from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';

function docTypeIcon(page) {
  if (page?.isPostsPage) return postList;
  return pageIcon;
}

/**
 * Props:
 * - `documentLabelOverride`: optional label shown instead of the current page title
 *   (e.g. when a global template part is selected with peer spotlight). When set,
 *   inline rename is disabled.
 * - `isTemplate`: switches the header into template-editing presentation — a
 *   "Template" badge before the name field, the `layout` icon, a fixed
 *   "Template title" label, and no live/draft status dot. Inline rename is
 *   disabled. When both props are set, `documentLabelOverride` wins for the
 *   name text (more specific spotlight context).
 */
export default function DocumentActions({
  documentLabelOverride = null,
  isTemplate = false,
}) {
  const { currentPage, setCurrentPageName } = useAppState();
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  const isGlobalOverride = documentLabelOverride != null;
  const isReadonly = isGlobalOverride || isTemplate;

  useEffect(() => {
    if (isReadonly) setEditing(false);
  }, [isReadonly]);

  useEffect(() => {
    if (editing && ref.current && !isReadonly) {
      ref.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editing, isReadonly]);

  const commit = () => {
    const next = ref.current?.innerText.trim();
    if (next && next !== currentPage.name) {
      setCurrentPageName(next);
    } else if (ref.current) {
      ref.current.innerText = currentPage.name;
    }
    setEditing(false);
  };

  const cancel = () => {
    if (ref.current) ref.current.innerText = currentPage.name;
    setEditing(false);
  };

  const isLive = currentPage.isLive;
  const statusLabel = isLive ? 'Page is live' : 'Page is a draft';

  const nameTooltipText = isGlobalOverride
    ? 'Global template part'
    : isTemplate
      ? 'Template title'
      : 'Rename page';

  const docIcon = isTemplate ? layout : docTypeIcon(currentPage);

  return (
    <Stack
      direction="row"
      align="center"
      gap="xs"
      className={`doc-actions${isGlobalOverride ? ' doc-actions--global' : ''}`}
    >
      {isTemplate && (
        <span className="components-badge is-default">
          <span className="components-badge__flex-wrapper">
            <span className="components-badge__content">Template</span>
          </span>
        </span>
      )}
      <Tooltip text={nameTooltipText} placement="bottom">
        <span
          className={`ct-btn doc-actions-name${editing ? ' is-editing' : ''}${isReadonly ? ' doc-actions-name--readonly' : ''}`}
          onClick={() => !isReadonly && !editing && setEditing(true)}
        >
          <span
            className="preview-bar-doc-icon"
            aria-hidden="true"
            contentEditable={false}
          >
            {docIcon}
          </span>
          {isReadonly ? (
            <span className="doc-actions-name-text" aria-live="polite">
              {documentLabelOverride ?? 'Template title'}
            </span>
          ) : (
            <span
              ref={ref}
              className="doc-actions-name-text"
              contentEditable={editing}
              suppressContentEditableWarning
              role="textbox"
              tabIndex={0}
              onBlur={editing ? commit : undefined}
              onKeyDown={(e) => {
                if (!editing) return;
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancel();
                }
              }}
            >
              {currentPage.name}
            </span>
          )}
        </span>
      </Tooltip>

      {!isTemplate && (
        <Tooltip text={statusLabel} placement="bottom">
          <span className="preview-bar-doc-status">
            <span
              className={`url-dot${isLive ? '' : ' url-draft-dot'}`}
              role="status"
              aria-label={statusLabel}
            />
          </span>
        </Tooltip>
      )}

      <Dropdown
        renderToggle={({ isOpen, onToggle }) => (
          <Button
            className="ct-icon-btn"
            onClick={onToggle}
            aria-expanded={isOpen}
            label="Document options"
            icon={chevronDown}
            iconSize={20}
          />
        )}
        renderContent={() => (
          <MenuGroup label="Document">
            <MenuItem disabled>Coming soon</MenuItem>
          </MenuGroup>
        )}
      />
    </Stack>
  );
}
