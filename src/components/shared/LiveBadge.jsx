import { Tooltip } from '@wordpress/components';

function LiveBadge() {
  return (
    <Tooltip text="Published on your site" placement="top">
      <span className="pi-live-dot"></span>
    </Tooltip>
  );
}

export default LiveBadge;
