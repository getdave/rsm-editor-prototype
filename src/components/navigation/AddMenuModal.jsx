import { useState } from 'react';
import { Modal, Button, TextControl } from '@wordpress/components';

function AddMenuModal({ onClose, onAddMenu }) {
  const [menuName, setMenuName] = useState('');

  const handleSubmit = () => {
    if (menuName.trim()) {
      onAddMenu(menuName.trim());
      setMenuName('');
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal
      title="Create new menu"
      onRequestClose={onClose}
      className="nav-add-menu-modal"
    >
      <div className="nav-modal-content">
        <TextControl
          label="Menu name"
          value={menuName}
          onChange={setMenuName}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Footer menu"
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
          Create menu
        </Button>
      </div>
    </Modal>
  );
}

export default AddMenuModal;
