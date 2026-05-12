import { useState } from 'react';
import { Button } from '@wordpress/components';
import { Card, Stack, Text } from '@wordpress/ui';

const SUGGESTIONS = [
  { id: 'first-post', title: 'Create your first post' },
  { id: 'site-identity', title: 'Customize your site identity' },
  { id: 'style-site', title: 'Style every corner of your site' },
];

function ContentSuggestions() {
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <section className={`cs-area ${expanded ? '' : 'collapsed'}`}>
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        className="cs-head"
      >
        <Text variant="body-md" className="cs-title">
          Learn the basics
        </Text>
        <Stack direction="row" align="center" gap="md" className="cs-actions">
          <Button variant="link" className="cs-action" onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Hide' : 'Show'}
          </Button>
          <Button variant="link" className="cs-action" onClick={() => setDismissed(true)}>
            Dismiss
          </Button>
        </Stack>
      </Stack>
      {expanded && (
        <div className="cs-banners">
          {SUGGESTIONS.map(s => (
            <Card.Root key={s.id} className="cs-banner">
              <Card.Content className="cs-banner-content">
                <Text variant="body-md" className="cs-banner-title">
                  {s.title}
                </Text>
              </Card.Content>
            </Card.Root>
          ))}
        </div>
      )}
    </section>
  );
}

export default ContentSuggestions;
