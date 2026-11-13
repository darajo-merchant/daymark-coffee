import { requestIsSameOrigin } from "../../../../lib/admin-auth";
import { cleanProfileInput, clearMemberSession, getMemberId, metadataFromProfile, profileFromUser } from "../../../../lib/member-auth";
import { getSupabaseAdmin } from "../../../../lib/supabase";

const noStore = { "Cache-Control": "no-store" };

export async function PUT(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  const userId = await getMemberId();
  if (!userId) return Response.json({ error: "Please sign in again." }, { status: 401, headers: noStore });

  try {
    const profile = cleanProfileInput((await request.json()) as Record<string, unknown>);
    const admin = getSupabaseAdmin().auth.admin;
    const { data: current, error: readError } = await admin.getUserById(userId);
    if (readError || !current.user) throw new Error("We couldn't find your account.");
    // Merge so fields we don't edit here (e.g. privacy_accepted_at) are kept.
    const { data, error } = await admin.updateUserById(userId, {
      user_metadata: { ...(current.user.user_metadata ?? {}), ...metadataFromProfile(profile) },
    });
    if (error || !data.user) throw new Error("We couldn't save your details. Please try again.");
    return Response.json({ profile: profileFromUser(data.user) }, { headers: noStore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't save your details.";
    return Response.json({ error: message }, { status: 400, headers: noStore });
  }
}

export async function DELETE(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  const userId = await getMemberId();
  if (!userId) return Response.json({ error: "Please sign in again." }, { status: 401, headers: noStore });

  const { error } = await getSupabaseAdmin().auth.admin.deleteUser(userId);
  if (error) return Response.json({ error: "We couldn't delete your account. Please try again." }, { status: 500, headers: noStore });
  await clearMemberSession();
  return Response.json({ status: "deleted" }, { headers: noStore });
}
