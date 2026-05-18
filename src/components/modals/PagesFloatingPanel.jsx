import { useState, useEffect, useRef } from 'react';
import { Stack, Text } from '@wordpress/ui';
import { useAppState } from '../../hooks/useAppState';
import { pages } from '../../data/mockData';
import PageRow from '../shared/PageRow';

function PagesFloatingPanel() {
  const { sidebarCollapsed, setCurrentPage } = useAppState();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, bottom: 0 });
  const hideTimerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (sidebarCollapsed) {
      return;
    }
    queueMicrotask(() => {
      setIsVisible(false);
      setPosition({ left: 0, bottom: 0 });
    });
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!sidebarCollapsed) {
      return;
    }

    const pagesCollapsed = document.querySelector('.pages-collapsed');
    const pagesStrip = document.querySelector('.pages-strip');

    const showPanel = (triggerEl) => {
      if (!triggerEl) return;
      clearTimeout(hideTimerRef.current);
      const rect = triggerEl.getBoundingClientRect();
      setPosition({
        left: rect.right + 4,
        bottom: window.innerHeight - rect.bottom
      });
      setIsVisible(true);
    };

    const hidePanel = () => {
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 120);
    };

    const handleMouseEnter = (e) => showPanel(e.currentTarget);
    const handleMouseLeave = hidePanel;

    if (pagesCollapsed) {
      pagesCollapsed.addEventListener('mouseenter', handleMouseEnter);
      pagesCollapsed.addEventListener('mouseleave', handleMouseLeave);
    }

    if (pagesStrip) {
      pagesStrip.addEventListener('mouseenter', handleMouseEnter);
      pagesStrip.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (pagesCollapsed) {
        pagesCollapsed.removeEventListener('mouseenter', handleMouseEnter);
        pagesCollapsed.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (pagesStrip) {
        pagesStrip.removeEventListener('mouseenter', handleMouseEnter);
        pagesStrip.removeEventListener('mouseleave', handleMouseLeave);
      }
      clearTimeout(hideTimerRef.current);
    };
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!panelRef.current) return;

    const handleMouseEnter = () => {
      clearTimeout(hideTimerRef.current);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const panel = panelRef.current;
    panel.addEventListener('mouseenter', handleMouseEnter);
    panel.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      panel.removeEventListener('mouseenter', handleMouseEnter);
      panel.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const contentPages = pages.filter(p => !p.isSystem);
  const systemPages = pages.filter(p => p.isSystem);

  const handlePageClick = (page) => {
    setCurrentPage(page);
    setIsVisible(false);
  };

  const panelOpen = sidebarCollapsed && isVisible;

  return (
    <div 
      ref={panelRef}
      className={`pages-fp ${panelOpen ? 'show' : ''}`}
      style={{ left: `${position.left}px`, bottom: `${position.bottom}px`, top: 'auto' }}
    >
      <Stack direction="row" align="center" className="pages-fp-hd">
        <Text variant="body-sm" className="pages-fp-title">Pages</Text>
        <button className="pages-fp-add">+</button>
      </Stack>
      <div className="pages-fp-body">
        {contentPages.map((page) => (
          <PageRow key={page.id} page={page} onClick={handlePageClick} />
        ))}
        <Text variant="body-sm" className="ps-sys-label">System</Text>
        {systemPages.map((page) => (
          <PageRow key={page.id} page={page} onClick={handlePageClick} />
        ))}
      </div>
    </div>
  );
}

export default PagesFloatingPanel;
