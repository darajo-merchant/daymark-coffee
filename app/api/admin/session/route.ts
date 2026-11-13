import { checkAdminPassword, clearAdminSession, initializeAdminPassword, isAdminAuthenticated, isAdminConfigured, requestIsSameOrigin, setAdminSession } from "../../../../lib/admin-auth";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  return Response.json({ configured: await isAdminConfigured(), authenticated: await isAdminAuthenticated() }, { headers: noStore });
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  if (!(await isAdminConfigured())) return Response.json({ error: "Admin access is not configured on this server yet." }, { status: 503, headers: noStore });
  try {
    const body = await request.json();
    if (typeof body.password !== "string" || !(await checkAdminPassword(body.password))) {
      return Response.json({ error: "That password did not match." }, { status: 401, headers: noStore });
    }
    await initializeAdminPassword(body.password);
    await setAdminSession();
    return Response.json({ authenticated: true }, { headers: noStore });
  } catch {
    return Response.json({ error: "Could not sign in. Please try again." }, { status: 400, headers: noStore });
  }
}

export async function DELETE(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  await clearAdminSession();
  return Response.json({ authenticated: false }, { headers: noStore });
}
