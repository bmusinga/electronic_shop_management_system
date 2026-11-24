"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { displayKenyanPhone } from "@/lib/phone";
import {
  REPAIR_STATUSES,
  type RepairBooking,
  type RepairStatus,
} from "@/lib/types";

export default function RepairsPage() {
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBookings(await apiFetch<RepairBooking[]>("/api/repairs", {
        cache: "no-store",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load repairs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<RepairBooking[]>("/api/repairs", { cache: "no-store" })
      .then((items) => {
        if (!active) return;
        setBookings(items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load repairs.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function changeStatus(id: string, status: RepairStatus) {
    setUpdating(id);
    setError(null);
    try {
      await apiFetch(`/api/repairs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1F44] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Repairs</h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Bookings submitted by customers and their current status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium sk-btn-primary disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="rounded-xl sk-panel overflow-x-auto">
          {loading ? (
            <p className="p-6 text-sm text-text-secondary-light dark:text-text-secondary-dark">Loading repairs...</p>
          ) : bookings.length === 0 ? (
            <p className="p-6 text-sm text-text-secondary-light dark:text-text-secondary-dark">No repair bookings yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Device</th>
                  <th className="p-3">Problem</th>
                  <th className="p-3">Drop-off</th>
                  <th className="p-3">Booked</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-border-light dark:border-border-dark">
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{booking.reference}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-200">
                      {booking.name}
                      <span className="block text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {displayKenyanPhone(booking.phone)}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-200">{booking.model}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-200">
                      {booking.problem}
                      {booking.notes && (
                        <span className="block text-xs text-text-secondary-light dark:text-text-secondary-dark">{booking.notes}</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-200">{booking.preferredDate}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-200">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-3">
                      <select
                        aria-label={`Status for ${booking.reference}`}
                        value={booking.status}
                        disabled={updating === booking.id}
                        onChange={(event) => {
                          const next = REPAIR_STATUSES.find(
                            (status) => status === event.target.value
                          );
                          if (next) void changeStatus(booking.id, next);
                        }}
                        className="rounded-lg px-2 py-1.5 text-sm sk-input"
                      >
                        {REPAIR_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
