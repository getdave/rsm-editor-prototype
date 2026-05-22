import { useState } from 'react';
import { Modal, Button, TextControl, BaseControl, Flex, FlexItem } from '@wordpress/components';
import { Stack } from '@wordpress/ui';
import { useAppState } from '../../hooks/useAppState';
import siteLogo from '../../assets/site-logo.png';

function SiteIdentityModal() {
  const { siteIdentityModalOpen } = useAppState();

  // Render an inner component only while open so its local state resets
  // (and reseeds from the current siteTitle) every time the modal reopens —
  // without needing a setState-in-effect to do the reseeding.
  if (!siteIdentityModalOpen) return null;
  return <SiteIdentityModalContent />;
}

function SiteIdentityModalContent() {
  const {
    closeSiteIdentityModal,
    siteTitle,
    setSiteTitle,
  } = useAppState();
  const [draftTitle, setDraftTitle] = useState(siteTitle);

  const handleSave = () => {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== siteTitle) {
      setSiteTitle(trimmed);
    }
    // Logo save logic would go here once persistence is wired up.
    closeSiteIdentityModal();
  };

  const handleCancel = () => {
    closeSiteIdentityModal();
  };

  return (
    <Modal
      title="Edit site identity"
      onRequestClose={closeSiteIdentityModal}
      className="site-identity-modal"
    >
      <Stack direction="column" gap="lg" className="site-identity-modal__body">
        <TextControl
          label="Site title"
          value={draftTitle}
          onChange={setDraftTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          __next40pxDefaultSize
          autoFocus
        />
        <BaseControl
          __nextHasNoMarginBottom
          id="site-identity-logo"
          label="Site logo"
        >
          <Stack direction="row" align="flex-start" gap="md" className="site-identity-modal__logo-area">
            <div className="site-identity-modal__logo-preview">
              <img className="site-identity-modal__logo-image" src={siteLogo} alt="Site logo" />
            </div>
            <Stack direction="column" align="flex-start" gap="sm">
              <Button variant="secondary">Upload image</Button>
              <Button variant="secondary">Choose from library</Button>
            </Stack>
          </Stack>
        </BaseControl>
      </Stack>
      <Flex justify="flex-end" gap={2} className="site-identity-modal__actions">
        <FlexItem>
          <Button variant="tertiary" onClick={handleCancel}>
            Cancel
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="primary" onClick={handleSave}>
            Save changes
          </Button>
        </FlexItem>
      </Flex>
    </Modal>
  );
}

export default SiteIdentityModal;
