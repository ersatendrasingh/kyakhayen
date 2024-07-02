import * as z from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  confirmPassword: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
});

export const userProfileSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  email: z.string().email({
    message: "Billing Email is required",
  }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number is required" })
    .max(12, { message: "Phone number must be maximum 12 digits" })
    .regex(/^\d{10,12}$/, { message: "Invalid phone number" }),
  bio: z.string().min(1, { message: "Your bio is required" }),
});

export const userHeightWeight = z.object({
  heightFt: z.string().min(1).max(7),
  heightInch: z.string().min(1).max(11),
  heightCm: z.string().min(1).max(210),
  weightKg: z.string().min(1).max(180),
  weightLbs: z.string().min(1).max(397),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email({
    message: "Email is required",
  }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number is required" })
    .max(12, { message: "Phone number must be maximum 12 digits" })
    .regex(/^\d{10,12}$/, { message: "Invalid phone number" }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
});

export const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({
    message: "Billing Email is required",
  }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number is required" })
    .max(12, { message: "Phone number must be maximum 12 digits" })
    .regex(/^\d{10,12}$/, { message: "Invalid phone number" }),
  country: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  query: z.string().min(1, { message: "Your bio is required" }),
});

export const commentFormSchema = z.object({
  comment: z.string().min(10).max(500),
});
