import nodemailer from "nodemailer";
import config from "@/config";
import { ApiError } from "@/utils/api_error";

const transporter = nodemailer.createTransport({
    // For Gmail
    service: "gmail",
    // For other service
    // host: config.smtp.host,
    // port: config.smtp.port,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

const emailSender = async ({
    email,
    subject,
    html,
}: {
    email: string;
    subject: string;
    html: string;
}) => {
    const mailOptions = {
        from: `"${config.company_name}" <${config.smtp.sender}>`,
        to: email,
        subject,
        html,
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "Error sending email");
    }
};

export default emailSender;
