import { Tooltip } from '@wordpress/components';

function LiveBadge() {
  return (
    <Tooltip text="Page is published" placement="top">
      <span className="pi-live-dot"></span>
    </Tooltip>
  );
}

export default LiveBadge;
