import { requestIsSameOrigin } from "../../../../lib/admin-auth";
import { allowAttempt, freshAuthClient, setMemberSession } from "../../../../lib/member-auth";
import { getSupabaseAdmin } from "../../../../lib/supabase";

const noStore = { "Cache-Control": "no-store" };

/**
 * Finishes a password reset. The browser posts the recovery token from the
 * email link; Supabase confirms it belongs to a real user before we set the
 * new password and sign them in.
 */
export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  if (!allowAttempt(request, "reset")) return Response.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429, headers: noStore });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (!accessToken) throw new Error("This reset link is incomplete. Please request a new one.");
    if (newPassword.length < 8 || newPassword.length > 72) throw new Error("Choose a password between 8 and 72 characters.");

    const { data, error } = await freshAuthClient().auth.getUser(accessToken);
    if (error || !data.user) return Response.json({ error: "This reset link has expired. Please request a new one." }, { status: 401, headers: noStore });

    const { error: updateError } = await getSupabaseAdmin().auth.admin.updateUserById(data.user.id, { password: newPassword });
    if (updateError) throw new Error("We couldn't update your password. Please try again.");
    await setMemberSession(data.user.id);
    return Response.json({ status: "updated" }, { headers: noStore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't reset your password.";
    return Response.json({ error: message }, { status: 400, headers: noStore });
  }
}
