import { Button } from '@wordpress/components';
import { Card, Stack, Text } from '@wordpress/ui';
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

      <Text variant="body-sm" className="styles-panel-description">
        Set styles for the site's background.
      </Text>

      <div className="styles-panel-section">
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          className="styles-panel-heading-row"
        >
          <Text variant="heading-sm" className="styles-panel-heading">
            Background image
          </Text>
          <Button
            icon={moreVertical}
            label="Background options"
            iconSize={20}
            className="styles-panel-heading-action"
          />
        </Stack>
        <Card.Root className="styles-action-card">
          <Card.Content>
            <button type="button" className="styles-action-button">
              Add background image
            </button>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  );
}

export default BackgroundPanel;
