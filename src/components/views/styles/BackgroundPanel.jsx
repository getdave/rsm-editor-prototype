import { Button } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import StylesPanelHeader from './StylesPanelHeader';

/**
 * Mirrors Gutenberg's /styles/background panel:
 *   - Description paragraph
 *   - "Background image" sentence-case heading + 3-dot menu
 *   - Bordered button card: "Add background image"
 */
function BackgroundPanel() {
  return (
    <div className="styles-panel">
      <StylesPanelHeader title="Background" />

      <p className="styles-panel-description">
        Set styles for the site's background.
      </p>

      <div className="styles-panel-section">
        <div className="styles-panel-heading-row">
          <h3 className="styles-panel-heading">Background image</h3>
          <Button
            icon={moreVertical}
            label="Background options"
            iconSize={20}
            className="styles-panel-heading-action"
          />
        </div>
        <div className="styles-action-card">
          <button type="button" className="styles-action-button">
            Add background image
          </button>
        </div>
      </div>
    </div>
  );
}

export default BackgroundPanel;
