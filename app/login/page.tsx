import { redirect } from "next/navigation";

export default function LoginPage() {
  // Landing now contains the login UI — keep the old /login route pointing to the root
  redirect("/");
}
