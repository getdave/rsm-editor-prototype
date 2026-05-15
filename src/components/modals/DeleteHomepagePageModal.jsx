import { useMemo, useState } from "react";
import { Button, SelectControl } from "@wordpress/components";
import { Stack, Text } from "@wordpress/ui";

function readingPageOptionLabel(p) {
  const prefix = p.level > 0 ? `${"— ".repeat(p.level)}` : "";
  return `${prefix}${p.name}`;
}

/**
 * Rich delete dialog when removing the site homepage (ConfirmDialog cannot host controls).
 *
 * @param {{ id: string, name: string }} page
 * @param {Array<{ id: string, name: string, level?: number }>} readingSelectPages
 * @param {string} postsPageId
 * @param {() => void} onClose
 * @param {(payload: { replacementFrontPageId: string }) => void} onDelete
 */
function DeleteHomepagePageModal({
  page,
  readingSelectPages,
  postsPageId,
  onClose,
  onDelete,
}) {
  const [replacementId, setReplacementId] = useState("");

  const replacementOptions = useMemo(() => {
    const rows = readingSelectPages
      .filter((p) => p.id !== page.id && p.id !== postsPageId)
      .map((p) => ({
        label: readingPageOptionLabel(p),
        value: p.id,
      }));
    return [{ label: "Select page", value: "" }, ...rows];
  }, [readingSelectPages, page.id, postsPageId]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pp-delete-homepage-title"
      className="modal-box pp-delete-homepage-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <Stack
        direction="row"
        align="center"
        justify="space-between"
        className="modal-hd"
      >
        <Text id="pp-delete-homepage-title" variant="heading-md" className="modal-title">
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
          This page is currently set as your home page—what people see first when they
          open your site&rsquo;s main web address.
        </p>
        <div className="pp-delete-homepage-modal__notice" role="status">
          <p className="pp-delete-homepage-modal__notice-title">
            Choose a new Homepage
          </p>
          <p className="pp-delete-homepage-modal__notice-body">
            This step is optional. If you skip it for now, visitors will see a list of
            your Latest Posts.
          </p>
        </div>
        <div className="pp-delete-homepage-modal__field">
          <SelectControl
            __next40pxDefaultSize
            label="New Homepage"
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
          onClick={() => onDelete({ replacementFrontPageId: replacementId })}
        >
          {replacementId ? "Delete and reassign" : "Delete"}
        </Button>
      </div>
    </div>
  );
}

export default DeleteHomepagePageModal;
