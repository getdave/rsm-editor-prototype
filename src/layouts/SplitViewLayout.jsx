/**
 * Generic Split View Layout Component
 * 
 * A reusable layout for stage + canvas views (WordPress terminology).
 * Used across Pages, Navigation, Content, and other management views.
 * 
 * @param {string} mode - "list" or "grid" 
 * @param {ReactNode} stageContent - Content for the stage area (list/management)
 * @param {ReactNode} canvasContent - Content for the canvas area (preview)
 * @param {ReactNode} gridContent - Content for grid mode (full width)
 */
function SplitViewLayout({ mode = 'list', stageContent, canvasContent, gridContent }) {
  return (
    <div className={`split-view ${mode}`}>
      {mode === 'list' ? (
        <>
          <div className="split-view-stage">
            {stageContent}
          </div>
          <div className="split-view-canvas">
            {canvasContent}
          </div>
        </>
      ) : (
        <div className="split-view-grid">
          {gridContent}
        </div>
      )}
    </div>
  );
}

export default SplitViewLayout;
