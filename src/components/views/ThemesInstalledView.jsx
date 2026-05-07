import { useNavigate } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { installedThemes } from '../../data/mockData';

function ThemesInstalledView() {
  const navigate = useNavigate();
  const active = installedThemes.find((t) => t.isActive);
  const others = installedThemes.filter((t) => !t.isActive);

  return (
    <div className="preview-body">
      <div className="preview-body-canvas themes-view">
        {active && (
          <div className="theme-wrap wp-clearfix themes-active-wrap">
            <div
              className="themes-active-screenshot"
              style={{ backgroundImage: active.screenshot }}
              role="img"
              aria-label={`${active.name} screenshot`}
            />
            <div className="themes-active-details">
              <h2 className="themes-active-name">
                {active.name}
                <span className="themes-active-version"> Version: {active.version}</span>
              </h2>
              <p className="themes-active-author">
                By <a href={active.authorUrl}>{active.author}</a>
              </p>
              <p className="themes-active-description">{active.description}</p>
              {/* Per spec: NO Customize button. */}
              <div className="themes-active-actions">
                <Button variant="secondary">Live Preview</Button>
                <Button variant="tertiary">Theme Details</Button>
                <Button variant="tertiary" isDestructive>Delete</Button>
              </div>
            </div>
          </div>
        )}

        <div className="themes-add-row">
          <Button
            variant="secondary"
            icon={plus}
            onClick={() => navigate('/design/themes/browse')}
          >
            Add New Theme
          </Button>
        </div>

        <div className="themes-grid">
          {others.map((t) => (
            <div key={t.id} className="pp-card theme-card">
              <div
                className="theme-card-thumb"
                style={{ backgroundImage: t.screenshot }}
                role="img"
                aria-label={`${t.name} screenshot`}
              />
              <div className="pp-card-body">
                <div className="pp-card-name">{t.name}</div>
                <div className="theme-card-actions">
                  <Button variant="primary">Activate</Button>
                  <Button variant="secondary">Live Preview</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThemesInstalledView;
