import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';

/**
 * @param {{ id: string, name: string, isPrimary: boolean, usedIn: string[] }} menu
 * @param {() => void} onClose
 * @param {() => void} onConfirm
 */
function DeleteMenuConfirmModal({ menu, onClose, onConfirm }) {
  let message = `Delete "${menu.name}"?`;

  if (menu.isPrimary) {
    message = `Delete "${menu.name}"? This is your primary menu. Your site navigation will need to be reconfigured.`;
  } else if (menu.usedIn && menu.usedIn.length > 0) {
    const locations = menu.usedIn.length === 1 ? '1 location' : `${menu.usedIn.length} locations`;
    message = `Delete "${menu.name}"? This menu is used in ${locations}.`;
  }

  return (
    <ConfirmDialog
      className="nav-delete-menu-modal"
      isOpen
      onCancel={onClose}
      onConfirm={() => {
        onConfirm();
      }}
      confirmButtonText="Delete"
      cancelButtonText="Cancel"
    >
      {message}
    </ConfirmDialog>
  );
}

export default DeleteMenuConfirmModal;
