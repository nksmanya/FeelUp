import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import SearchBar from "./SearchBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        {/* ✅ Sidebar for USERS only */}
        <Sidebar />

        <div className="flex-1 flex flex-col">
          {/* ✅ Top Bar for USERS only */}
          <header className="sticky top-0 z-40 glass border-b border-[var(--card-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 sm:gap-6">
              <div className="flex-1 flex justify-center">
                <SearchBar />
              </div>

              <Topbar />
            </div>
          </header>

          <div className="md:hidden">
            <Navbar />
          </div>

          <main className="p-4 sm:p-6 flex-1 bg-[var(--background)] transition-colors duration-300">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}
