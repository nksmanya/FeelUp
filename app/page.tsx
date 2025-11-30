import Image from "next/image";
import Link from "next/link";
import Logo from "../components/Logo";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white dark:from-black dark:to-gray-900">
      <div className="flex w-full max-w-6xl items-center gap-12 px-6 py-16">
        {/* Left: visual / hero */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <Image
              src="/log.png"
              alt="FeelUp logo big"
              width={420}
              height={420}
              className="rounded-2xl shadow-lg"
              priority
            />
            <div className="mt-4 rounded-md px-3 py-2 text-sm text-[var(--feelup-muted)] text-center">
              Share feelings. Get listened to.
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="w-full max-w-md md:w-1/2">
          <div className="mx-auto w-full rounded-[var(--radius-md)] bg-white p-8 soft-glow dark:bg-[#071017]">
            <div className="mb-6 flex items-center justify-center">
              <Logo size={44} />
            </div>
            <h2 className="mb-2 text-center text-2xl font-semibold">FeelUp</h2>
            <p className="mb-6 text-center text-sm text-[var(--feelup-muted)]">
              An AI-powered emotional sharing and support platform. Share moods, memories, and
              receive empathetic responses from peers — safely and anonymously if you choose.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/login" className="block rounded-full px-4 py-3 text-center text-sm font-medium btn-primary">
                Log in
              </Link>

              <Link href="/login" className="block rounded-full px-4 py-3 text-center text-sm font-medium btn-secondary">
                Create account
              </Link>
            </div>

            <div className="mt-6 text-center text-xs text-[var(--feelup-muted)]">
              By continuing you agree to our <Link href="/terms" className="underline">Terms & Policies</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
