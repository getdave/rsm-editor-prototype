import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';

function CommandPalette() {
  const {
    commandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
  } = useAppState();

  // Cmd/Ctrl+K toggles the palette globally.
  useEffect(() => {
    const onKey = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (commandPaletteOpen) closeCommandPalette();
        else openCommandPalette();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandPaletteOpen, openCommandPalette, closeCommandPalette]);

  if (!commandPaletteOpen) return null;
  return <CommandPaletteContent />;
}

function CommandPaletteContent() {
  const navigate = useNavigate();
  const {
    closeCommandPalette,
    openSiteIdentityModal,
    openSettingsModal,
  } = useAppState();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const commands = useMemo(() => [
    { id: 'home', label: 'Go to Home', group: 'Navigate', perform: () => navigate('/') },
    { id: 'pages', label: 'Go to Pages', group: 'Navigate', perform: () => navigate('/pages') },
    { id: 'posts', label: 'Go to Posts', group: 'Navigate', perform: () => navigate('/posts') },
    { id: 'navigation', label: 'Go to Navigation', group: 'Navigate', perform: () => navigate('/navigation') },
    { id: 'design', label: 'Go to Design', group: 'Navigate', perform: () => navigate('/design') },
    { id: 'identity', label: 'Edit site identity', group: 'Action', perform: openSiteIdentityModal },
    { id: 'settings', label: 'Open settings', group: 'Action', perform: openSettingsModal },
  ], [navigate, openSiteIdentityModal, openSettingsModal]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(c => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector('.cp-item.is-active');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (cmd) => {
    closeCommandPalette();
    cmd.perform();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) run(filtered[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeCommandPalette();
  };

  return (
    <div
      className="modal-overlay command-palette-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          className="cp-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search anything…"
          aria-label="Search commands"
        />
        <ul ref={listRef} className="cp-list" role="listbox">
          {filtered.length === 0 ? (
            <li className="cp-empty">No commands found</li>
          ) : (
            filtered.map((cmd, i) => (
              <li
                key={cmd.id}
                className={`cp-item ${i === active ? 'is-active' : ''}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(cmd)}
              >
                <span className="cp-item-label">{cmd.label}</span>
                <span className="cp-item-group">{cmd.group}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default CommandPalette;
