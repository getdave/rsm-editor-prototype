import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  DropdownMenu,
  RadioControl,
  SelectControl,
  ToggleControl,
  Tooltip,
  __experimentalConfirmDialog as ConfirmDialog,
} from "@wordpress/components";
import { Stack, Text, VisuallyHidden } from "@wordpress/ui";
import { DataViews, filterSortAndPaginate } from "@wordpress/dataviews";
import { createInterpolateElement } from "@wordpress/element";
import {
  plus,
  copy,
  home,
  page as pageIcon,
  postList,
  archive,
  chevronDown,
  chevronUp,
  moreVertical,
  help,
  trash,
  navigation,
  closeSmall,
} from "@wordpress/icons";
import { Page } from "@wordpress/admin-ui";
import {
  useAppState,
  READING_DISPLAY_LATEST,
  READING_DISPLAY_STATIC,
} from "../../hooks/useAppState";
import PageLayoutWireframeThumb from "../shared/PageLayoutWireframeThumb";
import PreviewCanvas from "../shared/PreviewCanvas";
import DefinedTerm from "../shared/DefinedTerm";
import DeleteHomepagePageModal from "../modals/DeleteHomepagePageModal";
import DeletePostsPageModal from "../modals/DeletePostsPageModal";
import DeletePageConfirmModal from "../modals/DeletePageConfirmModal";

/** Tooltip primer (concept from WP template hierarchy) */
const WP_TEMPLATE_TERM_DEFINITION =
  "A design WordPress applies automatically to a type of content — e.g. all blog posts, all search results. You edit the template once; WordPress uses it everywhere that type appears.";

const POSTS_PAGE_SELECT_HELP_TOOLTIP =
  "Optional. The Page you pick here sets the URL for your Posts listing (e.g. /blog). Its own content is never shown — WordPress displays Posts there using your Posts Template.";

const BADGE_STYLES = {
  WordPress: { background: "rgba(33,117,155,.12)", color: "#21759b" },
  Template: { background: "rgba(245,158,11,.12)", color: "#d97706" },
  Theme: { background: "rgba(139,92,246,.12)", color: "#7c3aed" },
  Plugin: { background: "rgba(34,197,94,.12)", color: "#16a34a" },
  WooCommerce: { background: "rgba(127,84,179,.12)", color: "#7f54b3" },
};

const PAGE_TYPE_TABS = [
  {
    value: "pages",
    label: "Static",
    icon: pageIcon,
    description:
      "Pages you create and edit directly, plus page-like system destinations.",
  },
  {
    value: "collections",
    label: "Collections",
    icon: archive,
    description:
      "Generated pages for groups of content and special site views.",
  },
];

const STATUS_ELEMENTS = [
  { value: "live", label: "Published" },
  { value: "draft", label: "Draft" },
];

const DATAVIEW_FIELDS_DEFAULT = ["status", "inMenu", "authorDisplay"];
const DATAVIEW_FIELDS_LIST = ["status", "pageRole", "inMenu", "authorDisplay"];

const DEFAULT_VIEW = {
  type: "list",
  search: "",
  filters: [],
  page: 1,
  perPage: 50,
  sort: undefined,
  titleField: "name",
  mediaField: "media",
  fields: [...DATAVIEW_FIELDS_DEFAULT],
  layout: { density: "compact" },
};

function createPagesDataViewState(mode) {
  const next = { ...DEFAULT_VIEW, type: mode };
  if (mode === "list") {
    return {
      ...next,
      showMedia: false,
      fields: [...DATAVIEW_FIELDS_LIST],
    };
  }
  if (mode === "table") {
    return {
      ...next,
      showMedia: false,
      fields: [...DATAVIEW_FIELDS_DEFAULT],
    };
  }
  return { ...next, fields: [...DATAVIEW_FIELDS_DEFAULT] };
}

const DEFAULT_LAYOUTS = {
  list: { layout: { density: "compact" } },
  grid: { badgeFields: ["authorDisplay"], layout: { previewSize: 60 } },
  table: {},
};

const COLLECTION_GROUP_ORDER = ["Posts", "Products", "Events", "System"];

const COLLECTION_GROUP_BY = {
  field: "collectionGroup",
  direction: "asc",
  showLabel: false,
};

function applyPageTypeToView(view, pageType) {
  const viewWithoutGrouping = { ...view };
  if (pageType === "collections") {
    return viewWithoutGrouping;
  }
  delete viewWithoutGrouping.groupBy;
  delete viewWithoutGrouping.showLevels;
  return viewWithoutGrouping;
}

function setCollectionGrouping(view, enabled) {
  if (enabled) {
    return {
      ...view,
      groupBy: COLLECTION_GROUP_BY,
      showLevels: false,
      page: 1,
    };
  }
  const next = {
    ...view,
    page: 1,
  };
  delete next.groupBy;
  delete next.showLevels;
  return next;
}

const postsIndexTemplateRow = Object.freeze({
  id: "posts-index-template",
  slug: "posts-index",
  name: "Posts listing",
  type: "Collection Page",
  isLive: true,
  inMenu: false,
  isSystem: false,
  isDynamic: true,
  isCollection: true,
  collectionBadge: "Posts page",
  collectionOverlay: "Posts page",
  pageKind: "collection",
  category: "collection",
  collectionKind: "posts-index-template",
  viewKind: "listing",
  status: "live",
  level: 0,
  authorDisplay: "WordPress",
  templateLabel: "Posts listing",
  titleTooltip: "Uses home.html for the posts index.",
});

const productCatalogTemplateRow = Object.freeze({
  id: "product-catalog-template",
  slug: "product-catalog",
  name: "Product listing",
  type: "Collection Page",
  isLive: true,
  inMenu: false,
  isSystem: false,
  isDynamic: true,
  isCollection: true,
  collectionBadge: "Shop page",
  collectionOverlay: "Shop page",
  pageKind: "collection",
  category: "collection",
  collectionKind: "product-catalog-template",
  viewKind: "listing",
  status: "live",
  level: 0,
  authorDisplay: "WooCommerce",
  templateLabel: "Product listing",
  titleTooltip: "Uses archive-product.html.",
});

const collectionTemplateDisplay = {
  "blog-single": {
    name: "Single post",
    templateLabel: "Single post",
    titleTooltip: "Uses single.html.",
  },
  "product-single": {
    name: "Single product",
    templateLabel: "Single product",
    titleTooltip: "Uses single-product.html.",
  },
  "event-list": {
    name: "Event listing",
    templateLabel: "Event listing",
    titleTooltip: "Uses archive-event.html.",
  },
  "event-single": {
    name: "Single event",
    templateLabel: "Single event",
    titleTooltip: "Uses single-event.html.",
  },
  "search-results": {
    name: "Search results",
    templateLabel: "Search results",
    titleTooltip: "Uses search.html.",
  },
  "404": {
    name: "404 page",
    templateLabel: "404 page",
    titleTooltip: "Uses 404.html.",
  },
};

function createPostsCollectionRow(postsPage) {
  if (!postsPage) {
    return null;
  }
  return {
    ...postsPage,
    type: "Collection Page",
    isLive: true,
    inMenu: Boolean(postsPage.inMenu),
    isSystem: false,
    isDynamic: true,
    isCollection: true,
    collectionBadge: "Posts page",
    collectionOverlay: "Posts page",
    pageKind: "collection",
    category: "collection",
    collectionKind: "posts",
    viewKind: "listing",
    status: "live",
    authorDisplay: "WordPress",
    templateLabel: "Posts listing",
    titleTooltip:
      "Uses the selected Posts page URL while home.html controls the layout visitors see.",
    isPostsPage: true,
  };
}

function getPageIcon(item) {
  if (item.isFrontPage) {
    return home;
  }
  if (item.collectionKind === "posts" || item.isPostsPage) {
    return postList;
  }
  return pageIcon;
}

function asCollectionRow(row, collectionGroup) {
  if (!row) {
    return null;
  }
  const display = collectionTemplateDisplay[row.id] ?? {};
  return {
    ...row,
    ...display,
    level: 0,
    isCollection: true,
    category: "collection",
    collectionGroup,
  };
}

function readingPageOptionLabel(p) {
  const prefix = p.level > 0 ? `${"— ".repeat(p.level)}` : "";
  return `${prefix}${p.name}`;
}

function ConfigureHomepageReadingModal({
  onClose,
  onApply,
  initialHomepageDisplayMode,
  initialFrontPageId,
  initialPostsPageId,
  readingSelectPages,
}) {
  const [mode, setMode] = useState(initialHomepageDisplayMode);
  const [homePageId, setHomePageId] = useState(initialFrontPageId);
  const [postsPageIdDraft, setPostsPageIdDraft] = useState(initialPostsPageId);

  const homepageOptions = useMemo(() => {
    const rows = readingSelectPages.map((p) => ({
      label: readingPageOptionLabel(p),
      value: p.id,
    }));
    const out = [{ label: "— Select —", value: "" }, ...rows];
    if (homePageId && !readingSelectPages.some((p) => p.id === homePageId)) {
      out.push({
        label: `Unavailable (${homePageId})`,
        value: homePageId,
      });
    }
    return out;
  }, [readingSelectPages, homePageId]);

  const homePageResolved =
    homePageId && readingSelectPages.some((p) => p.id === homePageId);
  let homepageWarning = null;
  if (mode === READING_DISPLAY_STATIC) {
    if (homePageId && !homePageResolved) {
      homepageWarning =
        "That page isn't listed here (for example if it isn't Live yet). Pick a Live page—the one visitors should see when they open your site's main web address.";
    } else if (!homePageId) {
      homepageWarning =
        "No homepage chosen. Pick which page should open at your site's main web address. Until then, people visiting that will usually see a blog-style list of your newest posts.";
    }
  }

  const postsPageUnset = mode === READING_DISPLAY_STATIC && !postsPageIdDraft;

  const postsPageWarning = postsPageUnset
    ? "No posts Page set. There’s no bookmarkable URL dedicated to listing recent posts; posts still surface through archives, category links, and similar views."
    : null;
  const postsPageOptions = useMemo(() => {
    const rows = readingSelectPages
      .filter((p) => p.id !== homePageId)
      .map((p) => ({ label: readingPageOptionLabel(p), value: p.id }));
    return [{ label: "— Select —", value: "" }, ...rows];
  }, [readingSelectPages, homePageId]);

  const handleDisplayModeChange = (next) => {
    if (next === READING_DISPLAY_LATEST) {
      setMode(READING_DISPLAY_LATEST);
      setHomePageId("");
      setPostsPageIdDraft("");
    } else {
      setMode(READING_DISPLAY_STATIC);
      setHomePageId((prev) => prev || "home");
      setPostsPageIdDraft((prev) => prev || "blog");
    }
  };

  const handleHomepageSelect = (id) => {
    setHomePageId(id);
    if (id === postsPageIdDraft) {
      setPostsPageIdDraft("");
    }
  };

  const handleDone = () => {
    onApply({
      homepageDisplayMode: mode,
      frontPageId: homePageId,
      postsPageId: postsPageIdDraft,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="configure-homepage-modal-title"
      className="modal-box ch-reading-modal"
      onClick={(e) => e.stopPropagation()}
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
          onClick={onClose}
        >
          ×
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
              label: "Your latest posts",
              value: READING_DISPLAY_LATEST,
              description: createInterpolateElement(
                "Visitors see a list of your Posts. This works well for a blog-style site. WordPress generates this Page automatically using a <term>Template</term>.",
                {
                  term: (
                    <DefinedTerm definition={WP_TEMPLATE_TERM_DEFINITION} />
                  ),
                },
              ),
            },
            {
              label: "Your chosen content Page",
              value: READING_DISPLAY_STATIC,
              description: `Visitors land on one page you create and manage (often labeled "Home"). You can choose that page below.`,
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
                value={homePageId || ""}
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
                value={postsPageIdDraft || ""}
                options={postsPageOptions}
                onChange={(v) => setPostsPageIdDraft(v || "")}
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
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleDone}>
          Done
        </Button>
      </Stack>
    </div>
  );
}

function renderAuthorCell(item) {
  const text = item.authorDisplay ?? "";
  if (!text) {
    return <span className="pp-author-empty">—</span>;
  }
  const style = BADGE_STYLES[text] ?? undefined;
  return (
    <span className="pp-badge pp-author-badge" style={style}>
      {text}
    </span>
  );
}

function PagesView() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentPage,
    selectPage,
    pagesViewMode,
    setPagesViewMode,
    pages,
    openAddPageModal,
    deletePage,
    homepageDisplayMode,
    setHomepageDisplayMode,
    frontPageId,
    setFrontPageId,
    postsPageId,
    setPostsPageId,
    setPageStatus,
    syncReadingPageMarkers,
    showSnackbar,
    addPageToMainMenu,
    removePageFromMainMenu,
  } = useAppState();
  const [previewPage, setPreviewPage] = useState(currentPage);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [view, setView] = useState(() =>
    createPagesDataViewState(pagesViewMode),
  );
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [configureHomepageOpen, setConfigureHomepageOpen] = useState(false);
  const [publishConfirmPage, setPublishConfirmPage] = useState(null);
  const activePageType = location.pathname.startsWith("/pages/collections")
    ? "collections"
    : "pages";
  const activeView = useMemo(
    () => applyPageTypeToView(view, activePageType),
    [activePageType, view],
  );

  const readingSelectPages = useMemo(
    () => pages.filter((p) => p.category === "content" && p.status === "live"),
    [pages],
  );

  const readingConfigureMenuNeedsAttention = useMemo(() => {
    if (homepageDisplayMode !== READING_DISPLAY_STATIC) {
      return false;
    }
    if (!frontPageId) {
      return true;
    }
    if (!readingSelectPages.some((p) => p.id === frontPageId)) {
      return true;
    }
    if (!postsPageId) {
      return true;
    }
    if (!readingSelectPages.some((p) => p.id === postsPageId)) {
      return true;
    }
    return false;
  }, [homepageDisplayMode, frontPageId, postsPageId, readingSelectPages]);

  const isGridLayout = activeView.type === "grid";

  useEffect(() => {
    if (!configureHomepageOpen) {
      return;
    }
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setConfigureHomepageOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [configureHomepageOpen]);

  useEffect(() => {
    const front =
      homepageDisplayMode === READING_DISPLAY_STATIC ? frontPageId : "";
    const posts =
      homepageDisplayMode === READING_DISPLAY_STATIC ? postsPageId : "";
    syncReadingPageMarkers(front, posts);
  }, [
    homepageDisplayMode,
    frontPageId,
    postsPageId,
    syncReadingPageMarkers,
  ]);

  useEffect(() => {
    if (!deleteConfirm?.page?.isFrontPage && !deleteConfirm?.page?.isPostsPage) {
      return;
    }
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setDeleteConfirm(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [deleteConfirm]);

  const fields = useMemo(
    () => [
      {
        id: "media",
        label: "Icon",
        render: ({ item }) => (
          <span
            className={
              isGridLayout
                ? `pp-media-thumb pp-media-thumb--grid${item.isCollection ? " pp-media-thumb--collection" : ""}${item.collectionState === "inactive" ? " pp-media-thumb--inactive" : ""}`
                : `pp-media-thumb${item.isCollection ? " pp-media-thumb--collection" : ""}${item.collectionState === "inactive" ? " pp-media-thumb--inactive" : ""}`
            }
          >
            {isGridLayout ? (
              <PageLayoutWireframeThumb page={item} />
            ) : (
              <span
                className="pp-media-thumb-icon"
                style={{ color: "#999", display: "flex" }}
              >
                {getPageIcon(item)}
              </span>
            )}
            {item.isFrontPage ? (
              <span className="pp-front-page-overlay">Homepage</span>
            ) : item.collectionOverlay ? (
              <span className="pp-collection-marker-overlay">
                {item.collectionOverlay}
              </span>
            ) : item.isPostsPage ? (
              <span className="pp-posts-page-overlay">Posts page</span>
            ) : null}
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
        filterBy: false,
        enableGlobalSearch: false,
      },
      {
        id: "name",
        type: "text",
        label: "Title",
        enableHiding: false,
        enableGlobalSearch: true,
        render: ({ item }) => {
          const docIcon = getPageIcon(item);
          const isLive = item.status !== "draft";
          const statusLabel = isLive ? "Page is live" : "Page is a draft";
          const title = (
            <span className="pp-title-cell-inner">
              <span
                className={`pp-title-glyph-icon${item.isPostsPage ? " pp-title-glyph-icon--posts" : ""}`}
                aria-hidden="true"
                title={
                  item.isFrontPage
                    ? "Homepage"
                    : item.isPostsPage
                      ? "Posts page"
                      : undefined
                }
              >
                {docIcon}
              </span>
              <Text variant="body-md" className="pp-title-cell-name">
                {item.name}
                {item.collectionBadge && item.collectionBadge !== item.name ? (
                  <span className="pp-title-qualifier">
                    {" "}
                    ({item.collectionBadge})
                  </span>
                ) : null}
              </Text>
              <span
                className={`url-dot${isLive ? "" : " url-draft-dot"}`}
                role="status"
                aria-label={statusLabel}
              />
            </span>
          );
          if (!item.titleTooltip) {
            return title;
          }
          return (
            <Tooltip text={item.titleTooltip} delay={400} placement="top">
              <span className="pp-title-cell-tooltip-wrap">{title}</span>
            </Tooltip>
          );
        },
      },
      {
        id: "collectionGroup",
        type: "text",
        label: "Collection",
        enableSorting: true,
        enableHiding: false,
        enableGlobalSearch: false,
        filterBy: false,
        getValue: ({ item }) => item.collectionGroup ?? "",
        sort: (aValue, bValue, direction) => {
          const aIndex = COLLECTION_GROUP_ORDER.indexOf(aValue);
          const bIndex = COLLECTION_GROUP_ORDER.indexOf(bValue);
          const safeAIndex =
            aIndex === -1 ? COLLECTION_GROUP_ORDER.length : aIndex;
          const safeBIndex =
            bIndex === -1 ? COLLECTION_GROUP_ORDER.length : bIndex;
          const comparison =
            safeAIndex === safeBIndex
              ? String(aValue).localeCompare(String(bValue))
              : safeAIndex - safeBIndex;
          return direction === "desc" ? -comparison : comparison;
        },
      },
      {
        id: "status",
        type: "text",
        label: "Status",
        elements: STATUS_ELEMENTS,
        filterBy: {
          operators: ["isAny"],
        },
        enableSorting: true,
        enableHiding: true,
        enableGlobalSearch: false,
        render: ({ item }) =>
          item.collectionState === "inactive" ? (
            <span className="pp-badge pp-inactive">Inactive</span>
          ) : item.isCollection ? (
            <span className="pp-badge pp-live">Active</span>
          ) : item.status === "draft" ? (
            <span className="pp-badge pp-draft">Draft</span>
          ) : (
            <span className="pp-badge pp-live">Published</span>
          ),
      },
      {
        id: "pageRole",
        type: "text",
        label: "Type",
        enableSorting: false,
        enableHiding: true,
        enableGlobalSearch: false,
        getValue: ({ item }) =>
          item.isFrontPage
            ? "front"
            : item.collectionBadge
              ? item.collectionBadge
              : item.isPostsPage
                ? "posts"
                : item.isCollection
                  ? "collection"
                  : "",
        render: ({ item }) =>
          item.isFrontPage ? (
            <span className="pp-badge pp-page-role pp-page-role--front">
              Front page
            </span>
          ) : item.collectionBadge ? (
            <span className="pp-badge pp-page-role pp-collection-marker">
              {item.collectionBadge}
            </span>
          ) : item.isPostsPage ? (
            <span className="pp-badge pp-page-role pp-page-role--posts">
              Posts page
            </span>
          ) : (
            <span className="pp-menu-empty">—</span>
          ),
      },
      {
        id: "inMenu",
        type: "boolean",
        label: "Menu",
        enableSorting: false,
        enableHiding: true,
        enableGlobalSearch: false,
        getValue: ({ item }) => Boolean(item.inMenu),
        render: ({ item }) =>
          item.inMenu ? (
            <span className="pp-badge pp-nav">Main Menu</span>
          ) : (
            <span className="pp-menu-empty">—</span>
          ),
      },
      {
        id: "isSystem",
        type: "boolean",
        label: "System template",
        getValue: ({ item }) => Boolean(item.isSystem),
        filterBy: {
          operators: ["is", "isNot"],
        },
        enableSorting: true,
        enableHiding: true,
        enableGlobalSearch: false,
        render: ({ item }) =>
          item.isSystem ? (
            <span className="pp-badge pp-draft">System</span>
          ) : null,
      },
      {
        id: "authorDisplay",
        type: "text",
        label: "Author",
        enableSorting: true,
        enableHiding: true,
        enableGlobalSearch: false,
        getValue: ({ item }) => item.authorDisplay ?? "",
        render: ({ item }) => renderAuthorCell(item),
      },
    ],
    [isGridLayout],
  );

  const actions = useMemo(
    () => [
      {
        id: "duplicate",
        label: "Duplicate",
        icon: copy,
        isEligible: (item) => item.category === "content",
        callback: (items) => console.log("Duplicate:", items[0].slug),
      },
      {
        id: "publish",
        label: "Publish",
        isEligible: (item) =>
          item.category === "content" && item.status === "draft",
        callback: (items) => {
          setPublishConfirmPage(items[0]);
        },
      },
      {
        id: "add-to-menu",
        label: "Add to menu",
        icon: navigation,
        isEligible: (item) =>
          item.category === "content" &&
          !item.isSystem &&
          item.id !== BLOG_HOMEPAGE_ROOT_TEMPLATE_ID &&
          !item.inMenu,
        callback: (items, { onActionPerformed } = {}) => {
          const page = items[0];
          addPageToMainMenu(page);
          showSnackbar(`“${page.name}” added to the main menu.`);
          onActionPerformed?.(items);
        },
      },
      {
        id: "remove-from-menu",
        label: "Remove from menu",
        icon: closeSmall,
        isEligible: (item) =>
          item.category === "content" &&
          !item.isSystem &&
          item.id !== BLOG_HOMEPAGE_ROOT_TEMPLATE_ID &&
          item.inMenu,
        callback: (items, { onActionPerformed } = {}) => {
          const page = items[0];
          removePageFromMainMenu(page.id);
          showSnackbar(`“${page.name}” removed from the main menu.`);
          onActionPerformed?.(items);
        },
      },
      {
        id: "set-as-homepage",
        label: "Set as Homepage",
        isEligible: (item) =>
          item.category === "content" &&
          item.id !== frontPageId &&
          !item.isPostsPage,
        callback: (items, { onActionPerformed } = {}) => {
          setHomepageDisplayMode(READING_DISPLAY_STATIC);
          setFrontPageId(items[0].id);
          if (items[0].id === postsPageId) {
            setPostsPageId("");
          }
          setPreviewPage(items[0]);
          onActionPerformed?.(items);
        },
      },
      {
        id: "set-as-homepage-current",
        label: "Set as Homepage",
        isEligible: (item) =>
          item.category === "content" && item.id === frontPageId,
        disabled: true,
        callback: () => {},
      },
      {
        id: "set-as-homepage-posts-page",
        label: "Set as Homepage",
        isEligible: (item) =>
          item.category === "content" &&
          item.isPostsPage &&
          item.id !== frontPageId,
        disabled: true,
        callback: () => {},
      },
      {
        id: "set-as-posts-page",
        label: "Set as Posts page",
        isEligible: (item) =>
          item.category === "content" &&
          item.id !== postsPageId &&
          item.id !== frontPageId,
        callback: (items, { onActionPerformed } = {}) => {
          setHomepageDisplayMode(READING_DISPLAY_STATIC);
          setPostsPageId(items[0].id);
          setPreviewPage(items[0]);
          onActionPerformed?.(items);
        },
      },
      {
        id: "set-as-posts-page-current",
        label: "Set as Posts page",
        isEligible: (item) =>
          item.category === "content" && item.id === postsPageId,
        disabled: true,
        callback: () => {},
      },
      {
        id: "set-as-posts-page-is-front-page",
        label: "Set as Posts page",
        isEligible: (item) =>
          item.category === "content" &&
          item.id === frontPageId &&
          item.id !== postsPageId,
        disabled: true,
        callback: () => {},
      },
      {
        id: "delete",
        label: () => (
          <span className="pp-dataviews-action-delete">Delete</span>
        ),
        icon: trash,
        isEligible: (item) =>
          item.category === "content" &&
          !item.isSystem &&
          item.id !== BLOG_HOMEPAGE_ROOT_TEMPLATE_ID,
        callback: (items, { onActionPerformed } = {}) => {
          setDeleteConfirm({
            page: items[0],
            onActionPerformed,
            actionItems: items,
          });
        },
      },
    ],
    [
      setPreviewPage,
      showSnackbar,
      frontPageId,
      postsPageId,
      setHomepageDisplayMode,
      setFrontPageId,
      setPostsPageId,
      addPageToMainMenu,
      removePageFromMainMenu,
    ],
  );

  const pagesWithRoles = useMemo(
    () =>
      pages.map((p) => ({
        ...p,
        isFrontPage:
          homepageDisplayMode === READING_DISPLAY_STATIC &&
          Boolean(frontPageId) &&
          p.category === "content" &&
          p.id === frontPageId,
        isPostsPage:
          homepageDisplayMode === READING_DISPLAY_STATIC &&
          Boolean(postsPageId) &&
          p.category === "content" &&
          p.id === postsPageId,
      })),
    [pages, homepageDisplayMode, frontPageId, postsPageId],
  );

  const collectionRows = useMemo(() => {
    const rows = [];
    const findPage = (id) => pagesWithRoles.find((p) => p.id === id);
    const postsListingTemplate =
      homepageDisplayMode === READING_DISPLAY_LATEST
        ? {
            ...postsIndexTemplateRow,
            name: "Latest posts",
            templateLabel: "Latest posts",
            collectionBadge: "Homepage",
            collectionOverlay: "Homepage",
            isFrontPage: true,
            titleTooltip: "Uses home.html for the posts index.",
          }
        : postsIndexTemplateRow;
    rows.push(
      asCollectionRow(postsListingTemplate, "Posts"),
      asCollectionRow(findPage("blog-single"), "Posts"),
      asCollectionRow(productCatalogTemplateRow, "Products"),
      asCollectionRow(findPage("product-single"), "Products"),
      asCollectionRow(findPage("event-list"), "Events"),
      asCollectionRow(findPage("event-single"), "Events"),
      asCollectionRow(findPage("search-results"), "System"),
      asCollectionRow(findPage("404"), "System"),
    );
    return rows.filter(Boolean);
  }, [pagesWithRoles, homepageDisplayMode]);

  const staticHybridRows = useMemo(() => {
    const rows = [];
    const findPage = (id) => pagesWithRoles.find((p) => p.id === id);

    if (homepageDisplayMode === READING_DISPLAY_STATIC) {
      const postsPage = findPage(postsPageId);
      const postsCollectionRow = createPostsCollectionRow(postsPage);
      if (postsCollectionRow) {
        rows.push(postsCollectionRow);
      }
    }

    rows.push(findPage("shop"));
    return rows.filter(Boolean);
  }, [pagesWithRoles, postsPageId, homepageDisplayMode]);

  const categoryPages = useMemo(() => {
    if (activePageType === "pages") {
      const staticPages = pagesWithRoles.filter((p) => {
        if (p.category !== "content") {
          return false;
        }
        if (p.isPostsPage) {
          return false;
        }
        return showDrafts ? true : p.status === "live";
      });
      return [...staticPages, ...staticHybridRows];
    }

    return collectionRows;
  }, [
    activePageType,
    pagesWithRoles,
    showDrafts,
    staticHybridRows,
    collectionRows,
  ]);

  const executeDeletePage = useCallback(
    (
      page,
      {
        onActionPerformed,
        actionItems,
        replacementFrontPageId,
        replacementPostsPageId,
      } = {},
    ) => {
      const replacementFrontRow =
        replacementFrontPageId &&
        categoryPages.find((p) => p.id === replacementFrontPageId);
      const replacementPostsRow =
        replacementPostsPageId &&
        categoryPages.find((p) => p.id === replacementPostsPageId);
      const nextPreview =
        replacementFrontRow ??
        replacementPostsRow ??
        categoryPages.find((p) => p.id !== page.id) ??
        null;

      if (replacementFrontPageId) {
        setHomepageDisplayMode(READING_DISPLAY_STATIC);
        setFrontPageId(replacementFrontPageId);
        if (replacementFrontPageId === postsPageId) {
          setPostsPageId("");
        }
      }

      if (replacementPostsPageId) {
        setHomepageDisplayMode(READING_DISPLAY_STATIC);
        setPostsPageId(replacementPostsPageId);
        if (replacementPostsPageId === frontPageId) {
          setFrontPageId("");
        }
      }

      deletePage(page.id);

      if (page.isFrontPage && !replacementFrontPageId) {
        setFrontPageId("");
      }
      if (page.isPostsPage && !replacementPostsPageId) {
        setPostsPageId("");
      }

      setPreviewPage((p) => (p?.id === page.id ? nextPreview : p));
      showSnackbar(`“${page.name}” removed from this site.`);
      onActionPerformed?.(actionItems ?? [page]);
    },
    [
      categoryPages,
      deletePage,
      frontPageId,
      postsPageId,
      setHomepageDisplayMode,
      setFrontPageId,
      setPostsPageId,
      setPreviewPage,
      showSnackbar,
    ],
  );

  const displayedPreviewPage =
    categoryPages.find((p) => p.id === previewPage?.id) ??
    categoryPages[0] ??
    previewPage;

  const handleReadingModalApply = (draft) => {
    if (draft.homepageDisplayMode === READING_DISPLAY_LATEST) {
      setHomepageDisplayMode(READING_DISPLAY_LATEST);
      setFrontPageId("");
      setPostsPageId("");
    } else {
      setHomepageDisplayMode(READING_DISPLAY_STATIC);
      setFrontPageId(draft.frontPageId || "");
      setPostsPageId(draft.postsPageId || "");
    }
    setConfigureHomepageOpen(false);
  };

  const handleReadingModalClose = () => {
    setConfigureHomepageOpen(false);
  };

  const { data: processedData, paginationInfo } = useMemo(
    () => filterSortAndPaginate(categoryPages, activeView, fields),
    [categoryPages, activeView, fields],
  );

  const handleChangeView = (newView) => {
    const layoutChanged = newView.type !== activeView.type;
    if (layoutChanged) {
      setPagesViewMode(newView.type);
    }
    let showMedia = newView.showMedia;
    if (newView.type === "list" || newView.type === "table") {
      showMedia = false;
    } else if (layoutChanged) {
      showMedia = true;
    } else if (showMedia === undefined) {
      showMedia = true;
    }
    let fields = newView.fields;
    if (layoutChanged) {
      fields =
        newView.type === "list"
          ? [...DATAVIEW_FIELDS_LIST]
          : [...DATAVIEW_FIELDS_DEFAULT];
    }
    setView(
      applyPageTypeToView({ ...newView, showMedia, fields }, activePageType),
    );
  };

  const hasPreviewPanel = activeView.type === "list";
  const isCollectionGroupingEnabled =
    activePageType === "collections" &&
    activeView.groupBy?.field === COLLECTION_GROUP_BY.field;

  const handleCollectionGroupingChange = (enabled) => {
    setView((prev) => setCollectionGrouping(prev, enabled));
  };

  const handleTabClick = (value) => {
    setView((prev) => ({
      ...prev,
      page: 1,
      search: "",
      filters: [],
    }));
    navigate(value === "collections" ? "/pages/collections" : "/pages/static");
  };

  const activeTab = PAGE_TYPE_TABS.find((t) => t.value === activePageType);

  const dataViewsContent = (
    <DataViews
      data={processedData}
      fields={fields}
      view={activeView}
      onChangeView={handleChangeView}
      defaultLayouts={DEFAULT_LAYOUTS}
      actions={actions}
      paginationInfo={paginationInfo}
      onChangeSelection={(ids) => {
        if (ids.length === 1) {
          const clicked = categoryPages.find((p) => p.id === ids[0]);
          if (clicked) setPreviewPage(clicked);
        }
      }}
      isItemClickable={() => true}
      onClickItem={(item) => {
        if (!hasPreviewPanel) {
          selectPage(item);
          navigate(`/pages/${item.id}/edit?inserter=patterns`);
        } else {
          setPreviewPage(item);
        }
      }}
      getItemId={(item) => item.id}
      getItemLevel={(item) => item.level ?? 0}
    >
      <div
        className={`pp-toolbar-controls${PAGE_TYPE_TABS.length <= 1 ? " pp-toolbar-controls--solo-category" : ""}`}
      >
        {viewOptionsOpen && (
          <div className="pp-toolbar-row-options">
            <DataViews.Search />
            <DataViews.LayoutSwitcher />
            {activePageType === "collections" ? (
              <ToggleControl
                __nextHasNoMarginBottom
                className="pp-group-collections-toggle"
                label="Group by type"
                checked={isCollectionGroupingEnabled}
                onChange={handleCollectionGroupingChange}
              />
            ) : null}
          </div>
        )}
      </div>
      <div className="pp-dv-scroll">
        <DataViews.Layout />
        <DataViews.Pagination />
      </div>
    </DataViews>
  );

  const stageContent = (
    <div className="pp-inner pp-dataviews">
      <div className="pp-tabs-row">
        <div className="pp-tabs-row__tabs">
          {PAGE_TYPE_TABS.length > 1 ? (
            <div className="pp-tabs">
              {PAGE_TYPE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  className={`pp-tab${activePageType === tab.value ? " on" : ""}`}
                  onClick={() => handleTabClick(tab.value)}
                >
                  <span className="pp-tab-icon" aria-hidden="true">
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {activePageType === "pages" &&
        homepageDisplayMode === READING_DISPLAY_LATEST && (
          <div className="pp-static-homepage-notice" role="status">
            Homepage is currently set to latest posts. Edit that generated page
            under{" "}
            <button
              type="button"
              className="pp-desc-link"
              onClick={() => handleTabClick("collections")}
            >
              Collections
            </button>
            .
          </div>
        )}
      <div className="pp-tab-description-row">
        <div className="pp-tab-description-stack">
          {activeTab?.description ? (
            <Text variant="body-md" className="pp-tab-description">
              {activeTab.description}
            </Text>
          ) : null}
        </div>
        <div className="pp-tab-description-actions">
          {activePageType === "pages" ? (
            <ToggleControl
              __nextHasNoMarginBottom
              className="pp-show-drafts-toggle"
              label="Show drafts"
              checked={showDrafts}
              onChange={setShowDrafts}
            />
          ) : null}
          <Button
            variant="tertiary"
            className="pp-view-options-toggle"
            onClick={() => setViewOptionsOpen((o) => !o)}
            aria-expanded={viewOptionsOpen}
          >
            View options
            <span className="pp-view-options-chevron">
              {viewOptionsOpen ? chevronUp : chevronDown}
            </span>
          </Button>
        </div>
      </div>
      {dataViewsContent}
    </div>
  );

  const canvasContent = (
    <PreviewCanvas
      page={displayedPreviewPage}
      onEdit={() => {
        if (!displayedPreviewPage) {
          return;
        }
        selectPage(displayedPreviewPage);
        navigate(`/pages/${displayedPreviewPage.id}/edit?inserter=patterns`);
      }}
      onPageChange={setPreviewPage}
    />
  );

  /** Layout: Foundations → Sidebar (RootLayout) + Content Frame + Preview Frame (list). */
  const pageActions = (
    <>
      {activePageType === "pages" && (
        <Button
          variant="primary"
          icon={plus}
          iconSize={16}
          onClick={openAddPageModal}
        >
          Add page
        </Button>
      )}
      {activePageType === "collections" && (
        <Button variant="secondary" onClick={() => navigate("/templates")}>
          All Templates
        </Button>
      )}
      <span className="pp-hd-more-wrap">
        {readingConfigureMenuNeedsAttention ? (
          <VisuallyHidden>
            Homepage or posts page configuration needs attention. Configure it
            in this menu.
          </VisuallyHidden>
        ) : null}
        <DropdownMenu
          icon={moreVertical}
          label={
            readingConfigureMenuNeedsAttention
              ? "More options. Homepage settings need attention; choose Configure Homepage."
              : "More page options"
          }
          toggleProps={{
            variant: "tertiary",
            className: readingConfigureMenuNeedsAttention
              ? "pp-hd-more-toggle-attention"
              : undefined,
          }}
          controls={[
            {
              title: "Configure Homepage",
              onClick: () => setConfigureHomepageOpen(true),
            },
          ]}
        />
      </span>
    </>
  );

  return (
    <>
      <div className="pages-panel show">
        {hasPreviewPanel ? (
          <div className="split-view list">
            <Page
              className="split-view-stage pages-content-frame"
              title="Pages"
              actions={pageActions}
              showSidebarToggle={false}
            >
              {stageContent}
            </Page>
            <div
              className="split-view-canvas pages-preview-frame"
              role="region"
              aria-label="Preview"
            >
              {canvasContent}
            </div>
          </div>
        ) : (
          <Page
            className="pages-panel__grid pages-content-frame"
            title="Pages"
            actions={pageActions}
            showSidebarToggle={false}
          >
            <div className="split-view-grid">{stageContent}</div>
          </Page>
        )}
      </div>
      {configureHomepageOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={handleReadingModalClose}
        >
          <ConfigureHomepageReadingModal
            onClose={handleReadingModalClose}
            onApply={handleReadingModalApply}
            initialHomepageDisplayMode={homepageDisplayMode}
            initialFrontPageId={frontPageId}
            initialPostsPageId={postsPageId}
            readingSelectPages={readingSelectPages}
          />
        </div>
      )}
      {publishConfirmPage ? (
        <ConfirmDialog
          isOpen
          onCancel={() => setPublishConfirmPage(null)}
          onConfirm={() => {
            setPageStatus(publishConfirmPage.id, "live");
            showSnackbar(`“${publishConfirmPage.name}” is published.`);
            setPreviewPage((prev) =>
              prev?.id === publishConfirmPage.id
                ? { ...prev, status: "live" }
                : prev,
            );
            setPublishConfirmPage(null);
          }}
          confirmButtonText="Publish"
          cancelButtonText="Cancel"
        >
          {`Publish “${publishConfirmPage.name}”? It will go live on your site.`}
        </ConfirmDialog>
      ) : null}
      {deleteConfirm?.page?.isFrontPage ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setDeleteConfirm(null)}
        >
          <DeleteHomepagePageModal
            page={deleteConfirm.page}
            postsPageId={postsPageId}
            readingSelectPages={readingSelectPages}
            onClose={() => setDeleteConfirm(null)}
            onDelete={({ replacementFrontPageId }) => {
              executeDeletePage(deleteConfirm.page, {
                replacementFrontPageId,
                onActionPerformed: deleteConfirm.onActionPerformed,
                actionItems: deleteConfirm.actionItems,
              });
              setDeleteConfirm(null);
            }}
          />
        </div>
      ) : deleteConfirm?.page?.isPostsPage ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setDeleteConfirm(null)}
        >
          <DeletePostsPageModal
            page={deleteConfirm.page}
            frontPageId={frontPageId}
            readingSelectPages={readingSelectPages}
            onClose={() => setDeleteConfirm(null)}
            onDelete={({ replacementPostsPageId }) => {
              executeDeletePage(deleteConfirm.page, {
                replacementPostsPageId,
                onActionPerformed: deleteConfirm.onActionPerformed,
                actionItems: deleteConfirm.actionItems,
              });
              setDeleteConfirm(null);
            }}
          />
        </div>
      ) : deleteConfirm ? (
        <DeletePageConfirmModal
          page={deleteConfirm.page}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => {
            executeDeletePage(deleteConfirm.page, {
              onActionPerformed: deleteConfirm.onActionPerformed,
              actionItems: deleteConfirm.actionItems,
            });
            setDeleteConfirm(null);
          }}
        />
      ) : null}
    </>
  );
}

export default PagesView;
