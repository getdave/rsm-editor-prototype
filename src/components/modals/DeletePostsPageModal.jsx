import { useMemo, useState } from "react";
import { Button, SelectControl } from "@wordpress/components";
import { Stack, Text } from "@wordpress/ui";

function readingPageOptionLabel(p) {
  const prefix = p.level > 0 ? `${"— ".repeat(p.level)}` : "";
  return `${prefix}${p.name}`;
}

/**
 * Rich delete dialog when removing the Reading Posts page (ConfirmDialog cannot host controls).
 *
 * @param {{ id: string, name: string }} page
 * @param {Array<{ id: string, name: string, level?: number }>} readingSelectPages
 * @param {string} frontPageId — Homepage id; cannot match Posts page
 * @param {() => void} onClose
 * @param {(payload: { replacementPostsPageId: string }) => void} onDelete
 */
function DeletePostsPageModal({
  page,
  readingSelectPages,
  frontPageId,
  onClose,
  onDelete,
}) {
  const [replacementId, setReplacementId] = useState("");

  const replacementOptions = useMemo(() => {
    const rows = readingSelectPages
      .filter((p) => p.id !== page.id && p.id !== frontPageId)
      .map((p) => ({
        label: readingPageOptionLabel(p),
        value: p.id,
      }));
    return [{ label: "Select page", value: "" }, ...rows];
  }, [readingSelectPages, page.id, frontPageId]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pp-delete-posts-page-title"
      className="modal-box pp-delete-homepage-modal pp-delete-posts-page-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        className="modal-hd"
      >
        <Text id="pp-delete-posts-page-title" variant="heading-md" className="modal-title">
          Remove &ldquo;{page.name}&rdquo;?
        </Text>
        <button
          type="button"
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
      </Stack>
      <div className="modal-body pp-delete-homepage-modal__body">
        <p className="pp-delete-homepage-modal__lead">
          This page is set as your Posts page—the web address visitors use to open a
          list of your latest posts together.
        </p>
        <div className="pp-delete-homepage-modal__notice" role="status">
          <p className="pp-delete-homepage-modal__notice-title">
            Choose a new Posts page
          </p>
          <p className="pp-delete-homepage-modal__notice-body">
            This step is optional. If you skip it for now, your site won&apos;t have a
            dedicated address for that post list until you choose one (for example under{' '}
            <strong>Configure Homepage</strong> in More options).
          </p>
        </div>
        <div className="pp-delete-homepage-modal__field">
          <SelectControl
            __next40pxDefaultSize
            label="New Posts page"
            value={replacementId}
            options={replacementOptions}
            onChange={(v) => setReplacementId(v || "")}
          />
        </div>
      </div>
      <div className="modal-footer">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          isDestructive
          onClick={() => onDelete({ replacementPostsPageId: replacementId })}
        >
          {replacementId ? "Delete and reassign" : "Delete"}
        </Button>
      </div>
    </div>
  );
}

export default DeletePostsPageModal;
