import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 bg-bg">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4 leading-tight">
          Build Your Dream PC with{" "}
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="text-lg text-text-secondary mb-8 max-w-lg mx-auto">
          Let our AI assistant find compatible components, optimize your budget,
          and build the perfect setup.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-hover hover:shadow-glow-primary"
          >
            Get Started Free
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-border bg-surface px-8 py-3 text-sm font-semibold text-text-primary transition-all hover:bg-surface-2"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
