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

export const careerFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({
    message: "Billing Email is required",
  }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number is required" })
    .max(12, { message: "Phone number must be maximum 12 digits" })
    .regex(/^\d{10,12}$/, { message: "Invalid phone number" }),
  qualification: z
    .string()
    .min(1, { message: "Your Qualification is required" }),
  positionApplied: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1, { message: "Zip Code is required" }),
  bio: z.string().min(1, { message: "Your bio is required" }),
  resumeFile: z.any(),
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
  qualification: z
    .string()
    .min(1, { message: "Your Qualification is required" }),
  profession: z.string().min(1, { message: "Your Profession is required" }),
  bio: z.string().min(1, { message: "Your bio is required" }),
});

export const checkoutSchema = z.object({
  billing_firstName: z.string().min(1, { message: "First Name is required" }),
  billing_lastName: z.string().min(1, { message: "Last Name is required" }),
  billing_email: z.string().email({
    message: "Billing Email is required",
  }),
  billing_phoneNumber: z
    .string()
    .min(10, { message: "Phone number is required" })
    .max(12, { message: "Phone number must be maximum 12 digits" })
    .regex(/^\d{10,12}$/, { message: "Invalid phone number" }),
  billing_address: z.string().min(1, { message: "Address is required" }),
  billing_country: z.string().min(1),
  billing_city: z.string().min(1),
  billing_state: z.string().min(1),
  billing_zip: z.string().min(1, { message: "Zip Code is required" }),
  shipping_firstName: z.string().min(1, { message: "First Name is required" }),
  shipping_lastName: z.string().min(1, { message: "Last Name is required" }),
  shipping_email: z.string().email({
    message: "Email is required",
  }),
  shipping_phoneNumber: z
    .string()
    .min(10, { message: "Phone number is required" })
    .max(12, { message: "Phone number must be maximum 12 digits" })
    .regex(/^\d{10,12}$/, { message: "Invalid phone number" }),
  shipping_address: z.string().min(1, { message: "Address is required" }),
  shipping_country: z.string().min(1),
  shipping_city: z.string().min(1),
  shipping_state: z.string().min(1),
  shipping_zip: z.string().min(1, { message: "Zip Code is required" }),
});

export const billingSchema = z.object({
  billing_firstName: z.string().min(1, { message: "First Name is required" }),
  billing_lastName: z.string().min(1, { message: "Last Name is required" }),
  billing_email: z.string().email({
    message: "Billing Email is required",
  }),
  billing_phoneNumber: z
    .string()
    .min(10, { message: "Phone number is required" })
    .max(12, { message: "Phone number must be maximum 12 digits" })
    .regex(/^\d{10,12}$/, { message: "Invalid phone number" }),
  billing_address: z.string().min(1, { message: "Address is required" }),
  billing_country: z.string().min(1),
  billing_city: z.string().min(1),
  billing_state: z.string().min(1),
  billing_zip: z.string().min(1, { message: "Zip Code is required" }),
});

export const couponSchema = z.object({
  couponCode: z.string().min(1, { message: "Coupon code is required" }),
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
