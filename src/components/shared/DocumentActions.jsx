import { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, MenuGroup, MenuItem, Tooltip } from '@wordpress/components';
import { Stack } from '@wordpress/ui';
import {
  chevronDown,
  home,
  layout,
  page as pageIcon,
  postList,
  styles,
} from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';

function docTypeIcon(page) {
  if (page?.isPageDesign) return styles;
  if (page?.isFrontPage) return home;
  if (page?.isPostsPage) return postList;
  return pageIcon;
}

/**
 * Props:
 * - `document`: optional document target for contextual page-design editing.
 * - `canRename`: disables inline rename for read-only contextual documents.
 * - `documentLabelOverride`: optional label shown instead of the current title
 *   when a global template part is selected with peer spotlight.
 * - `isTemplate`: switches the header into template-editing presentation.
 * - `templateTitle`: optional template label shown in template-editing mode.
 */
export default function DocumentActions({
  document: documentProp = null,
  canRename = true,
  documentLabelOverride = null,
  isTemplate = false,
  templateTitle = null,
}) {
  const { currentPage, setCurrentPageName } = useAppState();
  const activeDocument = documentProp || currentPage;
  const isGlobalOverride = documentLabelOverride != null;
  const renameEnabled = canRename && !activeDocument?.isPageDesign && !isGlobalOverride && !isTemplate;
  const isReadonly = !renameEnabled;
  const [editing, setEditing] = useState(false);
  const isEditing = editing && !isReadonly;
  const ref = useRef(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditing]);

  const documentName = activeDocument?.name ?? 'Untitled';
  const displayName = isGlobalOverride
    ? documentLabelOverride
    : isTemplate
      ? templateTitle ?? documentName
      : documentName;

  const commit = () => {
    const next = ref.current?.innerText.trim();
    if (renameEnabled && next && next !== documentName) {
      setCurrentPageName(next);
    } else if (ref.current) {
      ref.current.innerText = documentName;
    }
    setEditing(false);
  };

  const cancel = () => {
    if (ref.current) ref.current.innerText = documentName;
    setEditing(false);
  };

  const isLive = activeDocument?.isLive;
  const statusLabel = activeDocument?.isPageDesign
    ? 'Design is active'
    : isLive ? 'Page is live' : 'Page is a draft';

  const nameTooltipText = isGlobalOverride
    ? 'Global template part'
    : isTemplate
      ? displayName
      : renameEnabled ? 'Rename page' : documentName;

  const docIcon = isTemplate ? layout : docTypeIcon(activeDocument);

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
          className={`ct-btn doc-actions-name${isEditing ? ' is-editing' : ''}${isReadonly ? ' doc-actions-name--readonly' : ''}`}
          onClick={() => renameEnabled && !editing && setEditing(true)}
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
              {displayName}
            </span>
          ) : (
            <span
              ref={ref}
              className="doc-actions-name-text"
              contentEditable={isEditing}
              suppressContentEditableWarning
              role="textbox"
              tabIndex={0}
              onBlur={isEditing ? commit : undefined}
              onKeyDown={(e) => {
                if (!isEditing) return;
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancel();
                }
              }}
            >
              {documentName}
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
