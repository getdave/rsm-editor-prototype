import { __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";

/**
 * ConfirmDialog wraps children in a `Text` (renders as `span`), so keep content
 * phrasing-safe: one wrapper `span` with flex column + inline `strong` labels.
 * Homepage and Posts page deletes use dedicated modals instead.
 *
 * @param {{ id: string, name: string }} page
 * @param {() => void} onClose
 * @param {() => void} onConfirm
 */
function DeletePageConfirmModal({ page, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      className="pp-delete-page-confirm"
      isOpen
      onCancel={onClose}
      onConfirm={onConfirm}
      confirmButtonText="Delete"
      cancelButtonText="Cancel"
    >
      <span className="pp-delete-page-confirm__body">
        <span className="pp-delete-page-confirm__question">
          Are you sure you want to remove the {page.name} page?
        </span>
      </span>
    </ConfirmDialog>
  );
}

export default DeletePageConfirmModal;
