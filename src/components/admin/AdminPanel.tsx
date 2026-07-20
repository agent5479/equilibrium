"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminListClients,
  adminLogin,
  adminSendEmail,
  adminUpsertClient,
  clearAdminSession,
  getStoredAdminToken,
  type AdminClient,
} from "@/lib/admin";

type View = "checking" | "login" | "dashboard";

export default function AdminPanel() {
  const [view, setView] = useState<View>("checking");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [listError, setListError] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [subscribedOnly, setSubscribedOnly] = useState(true);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [savingClient, setSavingClient] = useState(false);
  const [clientFeedback, setClientFeedback] = useState("");

  const loadClients = useCallback(async (sessionToken: string) => {
    setLoadingClients(true);
    setListError("");
    const result = await adminListClients(sessionToken);
    setLoadingClients(false);

    if (!result.success) {
      setListError(result.message || "Could not load clients.");
      if (result.message?.toLowerCase().includes("session")) {
        clearAdminSession();
        setToken("");
        setView("login");
      }
      return;
    }

    setClients(result.clients || []);
  }, []);

  useEffect(() => {
    const stored = getStoredAdminToken();
    if (stored) {
      setToken(stored);
      setView("dashboard");
      loadClients(stored);
    } else {
      setView("login");
    }
  }, [loadClients]);

  const visibleClients = useMemo(() => {
    const list = subscribedOnly
      ? clients.filter((c) => c.subscribed === "yes")
      : clients;
    return [...list].sort((a, b) =>
      a.email.localeCompare(b.email, undefined, { sensitivity: "base" })
    );
  }, [clients, subscribedOnly]);

  const selectedEmails = useMemo(
    () =>
      visibleClients
        .filter((c) => selected[c.email.toLowerCase()])
        .map((c) => c.email),
    [visibleClients, selected]
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    const result = await adminLogin(password);
    setLoggingIn(false);

    if (!result.success || !result.token) {
      setLoginError(result.message || "Login failed.");
      return;
    }

    setPassword("");
    setToken(result.token);
    setView("dashboard");
    await loadClients(result.token);
  }

  function handleLogout() {
    clearAdminSession();
    setToken("");
    setClients([]);
    setSelected({});
    setView("login");
  }

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = { ...selected };
    for (const c of visibleClients) {
      next[c.email.toLowerCase()] = checked;
    }
    setSelected(next);
  }

  function toggleOne(email: string, checked: boolean) {
    setSelected((prev) => ({
      ...prev,
      [email.toLowerCase()]: checked,
    }));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSending(true);
    setSendFeedback("");
    const result = await adminSendEmail(token, {
      subject,
      body,
      emails: selectedEmails,
    });
    setSending(false);
    setSendFeedback(result.message);
    if (result.success) {
      setSubject("");
      setBody("");
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingClient(true);
    setClientFeedback("");
    const result = await adminUpsertClient(token, {
      email: newEmail,
      firstName: newFirstName,
      lastName: newLastName,
      phone: newPhone,
      source: "manual",
      subscribed: "yes",
    });
    setSavingClient(false);
    setClientFeedback(result.message);
    if (result.success) {
      setNewEmail("");
      setNewFirstName("");
      setNewLastName("");
      setNewPhone("");
      await loadClients(token);
    }
  }

  async function toggleSubscribed(client: AdminClient) {
    if (!token) return;
    const next = client.subscribed === "yes" ? "no" : "yes";
    const result = await adminUpsertClient(token, {
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      source: client.source,
      subscribed: next,
    });
    if (result.success) {
      await loadClients(token);
    } else {
      setListError(result.message);
    }
  }

  if (view === "checking") {
    return <p className="form-notice">Loading…</p>;
  }

  if (view === "login") {
    return (
      <div className="admin-login">
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              type="password"
              id="admin-password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loggingIn}>
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
          {loginError ? <p className="admin-feedback error">{loginError}</p> : null}
        </form>
      </div>
    );
  }

  const allVisibleSelected =
    visibleClients.length > 0 &&
    visibleClients.every((c) => selected[c.email.toLowerCase()]);

  return (
    <div className="admin-dashboard">
      <div className="admin-toolbar">
        <p>
          {clients.length} client{clients.length === 1 ? "" : "s"}
          {subscribedOnly ? " (showing subscribed)" : ""}
        </p>
        <div className="admin-toolbar-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => loadClients(token)}
            disabled={loadingClients}
          >
            {loadingClients ? "Refreshing…" : "Refresh"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {listError ? <p className="admin-feedback error">{listError}</p> : null}

      <label className="admin-filter">
        <input
          type="checkbox"
          checked={subscribedOnly}
          onChange={(e) => setSubscribedOnly(e.target.checked)}
        />
        Show subscribed only
      </label>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  aria-label="Select all visible clients"
                />
              </th>
              <th>Email</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Source</th>
              <th>Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {visibleClients.length === 0 ? (
              <tr>
                <td colSpan={6}>No clients yet.</td>
              </tr>
            ) : (
              visibleClients.map((c) => (
                <tr key={c.id || c.email}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selected[c.email.toLowerCase()]}
                      onChange={(e) => toggleOne(c.email, e.target.checked)}
                      aria-label={`Select ${c.email}`}
                    />
                  </td>
                  <td>{c.email}</td>
                  <td>
                    {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.source || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-link-btn"
                      onClick={() => toggleSubscribed(c)}
                    >
                      {c.subscribed === "yes" ? "Yes" : "No"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="admin-section">
        <h2>Send email</h2>
        <p className="admin-hint">
          {selectedEmails.length} recipient
          {selectedEmails.length === 1 ? "" : "s"} selected. Emails are sent
          individually via Gmail.
        </p>
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label htmlFor="email-subject">Subject *</label>
            <input
              type="text"
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email-body">Message *</label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={sending || selectedEmails.length === 0}
          >
            {sending ? "Sending…" : "Send"}
          </button>
          {sendFeedback ? (
            <p className="admin-feedback">{sendFeedback}</p>
          ) : null}
        </form>
      </section>

      <section className="admin-section">
        <h2>Add or update client</h2>
        <form onSubmit={handleAddClient}>
          <div className="admin-form-row">
            <div className="form-group">
              <label htmlFor="new-email">Email *</label>
              <input
                type="email"
                id="new-email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-phone">Phone</label>
              <input
                type="tel"
                id="new-phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="form-group">
              <label htmlFor="new-first">First name</label>
              <input
                type="text"
                id="new-first"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-last">Last name</label>
              <input
                type="text"
                id="new-last"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={savingClient}>
            {savingClient ? "Saving…" : "Save client"}
          </button>
          {clientFeedback ? (
            <p className="admin-feedback">{clientFeedback}</p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
