import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  RadioControl,
  SelectControl,
  Tooltip,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { help } from '@wordpress/icons';
import { Stack, Text } from '@wordpress/ui';
import {
  READING_DISPLAY_LATEST,
  READING_DISPLAY_STATIC,
  useAppState,
} from '../../hooks/useAppState';
import DefinedTerm from '../shared/DefinedTerm';

const WP_TEMPLATE_TERM_DEFINITION =
  'A design WordPress applies automatically to a type of content - e.g. all blog posts, all search results. You edit the template once; WordPress uses it everywhere that type appears.';

const POSTS_PAGE_SELECT_HELP_TOOLTIP =
  'Optional. The Page you pick here sets the URL for your Posts listing (e.g. /blog). Its own content is never shown - WordPress displays Posts there using your Posts Template.';

function readingPageOptionLabel(page) {
  const prefix = page.level > 0 ? `${'- '.repeat(page.level)}` : '';
  return `${prefix}${page.name}`;
}

function ConfigureHomepageModal() {
  const { configureHomepageOpen } = useAppState();

  if (!configureHomepageOpen) return null;
  return <ConfigureHomepageModalContent />;
}

function ConfigureHomepageModalContent() {
  const {
    closeConfigureHomepageModal,
    frontPageId,
    homepageDisplayMode,
    pages,
    postsPageId,
    setFrontPageId,
    setHomepageDisplayMode,
    setPostsPageId,
    syncReadingPageMarkers,
  } = useAppState();

  const readingSelectPages = useMemo(
    () => pages.filter((page) => page.category === 'content' && page.status === 'live'),
    [pages],
  );

  const [mode, setMode] = useState(homepageDisplayMode);
  const [homePageId, setHomePageId] = useState(frontPageId);
  const [postsPageIdDraft, setPostsPageIdDraft] = useState(postsPageId);

  const homepageOptions = useMemo(() => {
    const rows = readingSelectPages.map((page) => ({
      label: readingPageOptionLabel(page),
      value: page.id,
    }));
    const out = [{ label: '-- Select --', value: '' }, ...rows];
    if (homePageId && !readingSelectPages.some((page) => page.id === homePageId)) {
      out.push({
        label: `Unavailable (${homePageId})`,
        value: homePageId,
      });
    }
    return out;
  }, [readingSelectPages, homePageId]);

  const homePageResolved =
    homePageId && readingSelectPages.some((page) => page.id === homePageId);
  let homepageWarning = null;
  if (mode === READING_DISPLAY_STATIC) {
    if (homePageId && !homePageResolved) {
      homepageWarning =
        "That page isn't listed here (for example if it isn't Live yet). Pick a Live page - the one visitors should see when they open your site's main web address.";
    } else if (!homePageId) {
      homepageWarning =
        "No homepage chosen. Pick which page should open at your site's main web address. Until then, people visiting that will usually see a blog-style list of your newest posts.";
    }
  }

  const postsPageUnset = mode === READING_DISPLAY_STATIC && !postsPageIdDraft;

  const postsPageWarning = postsPageUnset
    ? "No posts Page set. There's no bookmarkable URL dedicated to listing recent posts; posts still surface through archives, category links, and similar views."
    : null;
  const postsPageOptions = useMemo(() => {
    const rows = readingSelectPages
      .filter((page) => page.id !== homePageId)
      .map((page) => ({ label: readingPageOptionLabel(page), value: page.id }));
    return [{ label: '-- Select --', value: '' }, ...rows];
  }, [readingSelectPages, homePageId]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeConfigureHomepageModal();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeConfigureHomepageModal]);

  const handleDisplayModeChange = (next) => {
    if (next === READING_DISPLAY_LATEST) {
      setMode(READING_DISPLAY_LATEST);
      setHomePageId('');
      setPostsPageIdDraft('');
    } else {
      setMode(READING_DISPLAY_STATIC);
      setHomePageId((prev) => prev || 'home');
      setPostsPageIdDraft((prev) => prev || 'blog');
    }
  };

  const handleHomepageSelect = (id) => {
    setHomePageId(id);
    if (id === postsPageIdDraft) {
      setPostsPageIdDraft('');
    }
  };

  const handleDone = () => {
    if (mode === READING_DISPLAY_LATEST) {
      setHomepageDisplayMode(READING_DISPLAY_LATEST);
      setFrontPageId('');
      setPostsPageId('');
      syncReadingPageMarkers('', '');
    } else {
      const nextFrontPageId = homePageId || '';
      const nextPostsPageId = postsPageIdDraft || '';
      setHomepageDisplayMode(READING_DISPLAY_STATIC);
      setFrontPageId(nextFrontPageId);
      setPostsPageId(nextPostsPageId);
      syncReadingPageMarkers(nextFrontPageId, nextPostsPageId);
    }
    closeConfigureHomepageModal();
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={closeConfigureHomepageModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="configure-homepage-modal-title"
        className="modal-box ch-reading-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          className="modal-hd"
        >
          <Text
            id="configure-homepage-modal-title"
            variant="heading-md"
            className="modal-title"
          >
            Configure site homepage
          </Text>
          <button
            type="button"
            className="modal-close"
            aria-label="Close dialog"
            onClick={closeConfigureHomepageModal}
          >
            x
          </button>
        </Stack>
        <div className="modal-body ch-reading-body">
          <Text variant="body-sm" className="ch-reading-intro">
            Controls what visitors see at your site&apos;s main address
            (https://example.com).
          </Text>

          <RadioControl
            className="ch-reading-radio"
            hideLabelFromVision
            label="Your homepage displays"
            selected={mode}
            options={[
              {
                label: 'Your latest posts',
                value: READING_DISPLAY_LATEST,
                description: createInterpolateElement(
                  'Visitors see a list of your Posts. This works well for a blog-style site. WordPress generates this Page automatically using a <term>Template</term>.',
                  {
                    term: (
                      <DefinedTerm definition={WP_TEMPLATE_TERM_DEFINITION} />
                    ),
                  },
                ),
              },
              {
                label: 'Your chosen content Page',
                value: READING_DISPLAY_STATIC,
                description:
                  'Visitors land on one page you create and manage (often labeled "Home"). You can choose that page below.',
              },
            ]}
            onChange={handleDisplayModeChange}
          />

          {mode === READING_DISPLAY_STATIC && (
            <div className="ch-reading-static">
              <div className="ch-reading-field">
                <SelectControl
                  __next40pxDefaultSize
                  label="Homepage"
                  value={homePageId || ''}
                  options={homepageOptions}
                  onChange={handleHomepageSelect}
                />
                {homepageWarning ? (
                  <Text
                    variant="body-sm"
                    className="ch-reading-field-warning"
                    role="note"
                  >
                    {homepageWarning}
                  </Text>
                ) : null}
              </div>
              <div className="ch-reading-field">
                <SelectControl
                  __next40pxDefaultSize
                  label={
                    <span className="ch-reading-label-with-help">
                      Posts page
                      <Tooltip
                        text={POSTS_PAGE_SELECT_HELP_TOOLTIP}
                        delay={400}
                        placement="top"
                      >
                        <button
                          type="button"
                          className="ch-reading-field-help-trigger"
                          aria-label="Help: Posts page"
                        >
                          <span
                            className="ch-reading-field-help-trigger-icon"
                            aria-hidden
                          >
                            {help}
                          </span>
                        </button>
                      </Tooltip>
                    </span>
                  }
                  value={postsPageIdDraft || ''}
                  options={postsPageOptions}
                  onChange={(value) => setPostsPageIdDraft(value || '')}
                />
                {postsPageWarning ? (
                  <Text
                    variant="body-sm"
                    className="ch-reading-field-warning"
                    role="note"
                  >
                    {postsPageWarning}
                  </Text>
                ) : null}
              </div>
            </div>
          )}
        </div>
        <Stack
          direction="row"
          align="center"
          justify="flex-end"
          gap="sm"
          className="modal-footer ch-reading-footer"
        >
          <Button variant="tertiary" onClick={closeConfigureHomepageModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDone}>
            Done
          </Button>
        </Stack>
      </div>
    </div>
  );
}

export default ConfigureHomepageModal;
