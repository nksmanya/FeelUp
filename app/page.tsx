import ClientAuthCard from "../components/ClientAuthCard";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <section>
            <h1 className="text-4xl font-bold mb-4">Welcome to FeelUp</h1>
            <p className="text-gray-600 mb-6">
              A gentle, private place to reflect and connect. Sign in or create an account to access your mood feed.
            </p>
            {/* You can add marketing or feature highlights here */}
          </section>

          <aside>
            <ClientAuthCard />
          </aside>
        </div>
      </div>
    </main>
  );
}
