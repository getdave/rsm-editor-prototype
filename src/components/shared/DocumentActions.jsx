import { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, MenuGroup, MenuItem, Tooltip } from '@wordpress/components';
import { Stack } from '@wordpress/ui';
import {
  chevronDown,
  page as pageIcon,
  postList,
} from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';

function docTypeIcon(page) {
  if (page?.isPostsPage) return postList;
  return pageIcon;
}

/**
 * Optional label shown instead of the current page title (e.g. when a global template
 * part is selected with peer spotlight). When set, inline rename is disabled.
 */
export default function DocumentActions({ documentLabelOverride = null }) {
  const { currentPage, setCurrentPageName } = useAppState();
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (documentLabelOverride != null) setEditing(false);
  }, [documentLabelOverride]);

  useEffect(() => {
    if (editing && ref.current && documentLabelOverride == null) {
      ref.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editing, documentLabelOverride]);

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

  const isGlobalOverride = documentLabelOverride != null;
  const nameTooltipText = isGlobalOverride ? 'Global template part' : 'Rename page';

  return (
    <Stack
      direction="row"
      align="center"
      gap="xs"
      className={`doc-actions${isGlobalOverride ? ' doc-actions--global' : ''}`}
    >
      <Tooltip text={nameTooltipText} placement="bottom">
        <span
          className={`ct-btn doc-actions-name${editing ? ' is-editing' : ''}${isGlobalOverride ? ' doc-actions-name--readonly' : ''}`}
          onClick={() => !isGlobalOverride && !editing && setEditing(true)}
        >
          <span
            className="preview-bar-doc-icon"
            aria-hidden="true"
            contentEditable={false}
          >
            {docTypeIcon(currentPage)}
          </span>
          {isGlobalOverride ? (
            <span className="doc-actions-name-text" aria-live="polite">
              {documentLabelOverride}
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

      <Tooltip text={statusLabel} placement="bottom">
        <span className="preview-bar-doc-status">
          <span
            className={`url-dot${isLive ? '' : ' url-draft-dot'}`}
            role="status"
            aria-label={statusLabel}
          />
        </span>
      </Tooltip>

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
