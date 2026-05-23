type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async (data: EmailPayload) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;
  const fromName = process.env.EMAIL_FROM_NAME || "Kya Khayen";

  if (!apiKey || !fromEmail) {
    throw new Error(
      "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM_ADDRESS."
    );
  }

  if (!data.to?.trim()) {
    throw new Error("Email recipient is not configured. Set ADMIN_EMAIL where required.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      ...data,
    }),
  });

  if (!response.ok) {
    const reason = await response.text();
    throw new Error(`Email delivery failed: ${reason}`);
  }

  return response.json();
};
