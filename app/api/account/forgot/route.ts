import { requestIsSameOrigin } from "../../../../lib/admin-auth";
import { allowAttempt, cleanEmail, freshAuthClient, membersAvailable, siteUrl } from "../../../../lib/member-auth";

const noStore = { "Cache-Control": "no-store" };

/**
 * Sends a password-reset link. The reply is the same whether or not the email
 * belongs to a member, so this can't be used to discover who has an account.
 */
export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  if (!membersAvailable()) return Response.json({ error: "Member accounts aren't switched on yet." }, { status: 503, headers: noStore });
  if (!allowAttempt(request, "forgot", 5)) return Response.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429, headers: noStore });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = cleanEmail(body.email);
    await freshAuthClient().auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/account/reset` });
  } catch (error) {
    if (error instanceof Error && /valid email/i.test(error.message)) {
      return Response.json({ error: error.message }, { status: 400, headers: noStore });
    }
  }
  return Response.json({ status: "sent" }, { headers: noStore });
}
