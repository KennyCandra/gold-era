"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Button, Input } from "@/components/ui";
import { useChangePassword } from "@/hooks/useProfile";
import { PASSWORD_HINT, validatePassword } from "@/lib/password";
import type { ApiError } from "@/lib/types";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

function validateNewPassword(password: string): string | undefined {
  if (!password) return "New password is required";
  return validatePassword(password) ?? undefined;
}

function mapApiFieldErrors(errors: Record<string, string[]>): FieldErrors {
  const mapped: FieldErrors = {};

  Object.entries(errors).forEach(([key, messages]) => {
    const field = key.split(".").pop();
    const message = messages[0];
    if (!message) return;
    if (field === "currentPassword") mapped.currentPassword = message;
    if (field === "newPassword") mapped.newPassword = message;
  });

  return mapped;
}

export function ChangePasswordForm() {
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!currentPassword) errors.currentPassword = "Current password is required";

    // Deliberately no "must differ from the current password" check here: the
    // typed current password may simply be a typo, so comparing the two fields
    // on the client proves nothing. The server's changePasswordSchema owns that
    // rule and reports it on the newPassword path.
    const newPasswordError = validateNewPassword(newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;

    if (!confirmPassword) errors.confirmPassword = "Please confirm your new password";
    else if (confirmPassword !== newPassword)
      errors.confirmPassword = "Passwords do not match";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFieldErrors({});
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      reset();
      toast.success("Password updated");
    } catch (err) {
      const apiErr = err as ApiError;
      const message = apiErr.message || "Could not update your password";
      if (apiErr.errors) setFieldErrors(mapApiFieldErrors(apiErr.errors));
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Change password</h2>
        <p className="text-[13px] leading-[18px] text-muted">
          {PASSWORD_HINT}
        </p>
      </div>

      {formError && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger-subtle px-3 py-2.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            Current password
          </label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={fieldErrors.currentPassword}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New password
          </label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={fieldErrors.newPassword}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm new password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
          />
        </div>

        <div>
          <Button type="submit" loading={changePassword.isPending}>
            Update password
          </Button>
        </div>
      </form>
    </section>
  );
}
