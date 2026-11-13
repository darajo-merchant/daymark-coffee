import { requestIsSameOrigin } from "../../../../lib/admin-auth";
import {
  allowAttempt,
  cleanEmail,
  cleanProfileInput,
  freshAuthClient,
  membersAvailable,
  metadataFromProfile,
  setMemberSession,
  siteUrl,
} from "../../../../lib/member-auth";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  if (!membersAvailable()) return Response.json({ error: "Member accounts aren't switched on yet." }, { status: 503, headers: noStore });
  if (!allowAttempt(request, "join", 6)) return Response.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429, headers: noStore });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = cleanEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 8 || password.length > 72) throw new Error("Choose a password between 8 and 72 characters.");
    if (body.privacyAccepted !== true) throw new Error("Please accept the privacy notice to create an account.");
    const profile = cleanProfileInput(body);

    const { data, error } = await freshAuthClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl()}/account/sign-in?confirmed=1`,
        data: { ...metadataFromProfile(profile), privacy_accepted_at: new Date().toISOString() },
      },
    });
    if (error) {
      const message = /already registered|already exists/i.test(error.message)
        ? "An account with this email already exists. Try signing in instead."
        : /rate limit/i.test(error.message)
          ? "We're sending too many emails right now. Please try again in a little while."
          : "We couldn't create your account. Please check your details and try again.";
      return Response.json({ error: message }, { status: 400, headers: noStore });
    }

    // If the project doesn't require email confirmation, Supabase signs the user in straight away.
    if (data.session && data.user) {
      await setMemberSession(data.user.id);
      return Response.json({ status: "signed-in" }, { headers: noStore });
    }
    return Response.json({ status: "confirm-email" }, { headers: noStore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't create your account.";
    return Response.json({ error: message }, { status: 400, headers: noStore });
  }
}
