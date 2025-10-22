import * as nodemailer from 'nodemailer';
import * as handlebars from 'nodemailer-handlebars';
import { join } from 'path';
import { existsSync } from 'fs';

// Detect whether running from "dist" or "src"
const templatesPath = existsSync(join(__dirname, 'templates'))
  ? join(__dirname, 'templates') // when running from dist
  : join(process.cwd(), 'src', 'email', 'templates'); // when running in dev (start:dev)

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.use(
  'compile',
  handlebars({
    viewEngine: {
      extname: '.hbs',
      defaultLayout: false,
      partialsDir: templatesPath,
    },
    viewPath: templatesPath,
    extName: '.hbs',
  }),
);

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    template: 'verification',
    context: { code },
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Verification email sent to ${email}`);
}
