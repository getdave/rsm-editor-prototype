import { useState } from 'react';
import { Button } from '@wordpress/components';

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
      <div className="cs-head">
        <span className="cs-title">Learn the basics</span>
        <div className="cs-actions">
          <Button variant="link" className="cs-action" onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Hide' : 'Show'}
          </Button>
          <Button variant="link" className="cs-action" onClick={() => setDismissed(true)}>
            Dismiss
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="cs-banners">
          {SUGGESTIONS.map(s => (
            <div key={s.id} className="cs-banner">{s.title}</div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ContentSuggestions;
