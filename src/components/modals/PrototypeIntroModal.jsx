import { useCallback, useEffect, useState } from 'react';
import { Button } from '@wordpress/components';

const STORAGE_KEY = 'rsm-prototype-intro-dismissed';
const RESET_QUERY_PARAM = 'resetIntro';
const README_URL = 'https://github.com/getdave/rsm-editor-prototype#readme';
const ISSUES_URL = 'https://github.com/getdave/rsm-editor-prototype/issues';
const AUTOMATTIC_URL = 'https://automattic.com/';
const CALYPSO_URL = 'https://github.com/Automattic/wp-calypso';

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
    title: 'Create, Not Learn',
    message:
      'This interactive prototype showcases a vision for how the WordPress Site Editor could be reframed around what people want to do, not how WordPress is structured. It stays grounded in WordPress concepts and is built with standard WordPress components.',
  },
  {
    title: 'Why are we doing this?',
    message: (
      <>
        We recognise that many people feel the Site Editor is too complex for most
        users. This is exploratory work from{' '}
        <a href={AUTOMATTIC_URL} target="_blank" rel="noreferrer">
          Automattic
        </a>
        , and we are curious whether this prototype starts to address any of those
        concerns. It is not scheduled for an upcoming WordPress release. Feedback is
        welcome as the idea develops.
      </>
    ),
    readmeLink: true,
  },
  {
    title: 'Reframing, not rebuilding',
    message: (
      <>
        This is not a new{' '}
        <a href={CALYPSO_URL} target="_blank" rel="noreferrer">
          Calypso
        </a>
        , a real block editor, or a pull request for WordPress Core. The idea is not to
        rebuild the Site Editor from scratch, but to reorganise the existing architecture
        so it is easier for beginner users to approach.
      </>
    ),
  },
  {
    title: 'How to review it',
    message: (
      <>
        Focus on the information architecture, language, navigation, and overall editing
        model. As a prototype, it is best viewed on a desktop computer rather than a
        mobile phone, and some editing interactions are intentionally incomplete.
        Feedback is best left on{' '}
        <a href={ISSUES_URL} target="_blank" rel="noreferrer">
          GitHub Issues
        </a>
        .
      </>
    ),
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
            <p className="prototype-intro-kicker">
              Prototype context
            </p>
            <h2 id="prototype-intro-title" className="prototype-intro-title">
              {step.title}
            </h2>
          </div>
        </div>

        <div id="prototype-intro-message" className="prototype-intro-message">
          <p>{step.message}</p>
          {step.readmeLink && (
            <p>
              For more information, background, and context, see the{' '}
              <a href={README_URL} target="_blank" rel="noreferrer">
                project README on GitHub
              </a>.
            </p>
          )}
        </div>

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
              variant="secondary"
              onClick={() => setStepIndex((current) => current - 1)}
            >
              Back
            </Button>
          )}
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
            {isFinalStep ? 'View prototype' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
