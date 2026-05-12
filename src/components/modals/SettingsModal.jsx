import { useState } from 'react';
import { Button } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { DataForm } from '@wordpress/dataviews';
import { close } from '@wordpress/icons';
import { useAppState } from '../../hooks/useAppState';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'writing', label: 'Writing' },
  { id: 'reading', label: 'Reading' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'media', label: 'Media' },
  { id: 'permalinks', label: 'Permalinks' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'edge-cache', label: 'Edge Cache' },
];

// DataForm field definitions for the General tab. Mirrors the controls
// shown in WordPress core's General Settings screen.
const generalFields = [
  {
    id: 'title',
    label: 'Site Title',
    type: 'text',
    Edit: 'text',
  },
  {
    id: 'tagline',
    label: 'Tagline',
    type: 'text',
    Edit: 'text',
    description:
      'In a few words, explain what this site is about. Example: “Just another WordPress site.”',
  },
  {
    id: 'siteIcon',
    label: 'Site Icon',
    type: 'text',
    Edit: 'text',
    description:
      'The Site Icon is what you see in browser tabs, bookmark bars, and within the WordPress mobile apps. It should be square and at least 512 by 512 pixels.',
  },
  {
    id: 'wpAddress',
    label: 'WordPress Address (URL)',
    type: 'text',
    Edit: 'text',
    readOnly: true,
  },
  {
    id: 'siteAddress',
    label: 'Site Address (URL)',
    type: 'text',
    Edit: 'text',
    readOnly: true,
  },
  {
    id: 'adminEmail',
    label: 'Administration Email Address',
    type: 'email',
    Edit: 'email',
    description:
      'This address is used for admin purposes. If you change this, an email will be sent to your new address to confirm it.',
  },
  {
    id: 'membership',
    label: 'Membership',
    type: 'boolean',
    Edit: 'checkbox',
    description: 'Anyone can register',
  },
  {
    id: 'defaultRole',
    label: 'New User Default Role',
    type: 'text',
    Edit: 'select',
    elements: [
      { value: 'subscriber', label: 'Subscriber' },
      { value: 'contributor', label: 'Contributor' },
      { value: 'author', label: 'Author' },
      { value: 'editor', label: 'Editor' },
      { value: 'administrator', label: 'Administrator' },
    ],
  },
  {
    id: 'siteLanguage',
    label: 'Site Language',
    type: 'text',
    Edit: 'select',
    elements: [
      { value: 'en_US', label: 'English (United States)' },
      { value: 'en_GB', label: 'English (UK)' },
      { value: 'es_ES', label: 'Español' },
      { value: 'fr_FR', label: 'Français' },
      { value: 'de_DE', label: 'Deutsch' },
    ],
  },
  {
    id: 'timezone',
    label: 'Timezone',
    type: 'text',
    Edit: 'select',
    description:
      'Choose either a city in the same timezone as you or a UTC (Coordinated Universal Time) time offset.',
    elements: [
      { value: 'UTC-5', label: 'UTC-5' },
      { value: 'UTC-4', label: 'UTC-4' },
      { value: 'UTC+0', label: 'UTC+0' },
      { value: 'UTC+1', label: 'UTC+1' },
      { value: 'UTC+2', label: 'UTC+2' },
    ],
  },
  {
    id: 'dateFormat',
    label: 'Date Format',
    type: 'text',
    Edit: 'radio',
    elements: [
      { value: 'F j, Y', label: 'April 30, 2026' },
      { value: 'Y-m-d', label: '2026-04-30' },
      { value: 'm/d/Y', label: '04/30/2026' },
      { value: 'd/m/Y', label: '30/04/2026' },
      { value: 'd.m.Y', label: '30.04.2026' },
    ],
  },
  {
    id: 'timeFormat',
    label: 'Time Format',
    type: 'text',
    Edit: 'radio',
    elements: [
      { value: 'g:i a', label: '7:36 am' },
      { value: 'g:i A', label: '7:36 AM' },
      { value: 'H:i', label: '07:36' },
    ],
  },
  {
    id: 'weekStartsOn',
    label: 'Week Starts On',
    type: 'text',
    Edit: 'select',
    elements: [
      { value: 'monday', label: 'Monday' },
      { value: 'tuesday', label: 'Tuesday' },
      { value: 'wednesday', label: 'Wednesday' },
      { value: 'thursday', label: 'Thursday' },
      { value: 'friday', label: 'Friday' },
      { value: 'saturday', label: 'Saturday' },
      { value: 'sunday', label: 'Sunday' },
    ],
  },
];

const generalForm = {
  type: 'regular',
  fields: generalFields.map((f) => f.id),
};

function SettingsModal() {
  const { settingsModalOpen } = useAppState();

  // Inner content mounts on open so its local state seeds fresh from
  // current app state and tab selection resets each time the modal opens.
  if (!settingsModalOpen) return null;
  return <SettingsModalContent />;
}

function SettingsModalContent() {
  const {
    closeSettingsModal,
    siteTitle,
    setSiteTitle,
    siteSettings,
    setSiteSettings,
  } = useAppState();
  const [activeTab, setActiveTab] = useState('general');
  const [draft, setDraft] = useState(() => ({
    title: siteTitle,
    ...siteSettings,
  }));

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSettingsModal();
    }
  };

  const handleFormChange = (edits) => {
    setDraft((prev) => ({
      ...prev,
      ...(typeof edits === 'function' ? edits(prev) : edits),
    }));
  };

  const handleSave = () => {
    const { title, ...rest } = draft;
    if (title && title.trim() !== siteTitle) {
      setSiteTitle(title.trim());
    }
    setSiteSettings(rest);
    closeSettingsModal();
  };

  return (
    <div
      className="modal-overlay settings-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <Stack
          direction="row"
          align="center"
          justify="space-between"
          className="settings-modal-hd"
        >
          <Text variant="heading-md" className="settings-modal-title">Settings</Text>
          <Button
            icon={close}
            label="Close"
            onClick={closeSettingsModal}
            className="settings-modal-close"
          />
        </Stack>
        <div className="settings-modal-body">
          <nav className="settings-tabs" aria-label="Settings sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`settings-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="settings-pane">
            {activeTab === 'general' ? (
              <div className="settings-form">
                <DataForm
                  data={draft}
                  fields={generalFields}
                  form={generalForm}
                  onChange={handleFormChange}
                />
                <Stack
                  direction="row"
                  align="center"
                  justify="flex-end"
                  gap="sm"
                  className="settings-form-actions"
                >
                  <Button variant="tertiary" onClick={closeSettingsModal}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Save changes
                  </Button>
                </Stack>
              </div>
            ) : (
              <div className="settings-pane-placeholder">
                <Text variant="body-md">{TABS.find((t) => t.id === activeTab)?.label} settings coming soon.</Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
