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
    menuExpanded,
    setMenuExpanded,
  } = useAppState();
  const referrer = metaForReferrer(editorReferrer);

  const goToDashboard = () => {
    // Silly placeholder — wp-admin doesn't exist in this prototype.
    // eslint-disable-next-line no-alert
    alert("🎉 Pretend you're back in wp-admin! (This is a prototype.)");
  };

  // Navigate straight to the target. The chrome auto-resets via
  // RootLayout's useEffect on route change — no pre-collapse needed.
  // Pre-collapsing caused a visible 208 → 48 → 208 sidebar bounce
  // because the in-editor branch added .collapsed before the admin
  // branch took over.
  const navigateSmooth = (target) => {
    navigate(target);
  };

  return (
    <div className="split-button">
      <Button
        variant="secondary"
        className="split-button-main"
        onClick={() => navigateSmooth(referrer.target)}
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
            <MenuGroup label="Go back to">
              <MenuItem
                icon={wordpress}
                iconPosition="left"
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
                <div className="split-button-recent-list">
                  {recentPages.slice(0, 6).map((p) => (
                    <MenuItem
                      key={p.id}
                      icon={pageIcon}
                      iconPosition="left"
                      onClick={() => {
                        selectPage(p);
                        navigateSmooth(`/pages/${p.id}/edit`);
                        onClose();
                      }}
                    >
                      {p.name}
                    </MenuItem>
                  ))}
                </div>
              )}
            </MenuGroup>
          </>
        )}
      </DropdownMenu>
    </div>
  );
}

export default ExitSplitButton;
