/** Shown on the member pages when Supabase isn't configured on this server. */
export function AccountUnavailable() {
  return (
    <div className="xp-auth-done" role="status">
      <p className="xp-label">Coming soon</p>
      <h2>Member accounts aren&rsquo;t open yet.</h2>
      <p>Please check back soon, or visit us in person in the meantime.</p>
    </div>
  );
}
