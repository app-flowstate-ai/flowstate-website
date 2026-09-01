// Cloudflare Pages Function — handles POST /subscribe
//
// This runs server-side on Cloudflare's edge, NOT in the browser, so it's the
// right place to hold the EmailOctopus API key. Never put the key in
// script.js or anywhere client-side — anyone could read it in DevTools.
//
// Setup:
// 1. In the Cloudflare Pages dashboard → your project → Settings →
//    Environment variables, add:
//      EMAILOCTOPUS_API_KEY  = your real API key
//      EMAILOCTOPUS_LIST_ID  = your list's ID
// 2. Redeploy after adding them — env vars only apply to new deployments.
//
// Double check the exact request field names against EmailOctopus's current
// API docs (emailoctopus.com/api-documentation) before going live — this is
// written against their general v2 create-contact shape but wasn't verified
// against a live account.

interface Env {
  EMAILOCTOPUS_API_KEY: string;
  EMAILOCTOPUS_LIST_ID: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let email: string;
  try {
    const body = await request.json<{ email?: string }>();
    email = (body.email || "").trim();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return json({ error: "Invalid email address" }, 400);
  }

  if (!env.EMAILOCTOPUS_API_KEY || !env.EMAILOCTOPUS_LIST_ID) {
    return json({ error: "Server not configured" }, 500);
  }

  try {
    const res = await fetch(
      `https://api.emailoctopus.com/lists/${env.EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.EMAILOCTOPUS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "SUBSCRIBED",
        }),
      },
    );

    // EmailOctopus returns 409-style duplicate errors if the email is
    // already on the list — treat that as a success from the user's side,
    // they're already waitlisted either way.
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error('EmailOctopus error', res.status, JSON.stringify(errBody))
      
      const isDuplicate = JSON.stringify(errBody)
        .toLowerCase()
        .includes("already");
      if (!isDuplicate) {
        return json({ error: "Could not add to waitlist" }, 502);
      }
    }

    return json({ success: true });
  } catch {
    return json({ error: "Could not reach waitlist provider" }, 502);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
