import { Button, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
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

const PX_UNITS = [{ value: 'px', label: 'px', default: 0 }];
const SPACING_UNITS = [
  { value: 'px', label: 'px', default: 0 },
  { value: 'rem', label: 'rem', default: 0 },
];

function ReadOnlyUnitInput({ icon, value, units = PX_UNITS, unit = 'px' }) {
  return (
    <UnitControl
      value={`${value}${unit}`}
      units={units}
      isUnitSelectTabbable={false}
      disabled
      prefix={
        icon ? (
          <span className="styles-input-row-icon" aria-hidden="true">
            {icon}
          </span>
        ) : undefined
      }
      __next40pxDefaultSize
    />
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
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          className="styles-panel-heading-row"
        >
          <Text variant="heading-sm" className="styles-panel-heading">
            Dimensions
          </Text>
          <Button
            icon={moreVertical}
            label="Dimensions options"
            iconSize={20}
            className="styles-panel-heading-action"
          />
        </Stack>
        <Text variant="body-sm" className="styles-panel-description">
          Set the width of the main content area.
        </Text>
      </div>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Content width
        </Text>
        <ReadOnlyUnitInput icon={stretchFullWidth} value={contentWidth} />
      </div>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Wide width
        </Text>
        <ReadOnlyUnitInput icon={stretchWide} value={wideWidth} />
      </div>

      <div className="styles-panel-section">
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          className="styles-panel-section-label"
        >
          <Text variant="body-sm">Padding</Text>
          <Button
            icon={linkIcon}
            label="Link sides"
            iconSize={18}
            className="styles-panel-section-label-action"
          />
        </Stack>
        <ReadOnlyUnitInput value={0} />
      </div>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Block spacing
        </Text>
        <ReadOnlyUnitInput value={1.2} units={SPACING_UNITS} unit="rem" />
      </div>
    </div>
  );
}

export default LayoutPanel;
