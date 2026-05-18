import { Button } from '@wordpress/components';

/**
 * One-time (per browser) education before isolating a global Header/Footer for editing.
 *
 * @param {{ partLabel: string, onDismiss: () => void, onContinue: () => void }} props
 */
export default function GlobalTemplatePartEditWarningModal({ partLabel, onDismiss, onContinue }) {
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-template-part-edit-warning-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 id="global-template-part-edit-warning-title" className="modal-title">
          You’re editing {partLabel}
        </h2>
        <p className="modal-message">
          This is a <strong>global</strong> template part. Changes you make here will affect other
          pages and templates on your site that use this {partLabel.toLowerCase()}.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onDismiss}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onContinue}>
            Continue editing
          </Button>
        </div>
      </div>
    </div>
  );
}
