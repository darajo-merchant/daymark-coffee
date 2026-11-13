import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "../components/auth-shell";
import { AccountPanel } from "../components/account-forms";
import { getMemberId, getMemberProfile } from "../../lib/member-auth";
import { getSiteContent } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Your account | Daymark Coffee",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getMemberId();
  if (!userId) redirect("/account/sign-in");
  const profile = await getMemberProfile(userId);
  // The account was deleted elsewhere; the stale cookie is cleared on the next sign-in.
  if (!profile) redirect("/account/sign-in");
  const { menu } = await getSiteContent();
  const firstName = profile.fullName.split(" ")[0] || "friend";

  return (
    <AuthShell
      kicker="Your account"
      title={<>Welcome, {" "}<br /><em>{firstName}.</em></>}
      intro={<p>Keep your details current and choose what you&rsquo;d like to hear from us.</p>}
      image="/images/pages/about-hero.webp"
      imageAlt="A barista's hands at the espresso machine"
      quote={<>See you for {" "}<br /><em>the next cup.</em></>}
    >
      <AccountPanel
        initial={{
          fullName: profile.fullName,
          phone: profile.phone,
          birthday: profile.birthday,
          favouriteDrink: profile.favouriteDrink,
          marketingOptIn: profile.marketingOptIn,
        }}
        email={profile.email}
        joinedAt={profile.joinedAt}
        drinks={menu.map((item) => item.name).filter(Boolean)}
      />
    </AuthShell>
  );
}
