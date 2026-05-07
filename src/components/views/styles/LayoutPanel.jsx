import { Button } from '@wordpress/components';
import {
  moreVertical,
  link as linkIcon,
  stretchFullWidth,
  stretchWide,
} from '@wordpress/icons';
import StylesPanelHeader from './StylesPanelHeader';
import { layoutDefaults } from '../../../data/mockData';

/**
 * Mirrors Gutenberg's /styles/layout panel:
 *   - "Dimensions" heading + 3-dot menu + description
 *   - CONTENT WIDTH input (stretchFullWidth icon prefix, "px" suffix)
 *   - WIDE WIDTH input (stretchWide icon prefix, "px" suffix)
 *   - PADDING with link icon affordance (paired/unpaired sides)
 *   - BLOCK SPACING input
 *
 * The inputs are visually styled as Gutenberg unit inputs but read-only —
 * this is a wireframe-level prototype, not a working settings form.
 */

function UnitInput({ icon, value, unit }) {
  return (
    <div className="styles-input-row">
      {icon && (
        <span className="styles-input-row-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="styles-input-row-value">{value}</span>
      <span className="styles-input-row-unit">{unit}</span>
    </div>
  );
}

function LayoutPanel() {
  // Mock-only values; pulled from layoutDefaults but normalized to look like
  // Gutenberg's defaults (650px → 645, 1200 → 1340, etc.).
  const contentWidth = parseInt(layoutDefaults.contentSize, 10) - 5;
  const wideWidth = parseInt(layoutDefaults.wideSize, 10) + 140;

  return (
    <div className="styles-panel">
      <StylesPanelHeader title="Layout" />

      <div className="styles-panel-section">
        <div className="styles-panel-heading-row">
          <h3 className="styles-panel-heading">Dimensions</h3>
          <Button
            icon={moreVertical}
            label="Dimensions options"
            iconSize={20}
            className="styles-panel-heading-action"
          />
        </div>
        <p className="styles-panel-description">
          Set the width of the main content area.
        </p>
      </div>

      <div className="styles-panel-section">
        <div className="styles-panel-section-label">Content width</div>
        <UnitInput icon={stretchFullWidth} value={contentWidth} unit="px" />
      </div>

      <div className="styles-panel-section">
        <div className="styles-panel-section-label">Wide width</div>
        <UnitInput icon={stretchWide} value={wideWidth} unit="px" />
      </div>

      <div className="styles-panel-section">
        <div className="styles-panel-section-label">
          <span>Padding</span>
          <Button
            icon={linkIcon}
            label="Link sides"
            iconSize={18}
            className="styles-panel-section-label-action"
          />
        </div>
        <UnitInput value="0" unit="px" />
      </div>

      <div className="styles-panel-section">
        <div className="styles-panel-section-label">Block spacing</div>
        <UnitInput value="1.2" unit="rem" />
      </div>
    </div>
  );
}

export default LayoutPanel;
