import { useState } from 'react';
import {
  Button,
  TextControl,
  CheckboxControl,
  __experimentalVStack as VStack,
  __experimentalHStack as HStack,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';

/**
 * Form content for creating a page from the nav quick inserter (parent renders Popover shell).
 *
 * @param {() => void} onBack
 * @param {() => void} onCancel
 * @param {{ name: string, publishImmediately: boolean }} onSave
 */
function CreatePagePopover({ onBack, onCancel, onSave }) {
  const [pageName, setPageName] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);

  const trimmedName = pageName.trim();
  const canSave = trimmedName.length > 0;

  const handleSubmit = () => {
    if (!canSave) return;
    onSave({ name: trimmedName, publishImmediately });
  };

  return (
    <div className="nav-inserter-popover nav-inserter-popover--create-page">
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
        <TextControl
          label="Page name"
          value={pageName}
          onChange={setPageName}
          placeholder="Enter page name"
          autoFocus
          __nextHasNoMarginBottom
        />

        <CheckboxControl
          label="Publish immediately"
          checked={publishImmediately}
          onChange={setPublishImmediately}
          __nextHasNoMarginBottom
        />

        <p className="nav-create-page-help">
          You can edit this page and choose a layout later under the Pages screen.
        </p>
      </VStack>

      <HStack justify="flex-end" className="nav-popover-footer">
        <Button variant="tertiary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!canSave}>
          Create page
        </Button>
      </HStack>
    </div>
  );
}

export default CreatePagePopover;
