import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';

function SiteIdentityModal() {
  const { siteIdentityModalOpen, closeSiteIdentityModal, siteTitle, setSiteTitle } = useAppState();
  const [editedSiteName, setEditedSiteName] = useState(siteTitle);

  if (!siteIdentityModalOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setEditedSiteName(siteTitle);
      closeSiteIdentityModal();
    }
  };

  const handleSave = () => {
    setSiteTitle(editedSiteName);
    closeSiteIdentityModal();
  };

  const handleCancel = () => {
    setEditedSiteName(siteTitle);
    closeSiteIdentityModal();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title">Site Identity</span>
          <button className="modal-close" onClick={closeSiteIdentityModal}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="m-field">
            <label className="m-lbl">Site name</label>
            <input 
              className="m-input" 
              value={editedSiteName}
              onChange={(e) => setEditedSiteName(e.target.value)}
            />
          </div>
          <div className="m-field">
            <label className="m-lbl">Site logo</label>
            <div className="m-logo-area">
              <div className="m-logo-preview"></div>
              <button className="m-logo-btn">Change logo</button>
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
