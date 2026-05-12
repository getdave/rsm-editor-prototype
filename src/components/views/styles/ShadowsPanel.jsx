import { Button } from '@wordpress/components';
import { Card, Stack, Text } from '@wordpress/ui';
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

      <Text variant="body-sm" className="styles-panel-description">
        Manage and create shadow styles for use across the site.
      </Text>

      <div className="styles-panel-section">
        <Text variant="body-sm" className="styles-panel-section-label">
          Default
        </Text>
        <Card.Root className="styles-section-card">
          {shadowPresets.map((item) => (
            <Card.Content
              key={item.slug}
              className="styles-row styles-row-clickable"
            >
              <Text variant="body-md" className="styles-row-name">
                {item.name}
              </Text>
              <span className="styles-row-chevron" aria-hidden="true">›</span>
            </Card.Content>
          ))}
        </Card.Root>
      </div>

      <div className="styles-panel-section">
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          className="styles-panel-section-label"
        >
          <Text variant="body-sm">Custom</Text>
          <Button
            icon={plus}
            label="Create custom shadow"
            iconSize={18}
            className="styles-panel-section-label-action"
          />
        </Stack>
      </div>
    </div>
  );
}

export default ShadowsPanel;
