"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, Bell, PlusSquare, User, LogOut } from "lucide-react";

export default function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="hidden md:flex items-center justify-end gap-3 px-4 py-2">
      <div className="flex items-center gap-2">
        <Link href="/messages" className="relative p-2 rounded-lg hover:bg-gray-100">
          <MessageCircle className="w-5 h-5 text-[var(--text-muted)]" />
          <span className="sr-only">Messages</span>
        </Link>

        <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-[var(--text-muted)]" />
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none text-white bg-red-500 rounded-full">3</span>
          <span className="sr-only">Notifications</span>
        </Link>

        <Link href="/create" className="p-2 rounded-lg bg-[var(--brand-blue)] text-white hover:brightness-95">
          <PlusSquare className="w-5 h-5" />
          <span className="sr-only">Create</span>
        </Link>

        <Link href="/profile" className="p-2 rounded-lg hover:bg-gray-100">
          <User className="w-5 h-5 text-[var(--text-muted)]" />
          <span className="sr-only">Profile</span>
        </Link>
      </div>
    </div>
  );
}
