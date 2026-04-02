import nodemailEmailSender from "./nodemailer";

export interface EmailOptions {
    email: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendEmail = async ({ email, subject, html }: EmailOptions) => {
    try {
        
        return nodemailEmailSender({ email, subject, html });
    } catch (error) {
        console.log("Email Send Failed: ", error?.message)
    }

    // Implementation for sending email (e.g., using Nodemailer, AWS SES, or SendGrid)
    // await transporter.sendMail(mailOptions);
};
