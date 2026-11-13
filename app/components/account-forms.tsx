"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowIcon } from "./arrow-icon";

export type ProfileValues = {
  fullName: string;
  phone: string;
  birthday: string;
  favouriteDrink: string;
  marketingOptIn: boolean;
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

async function send(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? "Something went wrong. Please try again.");
  return result;
}

/** Name, phone, birthday, favourite drink and the news opt-in. Shared by join and edit. */
function ProfileFields({ values, onChange, drinks }: { values: ProfileValues; onChange: (next: ProfileValues) => void; drinks: string[] }) {
  const [month, day] = values.birthday ? values.birthday.split("-") : ["", ""];
  const setBirthday = (nextMonth: string, nextDay: string) =>
    onChange({ ...values, birthday: nextMonth && nextDay ? `${nextMonth}-${nextDay}` : "" });

  return (
    <>
      <label className="xp-field">
        <span>Full name</span>
        <input value={values.fullName} onChange={(e) => onChange({ ...values, fullName: e.target.value })} autoComplete="name" required maxLength={80} />
      </label>
      <label className="xp-field">
        <span>Phone <em>optional</em></span>
        <input type="tel" value={values.phone} onChange={(e) => onChange({ ...values, phone: e.target.value })} autoComplete="tel" placeholder="+252 …" maxLength={30} />
      </label>
      <fieldset className="xp-field xp-field-row">
        <legend>Birthday <em>optional · month and day only</em></legend>
        <select aria-label="Birthday month" value={month} onChange={(e) => setBirthday(e.target.value, day || "01")}>
          <option value="">Month</option>
          {months.map((name, index) => <option key={name} value={String(index + 1).padStart(2, "0")}>{name}</option>)}
        </select>
        <select aria-label="Birthday day" value={day} onChange={(e) => setBirthday(month || "01", e.target.value)}>
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")).map((d) => <option key={d} value={d}>{Number(d)}</option>)}
        </select>
      </fieldset>
      <label className="xp-field">
        <span>Your usual <em>optional</em></span>
        <select value={values.favouriteDrink} onChange={(e) => onChange({ ...values, favouriteDrink: e.target.value })}>
          <option value="">Not sure yet</option>
          {drinks.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label className="xp-check">
        <input type="checkbox" checked={values.marketingOptIn} onChange={(e) => onChange({ ...values, marketingOptIn: e.target.checked })} />
        <span>Email me Daymark news: new drinks and café updates. Unsubscribe anytime.</span>
      </label>
    </>
  );
}

export function JoinForm({ drinks }: { drinks: string[] }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [profile, setProfile] = useState<ProfileValues>({ fullName: "", phone: "", birthday: "", favouriteDrink: "", marketingOptIn: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await send("/api/account/join", "POST", { email, password, privacyAccepted, ...profile });
      if (result.status === "signed-in") window.location.assign("/account");
      else setSentTo(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <div className="xp-auth-done" role="status">
        <p className="xp-label">One last step</p>
        <h2>Check your inbox.</h2>
        <p>We sent a confirmation link to <strong>{sentTo}</strong>. Open it to activate your account, then sign in.</p>
        <a className="button button-dark" href="/account/sign-in">Go to sign in <ArrowIcon direction="up-right" /></a>
      </div>
    );
  }

  return (
    <form className="xp-form" onSubmit={submit} noValidate={false}>
      <label className="xp-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={150} />
      </label>
      <label className="xp-field">
        <span>Password <em>at least 8 characters</em></span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={72} />
      </label>
      <ProfileFields values={profile} onChange={setProfile} drinks={drinks} />
      <label className="xp-check">
        <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} required />
        <span>I&rsquo;ve read the <a href="/privacy" target="_blank" rel="noreferrer">privacy notice</a> and agree to Daymark storing these details.</span>
      </label>
      {error && <p className="xp-form-error" role="alert">{error}</p>}
      <button className="button button-dark xp-form-submit" type="submit" disabled={busy}>
        {busy ? "Creating your account…" : <>Join the circle <ArrowIcon direction="up-right" /></>}
      </button>
      <p className="xp-form-alt">Already a member? <a href="/account/sign-in">Sign in</a></p>
    </form>
  );
}

export function SignInForm({ confirmed }: { confirmed: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await send("/api/account/session", "POST", { email, password });
      window.location.assign("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <form className="xp-form" onSubmit={submit}>
      {confirmed && <p className="xp-form-note" role="status">Your email is confirmed. Welcome to the circle. Sign in to continue.</p>}
      <label className="xp-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={150} />
      </label>
      <label className="xp-field">
        <span>Password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required maxLength={72} />
      </label>
      {error && <p className="xp-form-error" role="alert">{error}</p>}
      <button className="button button-dark xp-form-submit" type="submit" disabled={busy}>
        {busy ? "Signing in…" : <>Sign in <ArrowIcon direction="up-right" /></>}
      </button>
      <p className="xp-form-alt"><a href="/account/forgot">Forgot your password?</a></p>
      <p className="xp-form-alt">New here? <a href="/account/join">Join the Daymark Circle</a></p>
    </form>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await send("/api/account/forgot", "POST", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="xp-auth-done" role="status">
        <p className="xp-label">Check your inbox</p>
        <h2>Link on its way.</h2>
        <p>If <strong>{email}</strong> belongs to a Daymark Circle account, we&rsquo;ve emailed a link to choose a new password. It works once and expires soon.</p>
        <a className="xp-link" href="/account/sign-in">Back to sign in <ArrowIcon direction="up-right" /></a>
      </div>
    );
  }

  return (
    <form className="xp-form" onSubmit={submit}>
      <label className="xp-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={150} />
      </label>
      {error && <p className="xp-form-error" role="alert">{error}</p>}
      <button className="button button-dark xp-form-submit" type="submit" disabled={busy}>
        {busy ? "Sending…" : <>Send reset link <ArrowIcon direction="up-right" /></>}
      </button>
      <p className="xp-form-alt">Remembered it? <a href="/account/sign-in">Sign in</a></p>
    </form>
  );
}

/** Reads the recovery token Supabase puts after the "#" in the email link, then sets the new password. */
export function ResetForm() {
  const [token, setToken] = useState<string | null>(null);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    if (accessToken && params.get("type") === "recovery") {
      setToken(accessToken);
      // Drop the token from the address bar and browser history.
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setLinkError(params.get("error_description")?.replace(/\+/g, " ") || "This page needs the link from your password-reset email.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await send("/api/account/reset", "POST", { accessToken: token, newPassword: password });
      window.location.assign("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password.");
      setBusy(false);
    }
  }

  if (linkError) {
    return (
      <div className="xp-auth-done" role="alert">
        <p className="xp-label">Link not valid</p>
        <h2>Let&rsquo;s try that again.</h2>
        <p>{linkError}</p>
        <a className="button button-dark" href="/account/forgot">Request a new link <ArrowIcon direction="up-right" /></a>
      </div>
    );
  }

  return (
    <form className="xp-form" onSubmit={submit}>
      <label className="xp-field">
        <span>New password <em>at least 8 characters</em></span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={72} />
      </label>
      <label className="xp-field">
        <span>Confirm new password</span>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={72} />
      </label>
      {error && <p className="xp-form-error" role="alert">{error}</p>}
      <button className="button button-dark xp-form-submit" type="submit" disabled={busy || !token}>
        {busy ? "Saving…" : <>Save new password <ArrowIcon direction="up-right" /></>}
      </button>
    </form>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await send("/api/account/password", "POST", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setNotice("Password updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="xp-form" onSubmit={submit}>
      <h2 className="xp-form-title">Password</h2>
      <label className="xp-field">
        <span>Current password</span>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required maxLength={72} />
      </label>
      <label className="xp-field">
        <span>New password <em>at least 8 characters</em></span>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={72} />
      </label>
      {notice && <p className="xp-form-note" role="status">{notice}</p>}
      {error && <p className="xp-form-error" role="alert">{error}</p>}
      <div className="xp-form-actions">
        <button className="button button-dark" type="submit" disabled={busy}>{busy ? "Updating…" : "Change password"}</button>
      </div>
    </form>
  );
}

export function AccountPanel({ initial, email, joinedAt, drinks }: { initial: ProfileValues; email: string; joinedAt: string; drinks: string[] }) {
  const [profile, setProfile] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await send("/api/account/profile", "PUT", profile);
      setNotice("Saved. Your details are up to date.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await send("/api/account/session", "DELETE").catch(() => undefined);
    window.location.assign("/");
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await send("/api/account/profile", "DELETE");
      window.location.assign("/?account=deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the account.");
      setBusy(false);
    }
  }

  const memberSince = new Date(joinedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="xp-account">
      <div className="xp-member-card">
        <span className="xp-label">Daymark Circle</span>
        <strong>{profile.fullName || "Member"}</strong>
        <span>{email}</span>
        <small>Member since {memberSince}{profile.favouriteDrink ? ` · Usual: ${profile.favouriteDrink}` : ""}</small>
      </div>

      <form className="xp-form" onSubmit={save}>
        <h2 className="xp-form-title">Your details</h2>
        <ProfileFields values={profile} onChange={setProfile} drinks={drinks} />
        {notice && <p className="xp-form-note" role="status">{notice}</p>}
        {error && <p className="xp-form-error" role="alert">{error}</p>}
        <div className="xp-form-actions">
          <button className="button button-dark" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          <button className="xp-link" type="button" onClick={signOut}>Sign out <ArrowIcon direction="up-right" /></button>
        </div>
      </form>

      <div className="xp-account-block">
        <ChangePasswordForm />
      </div>

      <div className="xp-danger">
        <h2 className="xp-form-title">Delete account</h2>
        <p>This permanently removes your account and the details above. It can&rsquo;t be undone.</p>
        {confirmDelete ? (
          <div className="xp-form-actions">
            <button className="button xp-danger-button" type="button" onClick={remove} disabled={busy}>Yes, delete my account</button>
            <button className="xp-link" type="button" onClick={() => setConfirmDelete(false)}>Keep my account</button>
          </div>
        ) : (
          <button className="xp-link xp-danger-link" type="button" onClick={() => setConfirmDelete(true)}>Delete my account</button>
        )}
      </div>
    </div>
  );
}
