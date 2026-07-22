import { changePasswordFormAction, updateEmailFormAction } from "@/app/actions/auth";
import { updateProfileAction } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Profile" };

export default async function ProfileSettingsPage() {
  const context = await requireUser("/settings/profile");
  const prefs = context.profile?.notification_preferences as { email?: boolean; in_app?: boolean; marketing?: boolean } | null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Card><CardHeader><CardTitle>User profile</CardTitle></CardHeader><CardContent><form action={updateProfileAction} className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Full name<Input defaultValue={context.profile?.full_name ?? ""} name="fullName" required /></label><label className="grid gap-2 text-sm font-medium">Avatar URL<Input defaultValue={context.profile?.avatar_url ?? ""} name="avatarUrl" type="url" /></label><label className="grid gap-2 text-sm font-medium">Phone<Input defaultValue={context.profile?.phone ?? ""} name="phone" /></label><label className="grid gap-2 text-sm font-medium">Designation<Input defaultValue={context.profile?.designation ?? ""} name="designation" /></label><label className="grid gap-2 text-sm font-medium">Department<Input defaultValue={context.profile?.department ?? ""} name="department" /></label><label className="grid gap-2 text-sm font-medium">Skills<Input defaultValue={context.profile?.skills?.join(", ") ?? ""} name="skills" /></label><label className="grid gap-2 text-sm font-medium">Language<Input defaultValue={context.profile?.language ?? "en"} name="language" /></label><label className="grid gap-2 text-sm font-medium">Timezone<Input defaultValue={context.profile?.timezone ?? "UTC"} name="timezone" /></label><label className="grid gap-2 text-sm font-medium md:col-span-2">Bio<Input defaultValue={context.profile?.bio ?? ""} name="bio" /></label><div className="flex flex-wrap gap-4 text-sm md:col-span-2"><label className="flex items-center gap-2"><input defaultChecked={prefs?.email ?? true} name="notifyEmail" type="checkbox" />Email alerts</label><label className="flex items-center gap-2"><input defaultChecked={prefs?.in_app ?? true} name="notifyInApp" type="checkbox" />In-app alerts</label><label className="flex items-center gap-2"><input defaultChecked={prefs?.marketing ?? false} name="notifyMarketing" type="checkbox" />Marketing emails</label></div><Button className="md:col-span-2" type="submit">Save profile</Button></form></CardContent></Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Update email</CardTitle></CardHeader><CardContent><form action={updateEmailFormAction} className="space-y-4"><label className="grid gap-2 text-sm font-medium">New email<Input defaultValue={context.user.email ?? ""} name="email" type="email" /></label><Button type="submit" variant="outline">Send confirmation</Button></form></CardContent></Card>
        <Card><CardHeader><CardTitle>Change password</CardTitle></CardHeader><CardContent><form action={changePasswordFormAction} className="space-y-4"><label className="grid gap-2 text-sm font-medium">Current password<Input name="currentPassword" type="password" /></label><label className="grid gap-2 text-sm font-medium">New password<Input minLength={12} name="password" type="password" /></label><Button type="submit" variant="outline">Change password</Button></form></CardContent></Card>
      </div>
    </div>
  );
}
