import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DevTools Hub. Built with Next.js.</p>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/cheatsheets" className="hover:text-foreground transition-colors">
            Cheatsheets
          </Link>
        </nav>
      </div>
    </footer>
  );
}
