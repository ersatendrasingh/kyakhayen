"use server";

import { render } from "@react-email/render";

import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verificiation-token";
import { sendEmail } from "@/lib/mail";
import EmailVerifiedMail from "@/emails/email-verified-mail";

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });
  await sendEmail({
    to: existingUser.email as string,
    subject:
      "🎉 Congratulations " + existingUser.name + ", Your Email is Verified!✅",
    html: render(
      EmailVerifiedMail({
        name: existingUser.name as string,
      })
    ),
  });
  return { success: "Email verified!" };
};
