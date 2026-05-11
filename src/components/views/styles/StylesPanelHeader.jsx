import { Button } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { seen, moreVertical } from '@wordpress/icons';

/**
 * Shared header for all Styles sub-panels.
 *
 * - `title` (default "Styles") renders inside the title bar alongside the
 *   eye + 3-dot icons. Sub-panels in the second nav group pass their own
 *   title (Colors, Typography, Background, Shadows, Layout) so the
 *   section name lives directly in the title bar without a back arrow.
 * - `subtitle` is optional. When set, it renders below the title bar as a
 *   static breadcrumb-style heading. Currently only the Variations index
 *   uses it (subtitle="Browse styles").
 */
function StylesPanelHeader({ title = 'Styles', subtitle }) {
  return (
    <>
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        className="styles-panel-titlebar"
      >
        <Text variant="heading-md" className="styles-panel-title">{title}</Text>
        <Stack
          direction="row"
          align="center"
          gap="xs"
          className="styles-panel-titlebar-actions"
        >
          <Button icon={seen} label="Style book" iconSize={20} />
          <Button icon={moreVertical} label="More options" iconSize={20} />
        </Stack>
      </Stack>
      {subtitle && (
        <div className="styles-panel-breadcrumb">
          <Text variant="heading-sm" className="styles-panel-breadcrumb-static">
            {subtitle}
          </Text>
        </div>
      )}
    </>
  );
}

export default StylesPanelHeader;
