import type { Metadata } from "next";
import { AuthShell } from "../../components/auth-shell";
import { ResetForm } from "../../components/account-forms";

export const metadata: Metadata = {
  title: "Choose a new password | Daymark Coffee",
  robots: { index: false, follow: false },
  // The recovery token arrives in the URL fragment; never leak this page's URL to other sites.
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default function ResetPage() {
  return (
    <AuthShell
      kicker="Password help"
      title={<>Choose a new {" "}<br /><em>password.</em></>}
      intro={<p>Pick something you&rsquo;ll remember. You&rsquo;ll be signed in straight after.</p>}
      image="/images/pages/drink-flat-white.webp"
      imageAlt="A flat white with rosetta latte art"
      quote={<>Back to {" "}<br /><em>your usual.</em></>}
    >
      <ResetForm />
    </AuthShell>
  );
}
