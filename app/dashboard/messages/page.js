"use client";

import { useState, useEffect } from "react";
import { Mail, Trash2, Inbox, User, CalendarClock } from "lucide-react";
import { subscribeToMessages, removeMessage } from "@/lib/firestore";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      (items) => {
        setMessages(items);
        setLoading(false);
        setLoadError("");
      },
      () => {
        setLoadError(
          "Could not load messages. Make sure the Firestore database is created and read rules are enabled."
        );
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  async function handleDelete() {
    try {
      await removeMessage(deleteId);
      setDeleteId(null);
    } catch (err) {
      setLoadError("Could not delete the message. Check your Firestore write rules and try again.");
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Messages
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Messages sent from the contact form on your website.
          </p>
        </div>
        {messages.length > 0 && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg sk-panel text-sm font-medium text-slate-700 dark:text-slate-200">
            <Mail className="w-4 h-4 text-[#2563EB]" />
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-400">{loadError}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !loadError && messages.length === 0 && (
        <div className="sk-panel p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full sk-icon bg-[#2563EB]/10 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-[#2563EB]" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No messages yet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            When visitors submit the contact form on your website, their messages
            will appear here.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {messages.map((message) => (
          <div key={message.id} className="sk-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full sk-icon bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {message.name || "Anonymous"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {message.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteId(message.id)}
                aria-label={`Delete message from ${message.name}`}
                className="p-2 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-150 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium sk-badge bg-[#2563EB]/10 text-[#2563EB]">
                {message.subject || "General Inquiry"}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {message.message}
            </p>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CalendarClock className="w-3.5 h-3.5" />
              {formatDate(message.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="sk-panel w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Delete message?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This will permanently remove this message.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium sk-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-b from-red-500 to-red-700 border border-red-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.3)] hover:from-red-600 hover:to-red-800 transition-all duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}