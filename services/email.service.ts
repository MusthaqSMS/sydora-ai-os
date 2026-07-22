export type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function template(title: string, body: string, ctaLabel: string, ctaUrl: string): EmailTemplate {
  const safeTitle = escapeHtml(title);
  const safeBody = escapeHtml(body);
  const safeCtaLabel = escapeHtml(ctaLabel);
  const safeCtaUrl = escapeHtml(ctaUrl);
  return {
    subject: title,
    text: `${body}\n\n${ctaLabel}: ${ctaUrl}`,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827"><h1 style="font-size:20px">${safeTitle}</h1><p>${safeBody}</p><p><a href="${safeCtaUrl}" style="display:inline-block;background:#111827;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">${safeCtaLabel}</a></p></div>`,
  };
}

export function welcomeEmail(name: string, dashboardUrl: string) {
  return template("Welcome to Sydora AI OS", `Hi ${name}, your workspace foundation is ready.`, "Open workspace", dashboardUrl);
}

export function invitationEmail(organizationName: string, inviteUrl: string) {
  return template(`Invitation to ${organizationName}`, `You have been invited to join ${organizationName} on Sydora AI OS.`, "Accept invitation", inviteUrl);
}

export function resetPasswordEmail(resetUrl: string) {
  return template("Reset your Sydora password", "Use this secure link to choose a new password.", "Reset password", resetUrl);
}

export function verificationEmail(verificationUrl: string) {
  return template("Verify your Sydora account", "Confirm your email address to activate your account.", "Verify email", verificationUrl);
}

export const organizationInvitationEmail = invitationEmail;
