import { useState } from 'react';
import {
  TextControl,
  __experimentalVStack as VStack,
} from '@wordpress/components';
import {
  arrowLeft,
  share,
  search as searchIcon,
  button as buttonIcon,
} from '@wordpress/icons';

const MOCK_BLOCKS = [
  { id: 'core/social-links', title: 'Social', icon: share },
  { id: 'core/search', title: 'Search', icon: searchIcon },
  { id: 'core/button', title: 'Button', icon: buttonIcon },
];

/**
 * Mock block inserter for prototype — shows Social, Search, Button only.
 *
 * @param {() => void} onBack
 * @param {() => void} onClose
 */
function AddBlockPopover({ onBack, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="nav-inserter-popover nav-inserter-popover--add-block">
      <div className="nav-popover-header">
        <button type="button" className="nav-popover-back" onClick={onBack}>
          <span className="nav-popover-back__icon" aria-hidden="true">
            {arrowLeft}
          </span>
          Back
        </button>
      </div>

      <VStack spacing={3} className="nav-popover-body">
        <TextControl
          label="Search blocks"
          hideLabelFromVision
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search"
          autoComplete="off"
          autoFocus
          __nextHasNoMarginBottom
        />

        <div className="nav-block-list">
          {MOCK_BLOCKS.map((block) => (
            <button
              key={block.id}
              type="button"
              className="nav-block-item"
              onClick={onClose}
            >
              <span className="nav-block-item__icon" aria-hidden="true">
                {block.icon}
              </span>
              <span className="nav-block-item__title">{block.title}</span>
            </button>
          ))}
        </div>
      </VStack>
    </div>
  );
}

export default AddBlockPopover;
