import { memo } from 'react';
import { getPageWireframeVariant } from '../../utils/pageWireframeKind';

function Bar({ className = '', narrow, wide, sm }) {
  return (
    <div
      className={`pp-wf-bar${narrow ? ' pp-wf-bar--narrow' : ''}${wide ? ' pp-wf-bar--wide' : ''}${sm ? ' pp-wf-bar--sm' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden
    />
  );
}

function WireframePage() {
  return (
    <>
      <div className="pp-wf-header" aria-hidden />
      <div className="pp-wf-hero" aria-hidden />
      <div className="pp-wf-stack">
        <Bar wide />
        <Bar />
        <Bar narrow sm />
      </div>
    </>
  );
}

function WireframeError() {
  return (
    <div className="pp-wf-error">
      <div className="pp-wf-error-code" aria-hidden />
      <div className="pp-wf-stack pp-wf-stack--tight">
        <Bar wide />
        <Bar />
      </div>
      <div className="pp-wf-pill" aria-hidden />
    </div>
  );
}

function WireframeCart() {
  return (
    <>
      <div className="pp-wf-header pp-wf-header--short" aria-hidden />
      <div className="pp-wf-rows">
        <div className="pp-wf-row" aria-hidden />
        <div className="pp-wf-row" aria-hidden />
        <div className="pp-wf-row" aria-hidden />
      </div>
      <div className="pp-wf-footer-bar" aria-hidden />
    </>
  );
}

function WireframeCheckout() {
  return (
    <>
      <div className="pp-wf-header pp-wf-header--short" aria-hidden />
      <div className="pp-wf-steps" aria-hidden>
        <span className="pp-wf-step" />
        <span className="pp-wf-step-line" />
        <span className="pp-wf-step" />
        <span className="pp-wf-step-line" />
        <span className="pp-wf-step" />
      </div>
      <div className="pp-wf-stack pp-wf-stack--tight">
        <Bar wide />
        <Bar narrow sm />
      </div>
    </>
  );
}

function WireframeArchiveGrid() {
  return (
    <>
      <div className="pp-wf-title-block" aria-hidden>
        <Bar wide />
        <Bar narrow sm />
      </div>
      <div className="pp-wf-cell-grid" aria-hidden>
        <span className="pp-wf-cell" />
        <span className="pp-wf-cell" />
        <span className="pp-wf-cell" />
        <span className="pp-wf-cell" />
      </div>
    </>
  );
}

function WireframeArchiveList() {
  return (
    <>
      <div className="pp-wf-title-block" aria-hidden>
        <Bar wide />
        <Bar narrow sm />
      </div>
      <div className="pp-wf-list-rows" aria-hidden>
        <div className="pp-wf-list-row" />
        <div className="pp-wf-list-row" />
        <div className="pp-wf-list-row" />
      </div>
    </>
  );
}

function WireframeSingleProduct() {
  return (
    <div className="pp-wf-split" aria-hidden>
      <div className="pp-wf-split-media" />
      <div className="pp-wf-split-copy">
        <Bar wide />
        <Bar narrow sm />
        <Bar />
        <Bar narrow sm />
      </div>
    </div>
  );
}

function WireframeSinglePost() {
  return (
    <div className="pp-wf-post">
      <Bar className="pp-wf-bar--title" wide />
      <Bar narrow sm />
      <div className="pp-wf-stack pp-wf-stack--tight">
        <Bar />
        <Bar wide />
        <Bar narrow sm />
      </div>
    </div>
  );
}

function PageLayoutWireframeThumbInner({ page }) {
  const variant = getPageWireframeVariant(page);

  let inner;
  switch (variant) {
    case 'error':
      inner = <WireframeError />;
      break;
    case 'cart':
      inner = <WireframeCart />;
      break;
    case 'checkout':
      inner = <WireframeCheckout />;
      break;
    case 'archive-grid':
      inner = <WireframeArchiveGrid />;
      break;
    case 'archive-list':
      inner = <WireframeArchiveList />;
      break;
    case 'single-product':
      inner = <WireframeSingleProduct />;
      break;
    case 'single-post':
      inner = <WireframeSinglePost />;
      break;
    case 'page':
    default:
      inner = <WireframePage />;
  }

  return (
    <div className={`pp-wf-root pp-wf-root--${variant}`} aria-hidden>
      {inner}
    </div>
  );
}

export default memo(PageLayoutWireframeThumbInner);
