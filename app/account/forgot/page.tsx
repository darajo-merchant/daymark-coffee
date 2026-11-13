import type { Metadata } from "next";
import { AccountUnavailable } from "../unavailable";
import { AuthShell } from "../../components/auth-shell";
import { ForgotForm } from "../../components/account-forms";
import { membersAvailable } from "../../../lib/member-auth";

export const metadata: Metadata = {
  title: "Reset your password | Daymark Coffee",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ForgotPage() {
  return (
    <AuthShell
      kicker="Password help"
      title={<>It happens {" "}<br />to <em>everyone.</em></>}
      intro={<p>Enter the email you joined with and we&rsquo;ll send a link to choose a new password.</p>}
      image="/images/pages/drink-flat-white.webp"
      imageAlt="A flat white with rosetta latte art"
      quote={<>One sip {" "}<br /><em>at a time.</em></>}
    >
      {membersAvailable() ? <ForgotForm /> : <AccountUnavailable />}
    </AuthShell>
  );
}
