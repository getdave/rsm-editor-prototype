import { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, MenuGroup, MenuItem, Tooltip } from '@wordpress/components';
import { Badge, Stack } from '@wordpress/ui';
import { chevronDown, chevronRight } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { EDITOR_MODES } from '../../services/blockEditorMode';
import { docTypeIcon } from '../../utils/docTypeIcon';
import { getDocumentOptionsLabel } from '../../utils/documentOptionsLabel';

/**
 * Props:
 * - `document`: optional document target for contextual page-design editing.
 * - `canRename`: disables inline rename for read-only contextual documents.
 * - `documentLabelOverride`: optional label shown instead of the current title
 *   when a global template part is selected with peer spotlight.
 * - `documentIconOverride`: optional icon shown instead of the page-type icon
 *   for the current cluster (used together with `documentLabelOverride`).
 * - `breadcrumbParent`: `{ icon, label, onClick }` — when set, renders a
 *   clickable parent icon plus a chevron-right separator before the current
 *   document cluster. Click runs `onClick` (same behaviour as the floating
 *   toolbar Exit). `label` is the tooltip text.
 * - `mode`: Block Editor mode (`'page' | 'template'`). The template mode swaps
 *   icon, badge, and disables rename.
 * - `templateTitle`: optional template label shown in template mode.
 * - `documentOptions`: optional document menu actions.
 */
export default function DocumentActions({
  document: documentProp = null,
  canRename = true,
  documentLabelOverride = null,
  documentIconOverride = null,
  breadcrumbParent = null,
  mode = EDITOR_MODES.PAGE,
  templateTitle = null,
  documentOptions = [],
}) {
  const isTemplate = mode === EDITOR_MODES.TEMPLATE;
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
    : isLive ? 'Page is published' : 'Page is a draft';

  const nameTooltipText = isGlobalOverride
    ? 'Global template part'
    : isTemplate
      ? displayName
      : renameEnabled ? 'Rename page' : documentName;

  const docIcon = documentIconOverride
    ?? docTypeIcon(activeDocument, { isTemplate });

  const showStatusDot = !isTemplate && !isGlobalOverride;
  const documentOptionsLabel = getDocumentOptionsLabel(activeDocument, {
    isGlobalOverride,
    isTemplate,
  });

  return (
    <Stack
      direction="row"
      align="center"
      gap="xs"
      className={`doc-actions${breadcrumbParent ? ' doc-actions--has-breadcrumb' : ''}`}
    >
      {breadcrumbParent && (
        <>
          <Tooltip text={`Go to: ${breadcrumbParent.label}`} placement="bottom">
            <button
              type="button"
              className="doc-actions-breadcrumb-parent"
              onClick={breadcrumbParent.onClick}
              aria-label={`Go to: ${breadcrumbParent.label}`}
            >
              <span className="preview-bar-doc-icon" aria-hidden="true">
                {breadcrumbParent.icon}
              </span>
            </button>
          </Tooltip>
          <span className="doc-actions-breadcrumb-sep" aria-hidden="true">
            {chevronRight}
          </span>
        </>
      )}

      <div
        className={`doc-actions-current${isGlobalOverride ? ' doc-actions-current--global' : ''}`}
      >
        {isTemplate && !breadcrumbParent && (
          <Badge className="doc-template-badge">Template</Badge>
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

        {showStatusDot && (
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

        {documentOptions.length > 0 && (
          <Dropdown
            renderToggle={({ isOpen, onToggle }) => (
              <Button
                className="ct-icon-btn"
                onClick={onToggle}
                aria-expanded={isOpen}
                label={documentOptionsLabel}
                icon={chevronDown}
              />
            )}
            renderContent={({ onClose }) => (
              <MenuGroup label={documentOptionsLabel}>
                {documentOptions.map((option) => (
                  <MenuItem
                    key={option.label}
                    icon={option.icon}
                    iconPosition="left"
                    onClick={() => {
                      option.onClick();
                      onClose();
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuGroup>
            )}
          />
        )}
      </div>
    </Stack>
  );
}
