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
    <div className="nav-preview-canvas">
      <div className="nav-preview-header">
        <h3 className="nav-preview-title">Used in template parts</h3>
      </div>

      <div className="nav-preview-content">
        {usedInParts.length === 0 ? (
          <div className="nav-empty-state">
            <p>This menu isn&apos;t used anywhere on your site yet.</p>
          </div>
        ) : (
          <div className="nav-preview-items">
            {usedInParts.map((part) => (
              <button key={part.id} type="button" className="nav-preview-item">
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
    </div>
  );
}

export default MenuPreviews;
