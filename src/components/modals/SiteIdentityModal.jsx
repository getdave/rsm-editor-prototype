import { useState } from 'react';
import { Modal, Button, TextControl, Flex, FlexItem } from '@wordpress/components';
import { Stack, Text } from '@wordpress/ui';
import { useAppState } from '../../hooks/useAppState';

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
        <Stack direction="column" gap="sm">
          <Text variant="body-sm" className="site-identity-modal__logo-label">Site logo</Text>
          <Stack direction="row" align="center" gap="md" className="site-identity-modal__logo-area">
            <div className="site-identity-modal__logo-preview">
              <div className="site-identity-modal__logo-placeholder" />
            </div>
            <Stack direction="column" gap="sm">
              <Button variant="primary">Upload image</Button>
              <Button variant="secondary">Choose from library</Button>
            </Stack>
          </Stack>
        </Stack>
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
