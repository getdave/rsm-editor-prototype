import { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, MenuGroup, MenuItem, Tooltip } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';

function DocumentActions() {
  const { currentPage, setCurrentPageName } = useAppState();
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editing]);

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

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Tooltip text="Rename page" placement="bottom">
        <span
          ref={ref}
          className="ct-btn"
          contentEditable={editing}
          suppressContentEditableWarning
          role="textbox"
          tabIndex={0}
          onClick={() => !editing && setEditing(true)}
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
          style={{
            cursor: editing ? 'text' : 'pointer',
            minWidth: 80,
            outline: 'none',
            padding: '0 8px',
          }}
        >
          {currentPage.name}
        </span>
      </Tooltip>

      <Tooltip text={statusLabel} placement="bottom">
        <span
          className={`url-dot${isLive ? '' : ' url-draft-dot'}`}
          role="status"
          aria-label={statusLabel}
        />
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
    </div>
  );
}

export default DocumentActions;
