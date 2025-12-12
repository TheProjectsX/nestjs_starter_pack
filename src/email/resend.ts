import { Resend } from "resend";

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  sender?: string;           // Optional custom sender
  to: string | string[];     // Single or multiple recipients
  subject: string;           // Email subject
  template: string;          // HTML template
}

export const sendEmail = async ({
  sender,
  to,
  subject,
  template,
}: SendEmailParams) => {
  try {
    // Use default sender for dev mode if no sender provided
    const fromAddress = sender || "onboarding@resend.dev";

    // Ensure recipients array
    const recipients = Array.isArray(to) ? to : [to];

    // Send email
    const data = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject,
      html: template,
    });

    return {
      success: true,
      message: "Email sent successfully",
      data,
    };
  } catch (error: any) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      message: "Email sending failed",
      error: error.message || error,
    };
  }
};
