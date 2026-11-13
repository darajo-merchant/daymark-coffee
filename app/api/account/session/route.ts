import { requestIsSameOrigin } from "../../../../lib/admin-auth";
import { allowAttempt, cleanEmail, clearMemberSession, freshAuthClient, membersAvailable, setMemberSession } from "../../../../lib/member-auth";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  if (!membersAvailable()) return Response.json({ error: "Member accounts aren't switched on yet." }, { status: 503, headers: noStore });
  if (!allowAttempt(request, "sign-in")) return Response.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429, headers: noStore });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = cleanEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    if (!password) throw new Error("Please enter your password.");

    const { data, error } = await freshAuthClient().auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      const message = error && /not confirmed/i.test(error.message)
        ? "Please confirm your email first. Check your inbox for the link we sent."
        : "That email and password didn't match.";
      return Response.json({ error: message }, { status: 401, headers: noStore });
    }
    await setMemberSession(data.user.id);
    return Response.json({ status: "signed-in" }, { headers: noStore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not sign in.";
    return Response.json({ error: message }, { status: 400, headers: noStore });
  }
}

export async function DELETE(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  await clearMemberSession();
  return Response.json({ status: "signed-out" }, { headers: noStore });
}
