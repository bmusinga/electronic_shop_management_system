"use client";

import { useState, useEffect } from "react";
import { Shield, Save, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Toast {
  kind: "success" | "error";
  message: string;
}

interface PasswordState {
  current: string;
  new: string;
  confirm: string;
}

export default function SettingsPage() {
  const { changePassword } = useAuth();

  const [toast, setToast] = useState<Toast | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [passwords, setPasswords] = useState<PasswordState>({
    current: "",
    new: "",
    confirm: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer: ReturnType<typeof setTimeout> = setTimeout(
      () => setToast(null),
      3000
    );
    return () => clearTimeout(timer);
  }, [toast]);

  const flash = (kind: Toast["kind"], message: string) =>
    setToast({ kind, message });

  async function handleChangePassword() {
    if (passwords.new !== passwords.confirm) {
      flash("error", "New password and confirmation do not match.");
      return;
    }
    if (passwords.new.length < 6) {
      flash("error", "New password must be at least 6 characters.");
      return;
    }
    if (!passwords.current || !passwords.new) {
      flash("error", "Please fill in all password fields.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwords.current, passwords.new);
      setPasswords({ current: "", new: "", confirm: "" });
      flash("success", "Password updated successfully");
    } catch (err) {
      flash(
        "error",
        err instanceof Error ? err.message : "Could not update password."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1F44] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-sm ${
              toast.kind === "success"
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
            }`}
          >
            {toast.kind === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                toast.kind === "success"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {toast.message}
            </span>
          </div>
        )}

        <div className="rounded-xl sk-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg sk-icon bg-blue-50 dark:bg-blue-900/30">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Security
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder="Enter new password"
                  className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="Confirm new password"
                  className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium sk-btn-primary"
            >
              <Save className="h-4 w-4" />
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}