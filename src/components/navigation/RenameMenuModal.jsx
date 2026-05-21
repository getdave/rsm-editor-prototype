import { useState } from 'react';
import { Modal, Button, TextControl } from '@wordpress/components';

function RenameMenuModal({ menu, onClose, onSave }) {
  const [menuName, setMenuName] = useState(menu.name || '');

  const handleSubmit = () => {
    const trimmedName = menuName.trim();
    if (!trimmedName) return;
    onSave(trimmedName);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal
      title="Rename menu"
      onRequestClose={onClose}
      className="nav-rename-menu-modal"
    >
      <div className="nav-modal-content">
        <TextControl
          label="Menu name"
          value={menuName}
          onChange={setMenuName}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>

      <div className="nav-modal-footer">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!menuName.trim()}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}

export default RenameMenuModal;
