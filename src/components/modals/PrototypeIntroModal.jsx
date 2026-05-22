import { useCallback, useEffect, useState } from 'react';
import { Button } from '@wordpress/components';

const STORAGE_KEY = 'rsm-prototype-intro-dismissed';
const RESET_QUERY_PARAM = 'resetIntro';
const ISSUES_URL = 'https://github.com/getdave/rsm-editor-prototype/issues';
// TODO: replace with real walkthrough URL when available
const WALKTHROUGH_URL = '#';

function clearIntroStorage() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Ignore storage failures so the prototype remains usable. */
  }
}

function consumeResetOverride() {
  if (typeof window === 'undefined') return false;

  const url = new URL(window.location.href);
  if (!url.searchParams.has(RESET_QUERY_PARAM)) return false;

  clearIntroStorage();
  url.searchParams.delete(RESET_QUERY_PARAM);
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, '', nextUrl);
  return true;
}

const STEPS = [
  {
    eyebrow: 'Prototype preview',
    title: 'Create, Not Learn',
    paragraphs: [
      'This prototype explores a different way into the WordPress Site Editor: one organized around what people want to make, not the concepts they need to understand first.',
      'It is still grounded in WordPress patterns and components, but reframes the experience around creating pages, shaping a site, and making visible progress sooner.',
    ],
    primaryLabel: 'Next',
    secondaryAction: {
      label: 'Skip Intro',
      skip: true,
    },
  },
  {
    eyebrow: 'Why this prototype exists',
    title: 'A response to real Site Editor friction',
    paragraphs: [
      'Many people in the WordPress community have shared that the Site Editor can feel powerful but difficult to approach, especially for newer users. The goal is to explore a more guided, outcome-first editing model.',
      'Watch the short walkthrough for more context on the thinking behind the prototype.',
    ],
    primaryLabel: 'Next',
    secondaryAction: {
      label: 'Watch the walkthrough ↗',
      url: WALKTHROUGH_URL,
    },
  },
  {
    eyebrow: 'How to review it',
    title: 'Review the model, then tell us what breaks',
    paragraphs: [
      'This is an interactive prototype primarily for desktop, with some corners intentionally incomplete. As you explore, focus on the information architecture, language, navigation, and whether the experience helps people understand what to do next.',
      'You are welcome to share feedback on GitHub.',
    ],
    primaryLabel: 'Explore the prototype',
    secondaryAction: {
      label: 'Share feedback on GitHub ↗',
      url: ISSUES_URL,
    },
  },
];

function hasCompletedIntro() {
  if (typeof window === 'undefined') return true;
  if (consumeResetOverride()) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markIntroComplete() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* Ignore storage failures so the prototype remains usable. */
  }
}

export default function PrototypeIntroModal() {
  const [isOpen, setIsOpen] = useState(() => !hasCompletedIntro());
  const [stepIndex, setStepIndex] = useState(0);

  const isFinalStep = stepIndex === STEPS.length - 1;
  const step = STEPS[stepIndex];

  const completeIntro = useCallback(() => {
    markIntroComplete();
    setIsOpen(false);
  }, []);

  const tryDismiss = useCallback(() => {
    if (isFinalStep) completeIntro();
  }, [completeIntro, isFinalStep]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        tryDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, tryDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay prototype-intro-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) tryDismiss();
      }}
    >
      <div
        className="prototype-intro-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prototype-intro-title"
        aria-describedby="prototype-intro-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="prototype-intro-header">
          <div>
            <p className="prototype-intro-eyebrow">
              {step.eyebrow}
            </p>
            <h2 id="prototype-intro-title" className="prototype-intro-title">
              {step.title}
            </h2>
          </div>
        </div>

        <div id="prototype-intro-message" className="prototype-intro-message">
          {step.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="prototype-intro-media" aria-hidden="true" />

        <div className="prototype-intro-progress" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
          {STEPS.map((item, index) => (
            <span
              key={item.title}
              className={`prototype-intro-dot ${index === stepIndex ? 'is-active' : ''}`}
            />
          ))}
        </div>

        <div className="prototype-intro-actions">
          {stepIndex > 0 && (
            <Button
              variant="tertiary"
              onClick={() => setStepIndex((current) => current - 1)}
            >
              Back
            </Button>
          )}
          <div className="prototype-intro-actions-primary">
            {step.secondaryAction &&
              (step.secondaryAction.skip ? (
                <Button variant="secondary" onClick={completeIntro}>
                  {step.secondaryAction.label}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  href={step.secondaryAction.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {step.secondaryAction.label}
                </Button>
              ))}
            <Button
              variant="primary"
              onClick={() => {
                if (isFinalStep) {
                  completeIntro();
                } else {
                  setStepIndex((current) => current + 1);
                }
              }}
            >
              {step.primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
