import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';

function SiteIdentityModal() {
  const { siteIdentityModalOpen } = useAppState();

  // Render an inner component only while open so its local state resets
  // (and reseeds from the current siteTitle) every time the modal reopens —
  // without needing a setState-in-effect to do the reseeding.
  if (!siteIdentityModalOpen) return null;
  return <SiteIdentityModalContent />;
}

function SiteIdentityModalContent() {
  const {
    closeSiteIdentityModal,
    siteTitle,
    setSiteTitle,
  } = useAppState();
  const [draftTitle, setDraftTitle] = useState(siteTitle);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSiteIdentityModal();
    }
  };

  const handleSave = () => {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== siteTitle) {
      setSiteTitle(trimmed);
    }
    // Logo save logic would go here once persistence is wired up.
    closeSiteIdentityModal();
  };

  const handleCancel = () => {
    closeSiteIdentityModal();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title">Edit site identity</span>
          <button className="modal-close" onClick={closeSiteIdentityModal}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="m-field">
            <label className="m-lbl" htmlFor="site-identity-title">Site title</label>
            <input
              id="site-identity-title"
              type="text"
              className="m-input"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              autoFocus
            />
          </div>
          <div className="m-field">
            <label className="m-lbl">Site logo</label>
            <div className="m-logo-area">
              <div className="m-logo-preview">
                <div className="m-logo-placeholder" />
              </div>
              <div className="m-logo-actions">
                <button className="m-logo-btn primary">Upload image</button>
                <button className="m-logo-btn">Choose from library</button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="m-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="m-ok" onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default SiteIdentityModal;
