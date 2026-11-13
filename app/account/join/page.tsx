import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountUnavailable } from "../unavailable";
import { AuthShell } from "../../components/auth-shell";
import { JoinForm } from "../../components/account-forms";
import { hasLiveMemberSession, membersAvailable } from "../../../lib/member-auth";
import { getSiteContent } from "../../../lib/site-content";

export const metadata: Metadata = {
  title: "Join the Daymark Circle | Daymark Coffee",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  if (await hasLiveMemberSession()) redirect("/account");
  const { menu } = await getSiteContent();

  return (
    <AuthShell
      kicker="The Daymark Circle"
      title={<>Pull up {" "}<br />a <em>chair.</em></>}
      intro={<p>A free account for regulars. Be first to hear about new drinks and café news, and keep your usual on file.</p>}
      image="/images/pages/drink-cappuccino.webp"
      imageAlt="A cappuccino with leaf latte art"
      quote={<>Good coffee, {" "}<br /><em>no rush.</em></>}
    >
      {membersAvailable() ? <JoinForm drinks={menu.map((item) => item.name).filter(Boolean)} /> : <AccountUnavailable />}
    </AuthShell>
  );
}
