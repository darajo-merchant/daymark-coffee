import { changeAdminPassword, isAdminAuthenticated, requestIsSameOrigin, setAdminSession } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403 });
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
      return Response.json({ error: "Enter your current password and a new password." }, { status: 400 });
    }
    if (!(await changeAdminPassword(body.currentPassword, body.newPassword))) {
      return Response.json({ error: "Your current password did not match." }, { status: 401 });
    }
    await setAdminSession();
    return Response.json({ changed: true, message: "Password updated." }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the password.";
    return Response.json({ error: message }, { status: 400 });
  }
}
