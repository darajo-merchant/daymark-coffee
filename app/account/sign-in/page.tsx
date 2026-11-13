import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountUnavailable } from "../unavailable";
import { AuthShell } from "../../components/auth-shell";
import { SignInForm } from "../../components/account-forms";
import { hasLiveMemberSession, membersAvailable } from "../../../lib/member-auth";

export const metadata: Metadata = {
  title: "Sign in | Daymark Coffee",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ confirmed?: string }> }) {
  if (await hasLiveMemberSession()) redirect("/account");
  const { confirmed } = await searchParams;

  return (
    <AuthShell
      kicker="Welcome back"
      title={<>Good to see {" "}<br />you <em>again.</em></>}
      intro={<p>Sign in to your Daymark Circle account.</p>}
      image="/images/pages/visit-hero.webp"
      imageAlt="A coffee on a small table by a café window"
      quote={<>Your usual {" "}<br /><em>is waiting.</em></>}
    >
      {membersAvailable() ? <SignInForm confirmed={confirmed === "1"} /> : <AccountUnavailable />}
    </AuthShell>
  );
}
