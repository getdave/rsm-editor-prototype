import { Page } from '@wordpress/admin-ui';
import { Stack, Text } from '@wordpress/ui';

/**
 * Stub routes that match real admin views: Foundations gutter + admin-ui Page chrome.
 */
export default function PlaceholderAdminView({ title, description }) {
  return (
    <div className="pages-panel show">
      <Page
        className="pages-panel__grid pages-content-frame"
        title={title}
        showSidebarToggle={false}
      >
        <Stack direction="column" gap="sm" className="placeholder-admin-view-body">
          <Text variant="body-md">{description}</Text>
        </Stack>
      </Page>
    </div>
  );
}
