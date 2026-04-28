import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';

function SiteIdentityModal() {
  const { siteIdentityModalOpen, closeSiteIdentityModal } = useAppState();

  if (!siteIdentityModalOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSiteIdentityModal();
    }
  };

  const handleSave = () => {
    // Logo save logic would go here
    closeSiteIdentityModal();
  };

  const handleCancel = () => {
    closeSiteIdentityModal();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title">Change Site Logo</span>
          <button className="modal-close" onClick={closeSiteIdentityModal}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="m-field">
            <label className="m-lbl">Upload or select a logo for your site</label>
            <div className="m-logo-area">
              <div className="m-logo-preview">
                <div className="m-logo-placeholder">W</div>
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
