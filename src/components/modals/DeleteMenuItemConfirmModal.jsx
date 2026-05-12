import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';

/**
 * @param {{ id: string, label: string, pageId?: string, children?: any[] }} item
 * @param {() => void} onClose
 * @param {() => void} onConfirm
 */
function DeleteMenuItemConfirmModal({ item, onClose, onConfirm }) {
  const hasChildren = item.children && item.children.length > 0;
  
  let message = `Remove "${item.label}" from this menu?`;
  
  if (hasChildren) {
    const count = item.children.length;
    const childText = count === 1 ? '1 submenu item' : `${count} submenu items`;
    message = `Remove "${item.label}" from this menu? This will also remove ${childText}.`;
  }

  return (
    <ConfirmDialog
      className="nav-delete-menu-item-modal"
      isOpen
      onCancel={onClose}
      onConfirm={() => {
        onConfirm();
      }}
      confirmButtonText="Remove"
      cancelButtonText="Cancel"
    >
      {message}
    </ConfirmDialog>
  );
}

export default DeleteMenuItemConfirmModal;
