import { redirect } from "next/navigation";

export default function SettingsInviteRedirectPage() {
  redirect("/settings/users");
}
