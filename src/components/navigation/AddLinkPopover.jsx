import { useMemo, useState } from 'react';
import {
  Button,
  TextControl,
  Notice,
  __experimentalVStack as VStack,
  __experimentalHStack as HStack,
} from '@wordpress/components';
import {
  arrowLeft,
  customLink,
  envelope,
  link as linkIcon,
  mobile,
} from '@wordpress/icons';
import { isURL } from '@wordpress/url';
import {
  detectNavLinkType,
  getSuspiciousUrlIssue,
  normalizeNavMenuHref,
  isSuspiciousUrl,
} from '../../utils/navLinkUrl';

/** Same shape as normalizeNavMenuHref bare-email branch — avoids rejecting emails WP converts to mailto:. */
const BARE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Matches normalizeNavMenuHref scheme detection */
const HAS_COLON_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function navInputBypassesWordPressIsURL(trimmed) {
  return (
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    BARE_EMAIL.test(trimmed)
  );
}

/** WordPress isURL check; bare domains get https:// (normalizeNavMenuHref behavior). `wordpress.org` is rejected by isURL alone. */
function passesWordPressIsURL(trimmed) {
  if (isURL(trimmed)) {
    return true;
  }
  if (!HAS_COLON_SCHEME.test(trimmed)) {
    return isURL(`https://${trimmed}`);
  }
  return false;
}

const SUSPICIOUS_URL_NOTICE = {
  'no-tld':
    'This address has no domain extension (such as .com or .org). Check that you entered the full URL.',
  'single-char-tld':
    'The domain extension looks very short — did you mean something like .co or .com?',
  'trailing-dot':
    'This URL ends with a period after the hostname. Remove the trailing dot unless you intended it.',
};

const LINK_TYPE_ICONS = {
  email: envelope,
  phone: mobile,
  anchor: customLink,
  url: linkIcon,
};

/**
 * Form content for adding a custom URL menu item (parent renders Popover shell).
 *
 * @param {() => void} onBack
 * @param {() => void} onCancel
 * @param {{ label: string, url: string }} onSave
 */
function AddLinkPopover({ onBack, onCancel, onSave }) {
  const [urlInput, setUrlInput] = useState('');
  const [label, setLabel] = useState('');
  const [urlError, setUrlError] = useState('');
  const [labelError, setLabelError] = useState('');
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [lastWarnedUrl, setLastWarnedUrl] = useState('');

  const normalized = useMemo(() => {
    if (!urlInput.trim()) {
      return null;
    }
    return normalizeNavMenuHref(urlInput);
  }, [urlInput]);

  const linkType = normalized?.ok ? detectNavLinkType(normalized.href) : 'url';
  const typeIcon = LINK_TYPE_ICONS[linkType] ?? linkIcon;

  const suspiciousIssue = useMemo(() => {
    if (!normalized?.ok) return null;
    return getSuspiciousUrlIssue(normalized.href);
  }, [normalized]);

  const showSuspiciousWarning =
    hasBlurred && !warningDismissed && suspiciousIssue !== null;

  const validateAndSubmit = () => {
    const labelTrimmed = label.trim();
    const trimmed = urlInput.trim();

    setLabelError('');
    setUrlError('');

    if (!labelTrimmed) {
      setLabelError('Enter a label');
      return;
    }

    if (
      trimmed &&
      !navInputBypassesWordPressIsURL(trimmed) &&
      !passesWordPressIsURL(trimmed)
    ) {
      setUrlError('Enter a valid URL');
      return;
    }

    const result = normalizeNavMenuHref(trimmed);
    if (!result.ok) {
      setUrlError(result.error ?? 'Enter a valid URL');
      return;
    }

    onSave({ label: labelTrimmed, url: result.href });
  };

  const handleUrlBlur = () => {
    setHasBlurred(true);

    if (!urlInput.trim()) {
      setUrlError('');
      return;
    }

    const trimmed = urlInput.trim();

    if (
      !navInputBypassesWordPressIsURL(trimmed) &&
      !passesWordPressIsURL(trimmed)
    ) {
      setUrlError('Enter a valid URL');
      return;
    }

    const result = normalizeNavMenuHref(trimmed);
    if (!result.ok) {
      setUrlError(result.error ?? 'Enter a valid URL');
      return;
    }

    setUrlError('');
    setUrlInput(result.href);

    // Reset dismissal only when committing a new suspicious URL after blur
    if (isSuspiciousUrl(result.href) && result.href !== lastWarnedUrl) {
      setWarningDismissed(false);
      setLastWarnedUrl(result.href);
    }
  };

  const trimmedUrl = urlInput.trim();
  const passesWordPressLayer =
    trimmedUrl.length === 0 ||
    navInputBypassesWordPressIsURL(trimmedUrl) ||
    passesWordPressIsURL(trimmedUrl);

  const canSave =
    label.trim().length > 0 &&
    normalized?.ok &&
    !urlError &&
    trimmedUrl.length > 0 &&
    passesWordPressLayer;

  return (
    <div className="nav-inserter-popover nav-inserter-popover--add-link">
      <div className="nav-popover-header">
        <button
          type="button"
          className="nav-popover-back"
          onClick={onBack}
        >
          <span className="nav-popover-back__icon" aria-hidden="true">
            {arrowLeft}
          </span>
          Back
        </button>
      </div>

      <VStack spacing={4} className="nav-popover-body">
        <div
          className={
            urlError ? 'nav-add-link-url-field nav-add-link-url-field--error' : 'nav-add-link-url-field'
          }
        >
          <TextControl
            label="URL"
            value={urlInput}
            onChange={(value) => {
              setUrlInput(value);
              setUrlError('');
            }}
            onBlur={handleUrlBlur}
            placeholder="https://wordpress.org"
            autoComplete="off"
            suffix={
            normalized?.ok ? (
              <span className="nav-add-link-type-icon" aria-hidden="true">
                {typeIcon}
              </span>
            ) : undefined
          }
          help={urlError || undefined}
          __nextHasNoMarginBottom
        />
        </div>

        {showSuspiciousWarning && suspiciousIssue ? (
          <Notice
            status="warning"
            isDismissible
            onRemove={() => setWarningDismissed(true)}
            className="nav-add-link-warning"
          >
            {SUSPICIOUS_URL_NOTICE[suspiciousIssue]}
          </Notice>
        ) : null}

        <TextControl
          label="Label"
          value={label}
          onChange={(value) => {
            setLabel(value);
            setLabelError('');
          }}
          help={labelError || 'Label shown in the menu'}
          __nextHasNoMarginBottom
        />
      </VStack>

      <HStack justify="flex-end" className="nav-popover-footer">
        <Button variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={validateAndSubmit} disabled={!canSave}>
          Add link
        </Button>
      </HStack>
    </div>
  );
}

export default AddLinkPopover;
