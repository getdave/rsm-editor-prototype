import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import StylesPanelHeader from './StylesPanelHeader';
import { shadowPresets } from '../../../data/mockData';

/**
 * Mirrors Gutenberg's /styles/shadows panel:
 *   - Description paragraph
 *   - DEFAULT: boxed list of shadow preset rows with chevrons
 *   - CUSTOM: section label with a + action on the right (no items by default)
 */
function ShadowsPanel() {
  return (
    <div className="styles-panel">
      <StylesPanelHeader title="Shadows" />

      <p className="styles-panel-description">
        Manage and create shadow styles for use across the site.
      </p>

      <div className="styles-panel-section">
        <div className="styles-panel-section-label">Default</div>
        <div className="styles-section-card">
          {shadowPresets.map((item) => (
            <div key={item.slug} className="styles-row styles-row-clickable">
              <span className="styles-row-name">{item.name}</span>
              <span className="styles-row-chevron" aria-hidden="true">›</span>
            </div>
          ))}
        </div>
      </div>

      <div className="styles-panel-section">
        <div className="styles-panel-section-label">
          <span>Custom</span>
          <Button
            icon={plus}
            label="Create custom shadow"
            iconSize={18}
            className="styles-panel-section-label-action"
          />
        </div>
      </div>
    </div>
  );
}

export default ShadowsPanel;
