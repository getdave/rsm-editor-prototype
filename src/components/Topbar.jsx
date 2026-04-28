import { useAppState } from '../hooks/useAppState';

function Topbar() {
  const { hasUnsavedChanges, save, openSiteIdentityModal } = useAppState();

  return (
    <div className="topbar">
      <div className="wp-logo" onClick={openSiteIdentityModal}>
        W
        <div className="wp-logo-ov">
          <svg style={{ width: 11, height: 11, fill: '#fff' }} viewBox="0 0 24 24">
            <path d="M20.1 5.1L16.9 2 6.2 12.7l-1.9 7.1 7.1-1.9L20.1 8.3V5.1zm-1.3 2.8l-3.4 3.4-2.6-2.6 3.4-3.4 2.6 2.6z"/>
          </svg>
        </div>
        <span className="wp-logo-tip">Edit logo</span>
      </div>

      <div className="tb-space"></div>
      
      <div className="tb-devices">
        <button className="d-btn on">⊡</button>
        <button className="d-btn">▭</button>
        <button className="d-btn">▯</button>
      </div>
      
      <span style={{ width: '10px' }}></span>
      
      {!hasUnsavedChanges && <span className="tb-saved">✓ Saved</span>}
      <button 
        className={`tb-save ${hasUnsavedChanges ? 'show' : ''}`}
        onClick={save}
      >
        Save
      </button>
    </div>
  );
}

export default Topbar;
