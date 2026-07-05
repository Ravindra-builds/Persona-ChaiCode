import nodemailer from "nodemailer";

interface SendOtpEmailResult {
  success: boolean;
  message: string;
}

function getTransport() {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpEmail(to: string, code: string): Promise<SendOtpEmailResult> {
  const transport = getTransport();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@dualmentor.local";

  if (!transport) {
    console.info(`[OTP] Email delivery is not configured. Sending OTP to console for ${to}: ${code}`);
    return {
      success: false,
      message: "Email credentials are not configured, so the OTP was logged to the server console.",
    };
  }

  try {
    await transport.sendMail({
      from,
      to,
      subject: "Your DualMentor verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });

    return {
      success: true,
      message: "OTP sent to your email.",
    };
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    console.info(`[OTP] Falling back to console output for ${to}: ${code}`);
    return {
      success: false,
      message: "OTP email could not be delivered, so the code was logged to the server console.",
    };
  }
}
