import { useState } from 'react';
import { Modal, Button, TextControl } from '@wordpress/components';

/**
 * @param {{ id: string, label: string, pageId?: string }} item
 * @param {string} linkedPageTitle - Page title for context (does not change when label is customized)
 * @param {() => void} onClose
 * @param {(newLabel: string) => void} onSave
 */
function RenameMenuItemModal({ item, linkedPageTitle, onClose, onSave }) {
  const [value, setValue] = useState(item.label);

  const trimmed = value.trim();
  const canSave = trimmed.length > 0;

  const handleSubmit = () => {
    if (!canSave) {
      return;
    }
    onSave(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal
      title="Rename menu item"
      onRequestClose={onClose}
      className="nav-rename-menu-item-modal"
    >
      <div className="nav-modal-content">
        <TextControl
          label="Navigation label"
          value={value}
          onChange={setValue}
          onKeyDown={handleKeyDown}
          help={
            linkedPageTitle
              ? `Linked page: ${linkedPageTitle}. This label appears in the menu and can differ from the page title.`
              : 'This label appears in the menu.'
          }
          autoFocus
        />
      </div>

      <div className="nav-modal-footer">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!canSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
}

export default RenameMenuItemModal;
