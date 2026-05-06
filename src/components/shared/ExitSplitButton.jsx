import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
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
  if (!referrer) return { label: 'Home', icon: home, target: '/' };
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
    selectPage,
  } = useAppState();
  const referrer = metaForReferrer(editorReferrer);

  const goToDashboard = () => {
    // Silly placeholder — wp-admin doesn't exist in this prototype.
    // eslint-disable-next-line no-alert
    alert("🎉 Pretend you're back in wp-admin! (This is a prototype.)");
  };

  return (
    <div className="split-button">
      <Button
        variant="secondary"
        className="split-button-main"
        onClick={() => navigate(referrer.target)}
      >
        Exit
      </Button>
      <DropdownMenu
        icon={chevronDown}
        label="Exit options"
        className="split-button-dropdown"
        popoverProps={{ placement: 'bottom-start' }}
        toggleProps={{
          variant: 'secondary',
          className: 'split-button-toggle',
        }}
      >
        {({ onClose }) => (
          <>
            <MenuGroup>
              <MenuItem
                icon={referrer.icon}
                onClick={() => {
                  navigate(referrer.target);
                  onClose();
                }}
              >
                {referrer.label}
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
          </>
        )}
      </DropdownMenu>
    </div>
  );
}

export default ExitSplitButton;
