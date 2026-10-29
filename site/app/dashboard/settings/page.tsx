"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { clearAuth, clearProxyCookie, getStoredUser, type FotoroUser } from "@/lib/fotoro-session";
import { useServerData } from "@/components/dashboard/server-data-provider";

type Schedule = { enabled: boolean; process_time: string; max_per_batch: number; process_days: number[] };
type Diagnostics = {
  database: { schema_version: number; quick_check: string };
  primary: { available: boolean };
  backup: { available: boolean; configured: boolean };
  tailscale: { running: boolean };
  queue?: { next_run?: string };
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<FotoroUser | null>(null);
  const { token, endpoint, online } = useServerData();
  const [schedule, setSchedule] = React.useState<Schedule | null>(null);
  const [diagnostics, setDiagnostics] = React.useState<Diagnostics | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!getStoredUser()) router.replace("/login?callbackUrl=/dashboard/settings");
    else setUser(getStoredUser());
  }, [router]);

  const refresh = React.useCallback(async () => {
    if (!token || online !== "online") return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [scheduleResponse, diagnosticsResponse] = await Promise.all([
        fetch(endpoint ? `${endpoint}/api/scheduler/config` : "/api/fotoro/api/scheduler/config", { headers }),
        fetch(endpoint ? `${endpoint}/api/v1/diagnostics` : "/api/fotoro/api/v1/diagnostics", { headers }),
      ]);
      if (!scheduleResponse.ok || !diagnosticsResponse.ok) throw new Error("Could not read server settings");
      setSchedule((await scheduleResponse.json()) as Schedule);
      setDiagnostics((await diagnosticsResponse.json()) as Diagnostics);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read server settings");
    }
  }, [token, endpoint, online]);

  React.useEffect(() => { void refresh(); }, [refresh]);
  React.useEffect(() => {
    if (online !== "online") { setSchedule(null); setDiagnostics(null); }
  }, [online]);

  async function toggleSchedule() {
    if (!token || !schedule) return;
    setSaving(true);
    try {
      const response = await fetch(endpoint ? `${endpoint}/api/scheduler/config` : "/api/fotoro/api/scheduler/config", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !schedule.enabled }),
      });
      if (!response.ok) throw new Error("Could not save the schedule");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the schedule");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;
  const rows = [
    ["Primary storage", diagnostics ? diagnostics.primary.available ? "Available" : "Unavailable" : "—"],
    ["Backup target", diagnostics ? !diagnostics.backup.configured ? "Not configured" : diagnostics.backup.available ? "Available" : "Unavailable" : "—"],
    ["Tailscale", diagnostics ? diagnostics.tailscale.running ? "Connected" : "Disconnected" : "—"],
    ["Database", diagnostics ? `${diagnostics.database.quick_check} · schema ${diagnostics.database.schema_version}` : "—"],
    ["Scheduled processing", schedule ? schedule.enabled ? "Enabled" : "Disabled" : "—"],
    ["Processing time", schedule?.process_time ?? "—"],
    ["Batch limit", schedule ? String(schedule.max_per_batch) : "—"],
    ["Next run", !diagnostics ? "—" : diagnostics.queue?.next_run ? new Date(diagnostics.queue.next_run).toLocaleString() : "None scheduled"],
  ];

  return <>
    <DashboardTopbar user={user} onLogout={() => { clearAuth(); void clearProxyCookie(); router.push("/login"); }} />
    <main className="container-tight w-full px-5 py-8">
      <p className="matrix-label">Settings / this machine</p>
      <h1 className="mt-1 text-2xl font-semibold">Server settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Read from your local server and its SQLite configuration.</p>
      {error ? <p role="alert" className="mt-5 text-sm text-destructive-foreground">{error}</p> : null}
      {online !== "online" ? <p className="mt-5 text-sm text-muted-foreground">Connect the server to inspect or change settings.</p> : null}
      <dl className="matrix-panel mt-8 divide-y divide-border">
        {rows.map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-3 px-5 py-4 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="font-mono text-xs">{value}</dd></div>)}
      </dl>
      <button type="button" onClick={() => void toggleSchedule()} disabled={!schedule || saving}
        className="mt-6 rounded-md border border-border px-4 py-2 text-sm disabled:opacity-50">
        {saving ? "Saving…" : schedule?.enabled ? "Disable scheduled processing" : "Enable scheduled processing"}
      </button>
    </main>
  </>;
}
