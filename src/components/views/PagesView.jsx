import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  DropdownMenu,
  RadioControl,
  SelectControl,
  ToggleControl,
  Tooltip,
  VisuallyHidden,
} from "@wordpress/components";
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
} from "@wordpress/icons";
import { useAppState } from "../../hooks/useAppState";
import SplitViewLayout from "../../layouts/SplitViewLayout";
import PreviewCanvas from "../shared/PreviewCanvas";
import DefinedTerm from "../shared/DefinedTerm";

const BADGE_STYLES = {
  WordPress: { background: "rgba(33,117,155,.12)", color: "#21759b" },
  Template: { background: "rgba(245,158,11,.12)", color: "#d97706" },
  Theme: { background: "rgba(139,92,246,.12)", color: "#7c3aed" },
  Plugin: { background: "rgba(34,197,94,.12)", color: "#16a34a" },
  WooCommerce: { background: "rgba(127,84,179,.12)", color: "#7f54b3" },
};

const TABS = [
  {
    value: "content",
    label: "Content",
    description:
      "These pages are created by an author or automatically created by a Plugin or WordPress.",
  },
  {
    value: "dynamic",
    label: "Dynamic",
    description: createInterpolateElement(
      "Dynamic pages use <term>Templates</term> that automatically generate pages from your content.",
      {
        term: (
          <DefinedTerm definition="Reusable page layouts in WordPress. Examples: Single Post template (for blog posts), Product Archive template (for product listings), Search Results template." />
        ),
      },
    ),
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
const DATAVIEW_FIELDS_LIST = [
  "status",
  "pageRole",
  "inMenu",
  "authorDisplay",
];

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

const READING_DISPLAY_LATEST = "latest";
const READING_DISPLAY_STATIC = "static";

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
      <div className="modal-hd">
        <span id="configure-homepage-modal-title" className="modal-title">
          Configure site homepage
        </span>
        <button
          type="button"
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="modal-body ch-reading-body">
        <p className="ch-reading-intro">
          Controls what visitors see at your site&apos;s main address.
        </p>

        <RadioControl
          className="ch-reading-radio"
          label="Your homepage displays"
          selected={mode}
          options={[
            {
              label: "Your latest posts",
              value: READING_DISPLAY_LATEST,
              description:
                "Visitors see your posts listed first. This works well for a blog. WordPress generates this automatically using a Template — there's no page to create or edit.",
            },
            {
              label: "Your Chosen Content Page",
              value: READING_DISPLAY_STATIC,
              description: `Visitors land on one page you create (often labeled "Home"). You choose that page below.`,
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
                <p className="ch-reading-field-warning" role="note">
                  {homepageWarning}
                </p>
              ) : null}
            </div>
            <div className="ch-reading-field">
              <SelectControl
                __next40pxDefaultSize
                label="Posts page"
                help="Optional. Uses the Posts page template; page content isn't used on the front of the site."
                value={postsPageIdDraft || ""}
                options={postsPageOptions}
                onChange={(v) => setPostsPageIdDraft(v || "")}
              />
              {postsPageWarning ? (
                <p className="ch-reading-field-warning" role="note">
                  {postsPageWarning}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
      <div className="modal-footer ch-reading-footer">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleDone}>
          Done
        </Button>
      </div>
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
        <div className="pp-card-name">Add new</div>
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
    pagesViewMode,
    setPagesViewMode,
    pages,
    openAddPageModal,
  } = useAppState();
  const [previewPage, setPreviewPage] = useState(currentPage);
  const [frontPageId, setFrontPageId] = useState(
    () => pages.find((p) => p.isFrontPage)?.id ?? "home",
  );
  const [postsPageId, setPostsPageId] = useState(
    () => pages.find((p) => p.isPostsPage)?.id ?? "blog",
  );
  const [activeCategory, setActiveCategory] = useState("content");
  const [view, setView] = useState(() =>
    createPagesDataViewState(pagesViewMode),
  );
  const [showDrafts, setShowDrafts] = useState(false);
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [homepageDisplayMode, setHomepageDisplayMode] = useState(
    READING_DISPLAY_STATIC,
  );
  const [configureHomepageOpen, setConfigureHomepageOpen] = useState(false);

  const visibleTabs = useMemo(
    () => TABS.filter((tab) => tab.value !== "dynamic" || showDynamicPagesTab),
    [showDynamicPagesTab],
  );

  useEffect(() => {
    if (showDynamicPagesTab || activeCategory !== "dynamic") {
      return;
    }
    setActiveCategory("content");
    setView((prev) => ({
      ...prev,
      page: 1,
      filters: [],
    }));
  }, [showDynamicPagesTab, activeCategory]);

  const readingSelectPages = useMemo(
    () => pages.filter((p) => p.category === "content" && p.status === "live"),
    [],
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
            <span
              className="pp-media-thumb-icon"
              style={{ color: "#999", display: "flex" }}
            >
            {item.isFrontPage ? home : item.isPostsPage ? postList : pageIcon}
          </span>
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
          const title = (
            <span className="pp-title-cell-inner">
              {item.isFrontPage ? (
                <span
                  className="pp-title-glyph-icon"
                  aria-hidden="true"
                  title="Homepage"
                >
                  {home}
                </span>
              ) : item.isPostsPage ? (
                <span
                  className="pp-title-glyph-icon pp-title-glyph-icon--posts"
                  aria-hidden="true"
                  title="Posts page"
                >
                  {postList}
                </span>
              ) : null}
              <span className="pp-title-cell-name">{item.name}</span>
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
          setCurrentPage(items[0]);
          navigate(`/pages/${items[0].id}/edit`);
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
    ],
    [
      navigate,
      setCurrentPage,
      setPreviewPage,
      frontPageId,
      postsPageId,
      setHomepageDisplayMode,
    ],
  );

  const categoryPages = useMemo(() => {
    let filtered = pages
      .map((p) => ({
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
      }))
      .filter((p) => p.category === activeCategory);

    if (activeCategory === "content" && !showDrafts) {
      filtered = filtered.filter((p) => p.status !== "draft");
    }

    if (
      activeCategory === "dynamic" &&
      homepageDisplayMode === READING_DISPLAY_LATEST &&
      !filtered.some((p) => p.id === BLOG_HOMEPAGE_ROOT_TEMPLATE_ID)
    ) {
      filtered = [blogHomepageRootTemplateRow, ...filtered];
    }

    return filtered;
  }, [
    activeCategory,
    showDrafts,
    frontPageId,
    postsPageId,
    homepageDisplayMode,
  ]);

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
      filters: value === "dynamic" ? [...SYSTEM_FILTER_HIDE] : [],
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
            setCurrentPage(item);
            navigate(`/pages/${item.id}/edit`);
          } else {
            setPreviewPage(item);
          }
        }}
        getItemId={(item) => item.id}
        getItemLevel={(item) => item.level ?? 0}
      >
        <div className="pp-hd">
          <span className="pp-title">Pages</span>
          <div className="pp-hd-actions">
            {activeCategory === "content" && (
              <Button
                variant="primary"
                icon={plus}
                iconSize={16}
                onClick={openAddPageModal}
              >
                Add page
              </Button>
            )}
            {activeCategory === "dynamic" && (
              <Button
                variant="secondary"
                onClick={() => navigate("/templates")}
              >
                All Templates
              </Button>
            )}
            <span className="pp-hd-more-wrap">
              {readingConfigureMenuNeedsAttention ? (
                <VisuallyHidden>
                  Homepage or posts page configuration needs attention.
                  Configure it in this menu.
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
          </div>
        </div>
        {visibleTabs.length > 1 ? (
          <div className="pp-tabs">
            {visibleTabs.map((tab) => (
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
        <div
          className={`pp-toolbar-controls${visibleTabs.length <= 1 ? " pp-toolbar-controls--solo-category" : ""}`}
        >
          <div className="pp-notice-toolbar-row">
            <div className="pp-notice-toolbar-col pp-notice-toolbar-col--notice">
              {homepageDisplayMode === READING_DISPLAY_LATEST &&
                activeCategory === "content" && (
                  <div className="pp-latest-posts-home-tip" role="status">
                    {showDynamicPagesTab ? (
                      <>
                        Looking for your Homepage? It&apos;s under{" "}
                        <button
                          type="button"
                          className="pp-desc-link"
                          onClick={() => handleTabClick("dynamic")}
                        >
                          Dynamic
                        </button>
                        .
                      </>
                    ) : (
                      <>
                        Looking for your blog homepage? It&apos;s a
                        template-backed page — open{" "}
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
              {activeTab?.description && (
                <p className="pp-tab-desc-content">
                  {activeTab.description}
                  {activeTab.descriptionLink && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="pp-desc-link"
                        onClick={() => navigate("/templates")}
                      >
                        {activeTab.descriptionLink.text} →
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
            <div className="pp-notice-toolbar-col pp-notice-toolbar-col--actions">
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
              {activeCategory === "content" && (
                <ToggleControl
                  label="Show drafts"
                  checked={showDrafts}
                  onChange={setShowDrafts}
                  className="pp-system-toggle"
                />
              )}
            </div>
          </div>
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
      onEdit={() => navigate(`/pages/${previewPage.id}/edit`)}
      onPageChange={setPreviewPage}
    />
  );

  return (
    <div className="pages-panel show">
      <SplitViewLayout
        mode={hasPreviewPanel ? "list" : "grid"}
        stageContent={stageContent}
        canvasContent={canvasContent}
        gridContent={stageContent}
      />
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
    </div>
  );
}

export default PagesView;
