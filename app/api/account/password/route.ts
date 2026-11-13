import { requestIsSameOrigin } from "../../../../lib/admin-auth";
import { allowAttempt, freshAuthClient, getMemberId, setMemberSession } from "../../../../lib/member-auth";
import { getSupabaseAdmin } from "../../../../lib/supabase";

const noStore = { "Cache-Control": "no-store" };

/** Signed-in members change their password after re-entering the current one. */
export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  const userId = await getMemberId();
  if (!userId) return Response.json({ error: "Please sign in again." }, { status: 401, headers: noStore });
  if (!allowAttempt(request, "password")) return Response.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429, headers: noStore });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (newPassword.length < 8 || newPassword.length > 72) throw new Error("Choose a new password between 8 and 72 characters.");

    const admin = getSupabaseAdmin().auth.admin;
    const { data: current } = await admin.getUserById(userId);
    const email = current.user?.email;
    if (!email) throw new Error("We couldn't find your account.");

    // Prove the current password on a throwaway client before changing anything.
    const { error: checkError } = await freshAuthClient().auth.signInWithPassword({ email, password: currentPassword });
    if (checkError) return Response.json({ error: "Your current password didn't match." }, { status: 401, headers: noStore });

    const { error } = await admin.updateUserById(userId, { password: newPassword });
    if (error) throw new Error("We couldn't update your password. Please try again.");
    await setMemberSession(userId);
    return Response.json({ status: "updated" }, { headers: noStore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't update your password.";
    return Response.json({ error: message }, { status: 400, headers: noStore });
  }
}
