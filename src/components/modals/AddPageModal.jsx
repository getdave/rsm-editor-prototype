import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, TextControl, DropdownMenu, MenuItem, CheckboxControl, Tooltip, SelectControl } from '@wordpress/components';
import { Text, CollapsibleCard, Card } from '@wordpress/ui';
import { createInterpolateElement } from '@wordpress/element';
import { chevronDown, plus } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';
import { pageTemplateOptions } from '../../data/mockData';
import { tt5PagePatternItems } from '../../data/tt5Patterns';
import DefinedTerm from '../shared/DefinedTerm';
import TT5PatternPreview from '../shared/TT5PatternPreview';

const SCRATCH_LAYOUT = {
  id: '_scratch',
  name: 'Start from scratch',
  suggestedTitle: '',
  tooltip: 'Create a blank page and add content as you go',
};

const PAGE_PATTERN_LAYOUTS = tt5PagePatternItems.map((pattern) => ({
  id: pattern.id,
  name: pattern.name,
  suggestedTitle: pattern.suggestedTitle,
  tooltip: pattern.description,
  pattern,
}));

const PAGE_LAYOUTS = [...PAGE_PATTERN_LAYOUTS, SCRATCH_LAYOUT];

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
  const [selectedTemplate, setSelectedTemplate] = useState('page-default');
  const generatedPageIdRef = useRef(0);

  const handleSelectPath = (path) => {
    setSelectedPath(path);
    setSelectedLayout(null);
    setPageTitle('');
    setSelectedTemplate('page-default');
  };

  const handleFooterBack = () => {
    if (selectedPath === 'layout' && !selectedLayout) {
      setSelectedPath(null);
      return;
    }
    setSelectedPath(null);
    setSelectedLayout(null);
    setPageTitle('');
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
    <Modal
      title="Add a new page"
      onRequestClose={closeAddPageModal}
      className="apm-modal"
      size="large"
    >
      <div className="apm-modal-body">
        {selectedPath === 'layout' && !selectedLayout && (
          <Text variant="body-sm" className="modal-subtitle apm-modal-subtitle">
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
        {!selectedPath ? (
            <>
              <div className="apm-options">
                <Button
                  variant="secondary"
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
                </Button>

                <Button
                  variant="secondary"
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
                </Button>
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
                    {PAGE_LAYOUTS.map((layout) => (
                      <Tooltip key={layout.id} text={layout.tooltip}>
                        <Button
                          variant="secondary"
                          className={`apm-layout-card ${layout.id === '_scratch' ? 'apm-layout-scratch' : ''}`}
                          onClick={() => handleSelectLayout(layout)}
                        >
                          <div className="apm-layout-preview">
                            {layout.pattern ? (
                              <TT5PatternPreview pattern={layout.pattern} />
                            ) : (
                              <div className="pattern-scratch-icon">{plus}</div>
                            )}
                          </div>
                          <Text variant="body-sm" className="apm-layout-name">{layout.name}</Text>
                        </Button>
                      </Tooltip>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="apm-form">
                    <TextControl
                      label="Page title"
                      value={pageTitle}
                      onChange={setPageTitle}
                      placeholder="Enter page title"
                      required
                      __next40pxDefaultSize
                      className="apm-page-title"
                      autoFocus
                    />

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

                    <CollapsibleCard.Root defaultOpen={false} className="apm-panel">
                      <CollapsibleCard.Header>
                        <Card.Title>Advanced</Card.Title>
                      </CollapsibleCard.Header>
                      <CollapsibleCard.Content>
                        <SelectControl
                          label="Page Template"
                          value={selectedTemplate}
                          options={pageTemplateOptions.map(({ value, label }) => ({ value, label }))}
                          onChange={setSelectedTemplate}
                          help="Choose a template to control the layout and structure of this page"
                          className="apm-page-template-select"
                        />
                      </CollapsibleCard.Content>
                    </CollapsibleCard.Root>
                  </div>
                </>
              )}
            </>
          )}
      </div>

      <div className="modal-footer apm-modal-footer">
            {selectedPath && (
              <Button variant="tertiary" onClick={handleFooterBack}>
                ← Back to options
              </Button>
            )}
            <div className="apm-modal-footer-actions">
              {selectedPath && (selectedPath !== 'layout' || selectedLayout) && (
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
    </Modal>
  );
}

export default AddPageModal;
