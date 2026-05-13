import { __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";

/**
 * ConfirmDialog wraps children in a `Text` (renders as `span`), so keep content
 * phrasing-safe: one wrapper `span` with flex column + inline `strong` labels.
 *
 * @param {{ id: string, name: string, isFrontPage?: boolean, isPostsPage?: boolean }} page
 * @param {() => void} onClose
 * @param {() => void} onConfirm
 */
function DeletePageConfirmModal({ page, onClose, onConfirm }) {
  const isHome = Boolean(page.isFrontPage);
  const isPosts = Boolean(page.isPostsPage);

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
        {isHome ? (
          <span className="pp-delete-page-confirm__warn" role="status">
            <strong>This page is your homepage.</strong> Removing it clears that
            assignment. Your site will need a new homepage (Reading settings), or
            the main URL may not show what visitors expect.
          </span>
        ) : null}
        {isPosts ? (
          <span className="pp-delete-page-confirm__warn" role="status">
            <strong>This page is your posts page (blog index).</strong> Removing it
            clears that assignment. Post archives and the blog URL may not work as
            expected until you designate another posts page.
          </span>
        ) : null}
      </span>
    </ConfirmDialog>
  );
}

export default DeletePageConfirmModal;
