"use client";

import { useState, useEffect } from "react";
import {
  User,
  Store,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/client-api";
import type { SettingsData } from "@/lib/types";

interface Toast {
  kind: "success" | "error";
  message: string;
}

interface ProfileState {
  fullName: string;
  email: string;
  phone: string;
}

interface StoreState {
  storeName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}

interface PasswordState {
  current: string;
  new: string;
  confirm: string;
}

export default function SettingsPage() {
  const { user, changePassword } = useAuth();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profile, setProfile] = useState<ProfileState>({
    fullName: "",
    email: "",
    phone: "",
  });

  const [store, setStore] = useState<StoreState>({
    storeName: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [passwords, setPasswords] = useState<PasswordState>({
    current: "",
    new: "",
    confirm: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<SettingsData>("/api/settings", { cache: "no-store" })
      .then((data) => {
        if (!active) return;
        if (data) {
          setProfile({
            fullName: data.fullName || "",
            email: data.email || user?.email || "",
            phone: data.phone || "",
          });
          setStore({
            storeName: data.storeName || "",
            description: data.description || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
          });
        } else {
          setProfile((prev) => ({ ...prev, email: user?.email || "" }));
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setProfile((prev) => ({ ...prev, email: user?.email || "" }));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [user?.email]);

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

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const data: SettingsData = {
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      };
      await apiFetch<{ ok: boolean }>("/api/settings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      flash("success", "Profile saved successfully");
    } catch (err) {
      flash(
        "error",
        err instanceof Error ? err.message : "Could not save profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveStore() {
    setSavingStore(true);
    try {
      const data: SettingsData = {
        storeName: store.storeName.trim(),
        description: store.description.trim(),
        contactEmail: store.contactEmail.trim(),
        contactPhone: store.contactPhone.trim(),
      };
      await apiFetch<{ ok: boolean }>("/api/settings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      flash("success", "Store settings saved successfully");
    } catch (err) {
      flash(
        "error",
        err instanceof Error ? err.message : "Could not save store settings."
      );
    } finally {
      setSavingStore(false);
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-[#0A1F44] p-4 sm:p-6 lg:p-8">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1F44] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Toast */}
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

        {/* Section A: Profile Settings */}
        <div className="rounded-xl sk-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg sk-icon bg-blue-50 dark:bg-blue-900/30">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Profile Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl px-4 py-2.5 text-sm text-slate-400 dark:text-slate-500 opacity-60 sk-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium sk-btn-primary"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Section B: Store Settings */}
        <div className="rounded-xl sk-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg sk-icon bg-blue-50 dark:bg-blue-900/30">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Store Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Store Name
              </label>
              <input
                type="text"
                value={store.storeName}
                onChange={(e) =>
                  setStore({ ...store, storeName: e.target.value })
                }
                placeholder="My Store"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Store Description
              </label>
              <textarea
                rows={4}
                value={store.description}
                onChange={(e) =>
                  setStore({ ...store, description: e.target.value })
                }
                placeholder="Tell customers about your store"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contact Email
              </label>
              <input
                type="email"
                value={store.contactEmail}
                onChange={(e) =>
                  setStore({ ...store, contactEmail: e.target.value })
                }
                placeholder="support@example.com"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contact Phone
              </label>
              <input
                type="tel"
                value={store.contactPhone}
                onChange={(e) =>
                  setStore({ ...store, contactPhone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 sk-input"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveStore}
              disabled={savingStore}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium sk-btn-primary"
            >
              <Save className="h-4 w-4" />
              {savingStore ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Section C: Security */}
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