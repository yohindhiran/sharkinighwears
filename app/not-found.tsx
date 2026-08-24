import Link from "next/link";
export default function NotFound() { return <div className="mx-auto max-w-md px-6 py-24 text-center"><p className="eyebrow text-rose">Not found</p><h1 className="display mt-4 text-6xl">This piece has moved.</h1><Link href="/shop" className="mt-8 inline-block bg-ink px-6 py-4 text-xs font-bold uppercase tracking-widest text-white">Return to shop</Link></div>; }
