import { z } from "zod";

const passwordRules = z.string()
  .min(12, "Use at least 12 characters.")
  .regex(/[a-z]/, "Add a lowercase letter.")
  .regex(/[A-Z]/, "Add an uppercase letter.")
  .regex(/[0-9]/, "Add a number.")
  .regex(/[^A-Za-z0-9]/, "Add a symbol.");

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.coerce.boolean().optional().default(true),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Enter your full name."),
  password: passwordRules,
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const resetPasswordSchema = z.object({
  password: passwordRules,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  password: passwordRules,
});

export const updateEmailSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
