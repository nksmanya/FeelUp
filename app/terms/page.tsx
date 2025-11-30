import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-md dark:bg-[#0b0b0b]">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Terms & Policies</h1>
          <Link href="/login" className="text-sm text-zinc-600 hover:underline">
            Back to Login
          </Link>
        </div>

        <section className="prose max-w-none text-sm text-zinc-700 dark:text-zinc-300">
          <h2>Welcome to FeelUp</h2>
          <p>
            FeelUp is an AI-powered emotion sharing and support platform designed to
            provide a calm, safe space for users to express and reflect on their feelings.
          </p>

          <h3>Acceptable Use</h3>
          <p>
            Be respectful to others. Do not post abusive, harassing, or illegal content. The
            platform is intended for support and reflection, not diagnosis.
          </p>

          <h3>Privacy</h3>
          <p>
            We may process content to provide AI features. In a production deployment,
            ensure you disclose data use and obtain user consent where required by law.
          </p>

          <h3>Account Creation</h3>
          <p>
            By creating an account you agree to these terms. You must be at least 13 years
            old (or the minimum age in your jurisdiction) to use the service.
          </p>

          <p>
            This is a sample terms page. Replace with full legal terms before going live.
          </p>
        </section>
      </main>
    </div>
  );
}
