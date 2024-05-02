"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail, getUserByPhone } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

//import { generateVerificationToken } from "@/lib/tokens";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, phoneNumber } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUserByEmail = await getUserByEmail(email);
  const existingUserByPhone = await getUserByPhone(phoneNumber);

  if (existingUserByEmail) {
    return { error: "Email already in use!" };
  }

  if (existingUserByPhone) {
    return { error: "Phone number already in use!" };
  }

  await db.user.create({
    data: {
      name,
      phoneNumber,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation email sent!" };
};
