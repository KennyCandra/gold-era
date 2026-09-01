import { Button, Modal } from "@/components/ui";
import type { AdminUser } from "@/components/admin/UsersTable";

export interface DeleteUserModalProps {
  user: AdminUser | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteUserModal({ user, onCancel, onConfirm, isDeleting }: DeleteUserModalProps) {
  const fileCount = user?.fileCount ?? 0;

  return (
    <Modal
      open={!!user}
      onClose={onCancel}
      title="Delete user?"
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isDeleting}>
            Delete user
          </Button>
        </>
      }
    >
      This will permanently delete {user?.name} and all {fileCount} of their files. This action
      cannot be undone.
    </Modal>
  );
}
