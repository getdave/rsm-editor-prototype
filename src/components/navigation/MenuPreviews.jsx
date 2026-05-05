import { header, footer, layout } from '@wordpress/icons';
import { templateParts } from '../../data/mockData';

function MenuPreviews({ menu }) {
  const usedInParts = templateParts.filter((part) =>
    menu.usedIn.includes(part.id)
  );

  const getIconForArea = (area) => {
    switch (area) {
      case 'header':
        return header;
      case 'footer':
        return footer;
      default:
        return layout;
    }
  };

  return (
    <div className="nav-panel nav-menu-previews">
      <div className="nav-panel-header">
        <h3 className="nav-panel-subtitle">Used in Template Parts</h3>
      </div>

      {usedInParts.length === 0 ? (
        <div className="nav-empty-state">
          <p>This menu isn't used anywhere on your site yet.</p>
        </div>
      ) : (
        <div className="nav-preview-items">
          {usedInParts.map((part) => (
            <button key={part.id} className="nav-preview-item">
              <div className="nav-preview-thumbnail">
                <span className="nav-preview-icon">
                  {getIconForArea(part.area)}
                </span>
                <span className="nav-preview-name">{part.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuPreviews;
