import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import {
  chevronDown,
  home,
  page as pageIcon,
  postList,
  navigation,
  styles,
  wordpress,
} from '@wordpress/icons';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';

const REFERRER_META = [
  { prefix: '/pages',      label: 'Pages',      icon: pageIcon },
  { prefix: '/posts',      label: 'Posts',      icon: postList },
  { prefix: '/navigation', label: 'Navigation', icon: navigation },
  { prefix: '/design',     label: 'Design',     icon: styles },
];

function metaForReferrer(referrer) {
  if (!referrer) return { label: 'Exit', icon: home, target: '/' };
  for (const meta of REFERRER_META) {
    if (referrer.startsWith(meta.prefix)) {
      return { label: meta.label, icon: meta.icon, target: meta.prefix };
    }
  }
  return { label: 'Home', icon: home, target: '/' };
}

function ExitSplitButton() {
  const navigate = useNavigate();
  const {
    editorReferrer,
    recentPages,
    keepMenuFixed,
    toggleKeepMenuFixed,
    selectPage,
  } = useAppState();
  const referrer = metaForReferrer(editorReferrer);

  const goToDashboard = () => {
    // Silly placeholder — wp-admin doesn't exist in this prototype.
    // eslint-disable-next-line no-alert
    alert("🎉 Pretend you're back in wp-admin! (This is a prototype.)");
  };

  return (
    <div style={{ display: 'flex' }}>
      <Button className="ct-exit" onClick={() => navigate(referrer.target)}>
        {referrer.label}
      </Button>
      <Dropdown
        renderToggle={({ isOpen, onToggle }) => (
          <Button
            className="ct-icon-btn"
            onClick={onToggle}
            aria-expanded={isOpen}
            label="Exit options"
            icon={chevronDown}
            iconSize={20}
          />
        )}
        renderContent={({ onClose }) => (
          <>
            <MenuGroup>
              <MenuItem
                icon={referrer.icon}
                onClick={() => {
                  navigate(referrer.target);
                  onClose();
                }}
              >
                {referrer.label === 'Exit' ? 'Home' : referrer.label}
              </MenuItem>
              <MenuItem
                icon={home}
                onClick={() => {
                  navigate('/');
                  onClose();
                }}
              >
                Home
              </MenuItem>
              <MenuItem
                icon={wordpress}
                onClick={() => {
                  goToDashboard();
                  onClose();
                }}
              >
                Dashboard
              </MenuItem>
            </MenuGroup>
            <MenuGroup label="Recent documents">
              {recentPages.length === 0 ? (
                <MenuItem disabled>No recent documents</MenuItem>
              ) : (
                recentPages.slice(0, 3).map((p) => (
                  <MenuItem
                    key={p.id}
                    icon={pageIcon}
                    onClick={() => {
                      selectPage(p);
                      navigate(`/pages/${p.id}/edit`);
                      onClose();
                    }}
                  >
                    {p.name}
                  </MenuItem>
                ))
              )}
            </MenuGroup>
            <MenuGroup>
              <MenuItem
                onClick={() => {
                  toggleKeepMenuFixed();
                  onClose();
                }}
              >
                {keepMenuFixed ? '✓ Keep menu fixed' : 'Keep menu fixed'}
              </MenuItem>
            </MenuGroup>
          </>
        )}
      />
    </div>
  );
}

export default ExitSplitButton;
