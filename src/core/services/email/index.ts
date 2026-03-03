import nodemailEmailSender from "./nodemailer";

export interface EmailOptions {
    email: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async ({ email, subject, html }: EmailOptions) => {
    return nodemailEmailSender({ email, subject, html });

    // Implementation for sending email (e.g., using Nodemailer, AWS SES, or SendGrid)
    // await transporter.sendMail(mailOptions);
};
