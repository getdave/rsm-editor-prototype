import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DropdownMenu, MenuItem, CheckboxControl, Tooltip, PanelBody, SelectControl } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { createInterpolateElement } from '@wordpress/element';
import { chevronDown, plus } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { pageTemplateOptions } from '../../data/mockData';
import DefinedTerm from '../shared/DefinedTerm';

function AddPageModal() {
  const { addPageModalOpen } = useAppState();

  if (!addPageModalOpen) return null;
  return <AddPageModalContent />;
}

function AddPageModalContent() {
  const {
    closeAddPageModal,
    addPage,
    addPageToMainMenu,
    showSnackbar,
    pages,
  } = useAppState();
  const navigate = useNavigate();

  const [selectedPath, setSelectedPath] = useState(null); // 'scratch' or 'layout'
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [showLive, setShowLive] = useState(true);
  const [addToMenu, setAddToMenu] = useState(false);
  const [showAllLayouts, setShowAllLayouts] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('page-default');
  const generatedPageIdRef = useRef(0);

  // Curated starter layouts (shown by default)
  const starterLayouts = [
    { id: 'text-based', name: 'Text-based Page', suggestedTitle: 'New Page', pattern: 'standard', tooltip: 'Simple page with heading and text content' },
    { id: 'business-home', name: 'Business homepage', suggestedTitle: 'Home', pattern: 'business', tooltip: 'Professional homepage for businesses' },
    { id: 'portfolio-home', name: 'Portfolio homepage', suggestedTitle: 'Portfolio', pattern: 'gallery', tooltip: 'Showcase your work and projects' },
    { id: 'event-landing', name: 'Landing page for event', suggestedTitle: 'Event', pattern: 'landing', tooltip: 'Promote and provide details for events' },
    { id: 'cv-bio', name: 'CV/bio', suggestedTitle: 'About', pattern: 'cv', tooltip: 'Professional biography or resume' },
    { id: 'coming-soon', name: 'Coming soon', suggestedTitle: 'Coming Soon', pattern: 'centered', tooltip: 'Temporary page for upcoming launches' },
  ];

  // All WordPress patterns (shown when "Load more" is clicked)
  const allLayouts = [
    ...starterLayouts,
    { id: 'event-rsvp', name: 'Event RSVP', suggestedTitle: 'RSVP', pattern: 'form', tooltip: 'Collect RSVPs for your event' },
    { id: 'book-landing', name: 'Landing page for book', suggestedTitle: 'Book', pattern: 'book', tooltip: 'Promote and sell your book' },
    { id: 'podcast-landing', name: 'Landing page for podcast', suggestedTitle: 'Podcast', pattern: 'list', tooltip: 'Share your podcast episodes' },
    { id: 'link-bio-heading', name: 'Link in bio', suggestedTitle: 'Links', pattern: 'links', tooltip: 'Social media link collection page' },
    { id: 'link-bio-profile', name: 'Link in bio (profile)', suggestedTitle: 'Links', pattern: 'links', tooltip: 'Link collection with profile header' },
    { id: 'link-bio-tight', name: 'Link in bio (compact)', suggestedTitle: 'Links', pattern: 'links', tooltip: 'Compact link collection layout' },
    { id: 'shop-home', name: 'Shop homepage', suggestedTitle: 'Shop', pattern: 'grid', tooltip: 'E-commerce store homepage' },
    { id: '_scratch', name: 'Start from scratch', suggestedTitle: '', pattern: 'scratch', tooltip: 'Create a blank page and add content as you go' },
  ];

  const layouts = showAllLayouts ? allLayouts : starterLayouts;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeAddPageModal();
    }
  };

  const handleSelectPath = (path) => {
    setSelectedPath(path);
    setSelectedLayout(null);
    setPageTitle('');
    setShowAllLayouts(false); // Reset to curated view
    setSelectedTemplate('page-default');
  };

  const handleFooterBack = () => {
    if (selectedPath === 'layout' && !selectedLayout) {
      setSelectedPath(null);
      setShowAllLayouts(false);
      return;
    }
    setSelectedPath(null);
    setSelectedLayout(null);
    setPageTitle('');
    setShowAllLayouts(false);
    setSelectedTemplate('page-default');
  };

  const handleSelectLayout = (layout) => {
    // Special handling for "Start from scratch" option
    if (layout.id === '_scratch') {
      setSelectedPath('scratch');
      setSelectedLayout(null);
      setPageTitle('');
      return;
    }
    setSelectedLayout(layout.id);
    setPageTitle(layout.suggestedTitle);
  };

  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const createPageObject = (fallbackId) => {
    const slug = slugify(pageTitle);
    return {
      id: slug || fallbackId,
      slug,
      name: pageTitle,
      type: 'Page',
      status: showLive ? 'live' : 'draft',
      inMenu: addToMenu,
      isSystem: false,
      category: 'content',
      level: 0,
      template: selectedTemplate,
      ...(selectedLayout && { layoutId: selectedLayout }),
    };
  };

  const createNextFallbackPageId = () => {
    generatedPageIdRef.current += 1;
    return `page-${pages.length + generatedPageIdRef.current}`;
  };

  const handleCreateAndEdit = () => {
    if (!pageTitle.trim()) return;
    const newPage = createPageObject(createNextFallbackPageId());
    addPage(newPage);
    if (newPage.inMenu) {
      addPageToMainMenu(newPage);
    }
    showSnackbar(`Page "${newPage.name}" created`);
    closeAddPageModal();
    const editPath = `/pages/${newPage.id}/edit`;
    navigate(
      selectedPath === 'scratch' ? `${editPath}?inserter=blocks` : editPath,
    );
  };

  const handleCreate = () => {
    if (!pageTitle.trim()) return;
    const newPage = createPageObject(createNextFallbackPageId());
    addPage(newPage);
    if (newPage.inMenu) {
      addPageToMainMenu(newPage);
    }
    showSnackbar(`Page "${newPage.name}" created successfully`);
    closeAddPageModal();
  };

  const canCreate = pageTitle.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box apm-modal" onClick={(e) => e.stopPropagation()}>
        <Stack
          direction="row"
          align="flex-start"
          justify="space-between"
          className="modal-hd"
        >
          <Stack direction="column" gap="xs">
            <Text variant="heading-md" className="modal-title">Add a new page</Text>
            {selectedPath === 'layout' && !selectedLayout && (
              <Text variant="body-sm" className="modal-subtitle">
                {createInterpolateElement(
                  'Choose from predefined layouts built using <term>patterns</term> that you can customize.',
                  {
                    term: (
                      <DefinedTerm definition="Reusable design blocks you can combine and customize to build pages." />
                    ),
                  },
                )}
              </Text>
            )}
          </Stack>
          <button className="modal-close" onClick={closeAddPageModal}>
            ✕
          </button>
        </Stack>

        <div className="modal-body">
          {!selectedPath ? (
            <>
              <div className="apm-options">
                <button
                  className="apm-option-card"
                  onClick={() => handleSelectPath('layout')}
                >
                  <div className="apm-option-preview apm-preview-layout">
                    <div className="apm-preview-wireframe">
                      <div className="apm-wireframe-header"></div>
                      <div className="apm-wireframe-content">
                        <div className="apm-wireframe-sidebar"></div>
                        <div className="apm-wireframe-main"></div>
                      </div>
                    </div>
                  </div>
                  <Text variant="body-md" className="apm-option-title">Choose a layout</Text>
                  <Text variant="body-sm" className="apm-option-desc">
                    Start with a pre-designed page layout
                  </Text>
                </button>

                <button
                  className="apm-option-card"
                  onClick={() => handleSelectPath('scratch')}
                >
                  <div className="apm-option-preview apm-preview-scratch">
                    <div className="apm-preview-icon">{plus}</div>
                  </div>
                  <Text variant="body-md" className="apm-option-title">Start from scratch</Text>
                  <Text variant="body-sm" className="apm-option-desc">
                    Create a blank page and add sections as you go
                  </Text>
                </button>
              </div>

              <Text variant="body-sm" className="apm-tutorial-hint">
                Unsure where to start? <a
                  href="https://learn.wordpress.org/lesson/setting-up-your-pages-posts-site-logo-and-navigation-menu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apm-tutorial-link"
                >
                  Begin with a tutorial
                </a>
              </Text>
            </>
          ) : (
            <>
              {selectedPath === 'layout' && !selectedLayout ? (
                <>
                  <div className="apm-layouts-grid">
                    {layouts.map((layout) => (
                      <Tooltip key={layout.id} text={layout.tooltip}>
                        <button
                          className={`apm-layout-card ${layout.pattern === 'scratch' ? 'apm-layout-scratch' : ''}`}
                          onClick={() => handleSelectLayout(layout)}
                        >
                          <div className="apm-layout-preview">
                          <div className={`apm-layout-pattern apm-pattern-${layout.pattern}`}>
                            {layout.pattern === 'standard' && (
                              <>
                                <div className="pattern-heading"></div>
                                <div className="pattern-text-line"></div>
                                <div className="pattern-text-line"></div>
                                <div className="pattern-text-line short"></div>
                              </>
                            )}
                            {layout.pattern === 'business' && (
                              <>
                                <div className="pattern-hero"></div>
                                <div className="pattern-features">
                                  <div className="pattern-feature-box"></div>
                                  <div className="pattern-feature-box"></div>
                                  <div className="pattern-feature-box"></div>
                                </div>
                              </>
                            )}
                            {layout.pattern === 'landing' && (
                              <>
                                <div className="pattern-hero-small"></div>
                                <div className="pattern-content-block"></div>
                                <div className="pattern-cta"></div>
                              </>
                            )}
                            {layout.pattern === 'cv' && (
                              <>
                                <div className="pattern-profile"></div>
                                <div className="pattern-section"></div>
                                <div className="pattern-section"></div>
                              </>
                            )}
                            {layout.pattern === 'centered' && (
                              <>
                                <div className="pattern-centered-content">
                                  <div className="pattern-logo"></div>
                                  <div className="pattern-text-short"></div>
                                </div>
                              </>
                            )}
                            {layout.pattern === 'book' && (
                              <>
                                <div className="pattern-book-layout">
                                  <div className="pattern-book-cover"></div>
                                  <div className="pattern-book-info">
                                    <div className="pattern-book-title"></div>
                                    <div className="pattern-book-desc"></div>
                                    <div className="pattern-book-cta"></div>
                                  </div>
                                </div>
                              </>
                            )}
                            {layout.pattern === 'links' && (
                              <>
                                <div className="pattern-link-btn"></div>
                                <div className="pattern-link-btn"></div>
                                <div className="pattern-link-btn"></div>
                                <div className="pattern-link-btn"></div>
                              </>
                            )}
                            {layout.pattern === 'scratch' && (
                              <div className="pattern-scratch-icon">{plus}</div>
                            )}
                            {layout.pattern === 'hero-text' && (
                              <>
                                <div className="pattern-block tall"></div>
                                <div className="pattern-block short"></div>
                                <div className="pattern-block short"></div>
                              </>
                            )}
                            {layout.pattern === 'grid' && (
                              <>
                                <div className="pattern-block"></div>
                                <div className="pattern-block"></div>
                                <div className="pattern-block"></div>
                                <div className="pattern-block"></div>
                              </>
                            )}
                            {layout.pattern === 'form' && (
                              <>
                                <div className="pattern-block"></div>
                                <div className="pattern-form-field"></div>
                                <div className="pattern-form-field"></div>
                                <div className="pattern-block short"></div>
                              </>
                            )}
                            {layout.pattern === 'gallery' && (
                              <>
                                <div className="pattern-block wide"></div>
                                <div className="pattern-gallery">
                                  <div className="pattern-gallery-item"></div>
                                  <div className="pattern-gallery-item"></div>
                                  <div className="pattern-gallery-item"></div>
                                </div>
                              </>
                            )}
                            {layout.pattern === 'columns' && (
                              <>
                                <div className="pattern-column"></div>
                                <div className="pattern-column"></div>
                                <div className="pattern-column"></div>
                              </>
                            )}
                            {layout.pattern === 'list' && (
                              <>
                                <div className="pattern-list-item"></div>
                                <div className="pattern-list-item"></div>
                                <div className="pattern-list-item"></div>
                              </>
                            )}
                          </div>
                          </div>
                          <Text variant="body-sm" className="apm-layout-name">{layout.name}</Text>
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                  
                  {!showAllLayouts && (
                    <div className="apm-load-more">
                      <Button 
                        variant="tertiary" 
                        className="apm-load-more-btn"
                        onClick={() => setShowAllLayouts(true)}
                      >
                        Load more layouts
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="apm-form">
                    <div className="m-field">
                      <label className="m-lbl" htmlFor="page-title">
                        Page title *
                      </label>
                      <input
                        id="page-title"
                        type="text"
                        className="m-input"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        placeholder="Enter page title"
                        autoFocus
                      />
                    </div>

                    <div className="apm-checkbox-group">
                      <div className="apm-checkbox-item">
                        <CheckboxControl
                          label="Publish immediately"
                          checked={showLive}
                          onChange={setShowLive}
                        />
                        <Text variant="body-sm" className="apm-checkbox-help">
                          Your page will be visible to visitors immediately
                        </Text>
                      </div>
                      <div className="apm-checkbox-item">
                        <CheckboxControl
                          label="Add to navigation menu"
                          checked={addToMenu}
                          onChange={setAddToMenu}
                        />
                        <Text variant="body-sm" className="apm-checkbox-help">
                          Include this page in your site's main navigation
                        </Text>
                      </div>
                    </div>

                    <PanelBody title="Advanced" initialOpen={false} className="apm-panel">
                      <SelectControl
                        label="Page Template"
                        value={selectedTemplate}
                        options={pageTemplateOptions}
                        onChange={setSelectedTemplate}
                        help="Choose a template to control the layout and structure of this page"
                        className="apm-page-template-select"
                      />
                    </PanelBody>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {selectedPath && (
          <div className="modal-footer apm-modal-footer">
            <Button variant="tertiary" onClick={handleFooterBack}>
              ← Back to options
            </Button>
            <div className="apm-modal-footer-actions">
              <Button variant="secondary" onClick={closeAddPageModal}>
                Cancel
              </Button>
              {(selectedPath !== 'layout' || selectedLayout) && (
                <div className="split-button">
                  <Button
                    variant="primary"
                    onClick={handleCreateAndEdit}
                    disabled={!canCreate}
                    className="split-button-main"
                  >
                    Create and Edit
                  </Button>

                  <DropdownMenu
                    icon={chevronDown}
                    label="More options"
                    className="split-button-dropdown"
                    popoverProps={{ placement: 'bottom-end' }}
                    toggleProps={{
                      disabled: !canCreate,
                      variant: 'primary',
                      className: 'split-button-toggle',
                    }}
                  >
                    {({ onClose }) => (
                      <>
                        <MenuItem
                          onClick={() => {
                            handleCreate();
                            onClose();
                          }}
                        >
                          Create only
                        </MenuItem>
                      </>
                    )}
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddPageModal;
