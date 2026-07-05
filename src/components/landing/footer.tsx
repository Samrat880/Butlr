export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <span className="font-display tracking-[0.2em] text-[#f5f5f5]">
          BATCORE
        </span>
        <nav className="flex flex-wrap justify-center gap-6 font-mono-ui text-xs tracking-wider text-[#9ca3af] uppercase">
          <a href="#product" className="hover:text-[#4aa8ff]">
            Product
          </a>
          <a href="#integrations" className="hover:text-[#4aa8ff]">
            Integrations
          </a>
          <a href="#pricing" className="hover:text-[#4aa8ff]">
            Pricing
          </a>
          <span>Privacy</span>
          <span>Terms</span>
        </nav>
        <p className="font-mono-ui text-xs text-[#9ca3af]">
          © {new Date().getFullYear()} BATCORE
        </p>
      </div>
    </footer>
  );
}
