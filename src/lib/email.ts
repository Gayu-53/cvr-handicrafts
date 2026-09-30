import { Resend } from "resend";

/**
 * Sends the client a notification email after a payment is successfully
 * verified server-side. This is intentionally isolated and defensive:
 * a failure here must NEVER cause an otherwise-successful payment to be
 * treated as failed, so every call site wraps this in try/catch and ignores
 * the outcome for the purposes of the payment flow.
 */
export async function sendOrderConfirmationEmail(params: {
  orderNumber: string;
  total: number;
  customerName: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.CLIENT_NOTIFICATION_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    console.warn(
      "Email notification skipped: RESEND_API_KEY, RESEND_FROM_EMAIL, or CLIENT_NOTIFICATION_EMAIL is not configured."
    );
    return { sent: false, error: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Paid Order — ${params.orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2f2015;">Payment Received</h2>
          <p>A new order has been paid for successfully on CVR Handicrafts.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 0; color: #6b4a2a; font-weight: bold;">Order Number</td>
              <td style="padding: 8px 0;">${params.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b4a2a; font-weight: bold;">Customer</td>
              <td style="padding: 8px 0;">${params.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b4a2a; font-weight: bold;">Total</td>
              <td style="padding: 8px 0;">₹${params.total.toLocaleString("en-IN")}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #8a5f34; font-size: 13px;">
            Log in to the admin panel to view full order details and update its status.
          </p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
    return { sent: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}
