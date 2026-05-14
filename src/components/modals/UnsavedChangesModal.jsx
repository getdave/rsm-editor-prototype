import { Modal, Button, Flex, FlexItem } from '@wordpress/components';
import { useAppState } from '../../hooks/useAppState';

const SAMPLE_CHANGES = [
  { id: 'site-title', label: 'Site title updated to “My Photography Site”' },
  { id: 'about-page', label: 'Page “About” content edited' },
  { id: 'primary-menu', label: 'Primary navigation menu reordered' },
];

function UnsavedChangesModal() {
  const {
    unsavedChangesModalOpen,
    closeUnsavedChangesModal,
    save,
  } = useAppState();

  if (!unsavedChangesModalOpen) return null;

  const handleSave = () => {
    save();
    closeUnsavedChangesModal();
  };

  return (
    <Modal
      title="Unsaved changes"
      size="small"
      className="unsaved-changes-modal"
      onRequestClose={closeUnsavedChangesModal}
    >
      <p className="unsaved-changes-modal__intro">
        The following changes will be saved:
      </p>
      <ul className="unsaved-changes-modal__list">
        {SAMPLE_CHANGES.map((change) => (
          <li key={change.id}>{change.label}</li>
        ))}
      </ul>
      <Flex justify="flex-end" gap={2} className="unsaved-changes-modal__actions">
        <FlexItem>
          <Button variant="tertiary" onClick={closeUnsavedChangesModal}>
            Cancel
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </FlexItem>
      </Flex>
    </Modal>
  );
}

export default UnsavedChangesModal;
