import { useNavigate } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { Card, Stack, Text } from '@wordpress/ui';
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
          <Stack
            direction="row"
            wrap
            gap="md"
            className="theme-wrap wp-clearfix themes-active-wrap"
          >
            <div
              className="themes-active-screenshot"
              style={{ backgroundImage: active.screenshot }}
              role="img"
              aria-label={`${active.name} screenshot`}
            />
            <Stack direction="column" gap="sm" className="themes-active-details">
              <Text variant="heading-md" className="themes-active-name">
                {active.name}
                <Text variant="body-sm" className="themes-active-version"> Version: {active.version}</Text>
              </Text>
              <Text variant="body-md" className="themes-active-author">
                By <a href={active.authorUrl}>{active.author}</a>
              </Text>
              <Text variant="body-md" className="themes-active-description">{active.description}</Text>
              {/* Per spec: NO Customize button. */}
              <Stack direction="row" gap="sm" className="themes-active-actions">
                <Button variant="secondary">Live Preview</Button>
                <Button variant="tertiary">Theme Details</Button>
                <Button variant="tertiary" isDestructive>Delete</Button>
              </Stack>
            </Stack>
          </Stack>
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
            <Card.Root key={t.id} className="pp-card theme-card">
              <div
                className="theme-card-thumb"
                style={{ backgroundImage: t.screenshot }}
                role="img"
                aria-label={`${t.name} screenshot`}
              />
              <Card.Content className="pp-card-body">
                <Stack direction="column" gap="xs">
                  <Text variant="body-md" className="pp-card-name">{t.name}</Text>
                  <Stack direction="row" wrap gap="sm" className="theme-card-actions">
                    <Button variant="primary">Activate</Button>
                    <Button variant="secondary">Live Preview</Button>
                  </Stack>
                </Stack>
              </Card.Content>
            </Card.Root>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThemesInstalledView;
