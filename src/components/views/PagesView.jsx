import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  DropdownMenu,
  RadioControl,
  SelectControl,
  Tooltip,
  __experimentalConfirmDialog as ConfirmDialog,
} from "@wordpress/components";
import { Stack, Text, VisuallyHidden } from "@wordpress/ui";
import { DataViews, filterSortAndPaginate } from "@wordpress/dataviews";
import { createInterpolateElement } from "@wordpress/element";
import {
  pencil,
  external,
  plus,
  copy,
  home,
  page as pageIcon,
  postList,
  seen,
  chevronDown,
  chevronUp,
  moreVertical,
  help,
  trash,
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

const TABS = [
  {
    value: "published",
    label: "Published",
    description:
      "Pages that are published and visible on your site.",
  },
  {
    value: "drafts",
    label: "Drafts",
    description: "Pages not yet published.",
  },
];

const STATUS_ELEMENTS = [
  { value: "live", label: "Published" },
  { value: "draft", label: "Draft" },
];

const SYSTEM_FILTER_HIDE = Object.freeze([
  { field: "isSystem", operator: "is", value: false },
]);

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

/** Synthetic dynamic row — blog index at `/` when Reading uses “your latest posts” */
const BLOG_HOMEPAGE_ROOT_TEMPLATE_ID = "blog-home-root";

const blogHomepageRootTemplateRow = Object.freeze({
  id: BLOG_HOMEPAGE_ROOT_TEMPLATE_ID,
  slug: "",
  name: "Posts page",
  type: "Dynamic Page",
  isLive: true,
  inMenu: false,
  isSystem: false,
  isDynamic: true,
  category: "dynamic",
  status: "live",
  level: 0,
  authorDisplay: "WordPress",
  titleTooltip:
    "Used at your site's main web address while the homepage shows your latest posts. Visitors see your newest posts listed first.",
  isFrontPage: true,
});

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

function AddNewCard() {
  return (
    <div className="pp-card pp-card-add">
      <div className="pp-card-thumb">
        <span className="pp-card-icon pp-card-icon-add">{plus}</span>
      </div>
      <div className="pp-card-body">
        <Text variant="body-md" className="pp-card-name">
          Add new
        </Text>
      </div>
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
  const [searchParams] = useSearchParams();
  const showDynamicPagesTab = searchParams.get("dynamic") === "true";
  const {
    currentPage,
    setCurrentPage,
    selectPage,
    pagesViewMode,
    setPagesViewMode,
    pages,
    deletePage,
    homepageDisplayMode,
    setHomepageDisplayMode,
    frontPageId,
    setFrontPageId,
    postsPageId,
    setPostsPageId,
    setPageStatus,
    showSnackbar,
  } = useAppState();
  const [previewPage, setPreviewPage] = useState(currentPage);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeCategory, setActiveCategory] = useState("published");
  const [view, setView] = useState(() =>
    createPagesDataViewState(pagesViewMode),
  );
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [configureHomepageOpen, setConfigureHomepageOpen] = useState(false);
  const [publishConfirmPage, setPublishConfirmPage] = useState(null);

  /** When Published includes template-backed rows, match former Dynamic tab default filters. */
  useEffect(() => {
    if (activeCategory !== "published") {
      return;
    }
    setView((prev) => ({
      ...prev,
      filters: showDynamicPagesTab ? [...SYSTEM_FILTER_HIDE] : [],
    }));
  }, [showDynamicPagesTab, activeCategory]);

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

  const isGridLayout = view.type === "grid";

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

  const fields = useMemo(
    () => [
      {
        id: "media",
        label: "Icon",
        render: ({ item }) => (
          <span
            className={
              isGridLayout
                ? "pp-media-thumb pp-media-thumb--grid"
                : "pp-media-thumb"
            }
          >
            {isGridLayout ? (
              <PageLayoutWireframeThumb page={item} />
            ) : (
              <span
                className="pp-media-thumb-icon"
                style={{ color: "#999", display: "flex" }}
              >
                {item.isFrontPage ? home : item.isPostsPage ? postList : pageIcon}
              </span>
            )}
            {item.isFrontPage ? (
              <span className="pp-front-page-overlay">Homepage</span>
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
          const docIcon = item.isFrontPage
            ? home
            : item.isPostsPage
              ? postList
              : pageIcon;
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
          item.status === "draft" ? (
            <span className="pp-badge pp-draft">Draft</span>
          ) : (
            <span className="pp-badge pp-live">Published</span>
          ),
      },
      {
        id: "pageRole",
        type: "text",
        label: "Homepage",
        enableSorting: false,
        enableHiding: true,
        enableGlobalSearch: false,
        getValue: ({ item }) =>
          item.isFrontPage ? "front" : item.isPostsPage ? "posts" : "",
        render: ({ item }) =>
          item.isFrontPage ? (
            <span className="pp-badge pp-page-role pp-page-role--front">
              Front page
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
        id: "preview",
        label: "Preview",
        isPrimary: true,
        icon: seen,
        callback: (items) => setPreviewPage(items[0]),
      },
      {
        id: "edit",
        label: "Edit",
        icon: pencil,
        callback: (items) => {
          selectPage(items[0]);
          navigate(`/pages/${items[0].id}/edit?inserter=patterns`);
        },
      },
      {
        id: "view-live",
        label: "View live",
        icon: external,
        callback: (items) => console.log("View live:", items[0].slug),
      },
      {
        id: "duplicate",
        label: "Duplicate",
        icon: copy,
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
      navigate,
      selectPage,
      setPreviewPage,
      setPageStatus,
      showSnackbar,
      frontPageId,
      postsPageId,
      setHomepageDisplayMode,
      setFrontPageId,
      setPostsPageId,
    ],
  );

  const categoryPages = useMemo(() => {
    let filtered = pages.map((p) => ({
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
    }));

    if (activeCategory === "drafts") {
      filtered = filtered.filter(
        (p) => p.category === "content" && p.status === "draft",
      );
    } else if (activeCategory === "published") {
      filtered = filtered.filter((p) => {
        if (p.category === "content") {
          return p.status === "live";
        }
        if (p.category === "dynamic") {
          return showDynamicPagesTab;
        }
        return false;
      });

      if (
        showDynamicPagesTab &&
        homepageDisplayMode === READING_DISPLAY_LATEST &&
        !filtered.some((p) => p.id === BLOG_HOMEPAGE_ROOT_TEMPLATE_ID)
      ) {
        filtered = [blogHomepageRootTemplateRow, ...filtered];
      }
    } else {
      filtered = [];
    }

    return filtered;
  }, [
    activeCategory,
    pages,
    showDynamicPagesTab,
    frontPageId,
    postsPageId,
    homepageDisplayMode,
  ]);

  const executeDeletePage = useCallback(
    (page, { onActionPerformed, actionItems } = {}) => {
      const nextPreview =
        categoryPages.find((p) => p.id !== page.id) ?? null;
      deletePage(page.id);
      if (page.id === frontPageId) {
        setFrontPageId("");
      }
      if (page.id === postsPageId) {
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
      setFrontPageId,
      setPostsPageId,
      setPreviewPage,
      showSnackbar,
    ],
  );

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
    () => filterSortAndPaginate(categoryPages, view, fields),
    [categoryPages, view, fields],
  );

  const handleChangeView = (newView) => {
    const layoutChanged = newView.type !== view.type;
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
    setView({ ...newView, showMedia, fields });
  };

  const hasPreviewPanel = view.type === "list";

  const handleTabClick = (value) => {
    setActiveCategory(value);
    setView((prev) => ({
      ...prev,
      page: 1,
      search: "",
      filters:
        value === "published" && showDynamicPagesTab
          ? [...SYSTEM_FILTER_HIDE]
          : [],
    }));
  };

  const activeTab = TABS.find((t) => t.value === activeCategory);

  const stageContent = (
    <div className="pp-inner pp-dataviews">
      <DataViews
        data={processedData}
        fields={fields}
        view={view}
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
        <div className="pp-tabs-row">
          <div className="pp-tabs-row__tabs">
            {TABS.length > 1 ? (
              <div className="pp-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    className={`pp-tab${activeCategory === tab.value ? " on" : ""}`}
                    onClick={() => handleTabClick(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="pp-tabs-row__actions">
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
        <div
          className={`pp-toolbar-controls${TABS.length <= 1 ? " pp-toolbar-controls--solo-category" : ""}`}
        >
          {homepageDisplayMode === READING_DISPLAY_LATEST &&
            activeCategory === "published" && (
              <div className="pp-latest-posts-home-tip" role="status">
                {showDynamicPagesTab ? (
                  <>
                    Latest posts on the homepage? Look for{" "}
                    <strong>Posts page</strong> in this list.
                  </>
                ) : (
                  <>
                    Latest posts on the homepage? Edit that layout in{" "}
                    <button
                      type="button"
                      className="pp-desc-link"
                      onClick={() => navigate("/templates")}
                    >
                      Templates
                    </button>
                    .
                  </>
                )}
              </div>
            )}
          {viewOptionsOpen && (
            <div className="pp-toolbar-row-options">
              <DataViews.Search />
              <DataViews.FiltersToggle />
              <DataViews.LayoutSwitcher />
            </div>
          )}
        </div>
        <div className="pp-dv-filters">
          <DataViews.FiltersToggled />
        </div>
        <div className="pp-dv-scroll">
          <DataViews.Layout />
          <DataViews.Pagination />
        </div>
      </DataViews>
    </div>
  );

  const canvasContent = (
    <PreviewCanvas
      page={previewPage}
      onEdit={() =>
        previewPage &&
        navigate(`/pages/${previewPage.id}/edit?inserter=patterns`)
      }
      onPageChange={setPreviewPage}
    />
  );

  /** Layout: Foundations → Sidebar (RootLayout) + Content Frame + Preview Frame (list). */
  const pageActions = (
    <>
      {(activeCategory === "published" || activeCategory === "drafts") && (
        <Button
          variant="primary"
          icon={plus}
          iconSize={16}
          onClick={openAddPageModal}
        >
          Add page
        </Button>
      )}
      {activeCategory === "published" && showDynamicPagesTab && (
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
              ? "More options. Homepage settings need attention; choose Configure homepage."
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
              title: "Configure homepage",
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
              subTitle={activeTab?.description || undefined}
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
            subTitle={activeTab?.description || undefined}
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
      {deleteConfirm ? (
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
