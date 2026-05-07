import { Button } from '@wordpress/components';
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
      <div className="styles-panel-titlebar">
        <span className="styles-panel-title">{title}</span>
        <div className="styles-panel-titlebar-actions">
          <Button icon={seen} label="Style book" iconSize={20} />
          <Button icon={moreVertical} label="More options" iconSize={20} />
        </div>
      </div>
      {subtitle && (
        <div className="styles-panel-breadcrumb">
          <span className="styles-panel-breadcrumb-static">{subtitle}</span>
        </div>
      )}
    </>
  );
}

export default StylesPanelHeader;
