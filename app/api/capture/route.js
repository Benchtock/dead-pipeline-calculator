// File location in your project: app/api/capture/route.js
// This is a Next.js App Router API route.
// It receives the form submission from the calculator and
// forwards it to your n8n webhook (or any other backend).

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate email exists
    if (!body.email || !body.email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    // Forward to your n8n webhook
    // Set WEBHOOK_URL in your Vercel environment variables
    const webhookUrl = process.env.WEBHOOK_URL;

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          received_at: new Date().toISOString(),
        }),
      });
    }

    // Optional: also log to console for Vercel function logs
    console.log("New calculator lead:", body.email, body.conservative_recovery);

    return Response.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("Capture error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
