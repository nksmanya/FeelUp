import Image from "next/image";
import Link from "next/link";
import Logo from "../components/Logo";
import HeroStack from "../components/HeroStack";
import ClientAuthCard from "../components/ClientAuthCard";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white dark:from-black dark:to-gray-900">
      <div className="flex w-full max-w-6xl items-center gap-12 px-6 py-16">
        {/* Left: visual / hero */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          {/* client-side rotating hero stack */}
          <HeroStack />
        </div>

        {/* Right: auth card (landing is the login) */}
        <div className="w-full max-w-md md:w-1/2">
          <ClientAuthCard />
        </div>
      </div>
    </div>
  );
}
