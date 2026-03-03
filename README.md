# 🚀 NestJS Starter Pack

A professional, feature-rich NestJS boilerplate designed for scalability and rapid development. This starter pack comes pre-configured with essential tools and integrations to help you jumpstart your backend projects.

---

## Key Features

- **Secure & Scalable**: Pre-configured with Helmet, CSRF protection, and Throttling.
- **Database Ready**: Integrated with **Prisma ORM** for seamless database management.
- **robust Auth**: Complete authentication system using **Passport**, **JWT**, and **Bcrypt**.
- **API Documentation**: Custom Swagger spec generation script and Postman collection support.
- **Email Services**: Built-in support for **SendGrid**, **Resend**, and **Nodemailer**.
- **Cloud Storage**: Ready-to-use integrations for **AWS S3** and **Cloudinary**.
- **Payments**: Fully integrated **Stripe** service for handling transactions and webhooks.
- **Real-time**: **Socket.io** integration for real-time communication.
- **Best Practices**: Pre-configured with **ESLint**, **Prettier**, and strict TypeScript rules.

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **API Spec**: [Swagger / OpenAPI](https://swagger.io/)
- **Payment**: [Stripe](https://stripe.com/)
- **Storage**: [AWS S3](https://aws.amazon.com/s3/), [Cloudinary](https://cloudinary.com/)
- **Notifications**: [Nodemailer](https://www.npmjs.com/package/nodemailer), [SendGrid](https://sendgrid.com/), [Resend](https://resend.com/), [Brevo](https://brevo.com.com/)

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/TheProjectsX/nestjs_starter_pack.git
cd nestjs_starter_pack
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Database Migration

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

---

## 📖 Useful Scripts

| Script                     | Description                                          |
| :------------------------- | :--------------------------------------------------- |
| `npm run dev`              | Starts the application in watch mode.                |
| `npm run build`            | Compiles the TypeScript code to JavaScript.          |
| `npm run lint`             | Runs ESLint to find and fix code style issues.       |
| `npm run generate:swagger` | Builds the app and generates `swagger-spec.json`.    |
| `npm run generate:postman` | Converts the Swagger spec into a Postman collection. |
| `npm run check`            | Runs linting, formatting, and building in one go.    |

---

## Project Structure

```text
src/
├── app/            # Main application module and controller
├── common/         # Global guards, filters, pipes, and decorators
├── config/         # Environment configuration
├── core/           # Core services (Stripe, S3, Email, etc.)
├── modules/        # Feature modules (Auth, Profile, etc.)
└── main.ts         # Application entry point
```

---

## Support

Created and maintained by **TheProjectsX**.
