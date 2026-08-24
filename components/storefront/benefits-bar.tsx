import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

const benefits = [
  { icon: Truck, title: "Free Shipping", text: "On orders over ₹1000" },
  { icon: RotateCcw, title: "Easy Returns", text: "Simple 7-day return policy" },
  { icon: ShieldCheck, title: "Secure Payment", text: "100% secure checkout" },
  { icon: Headphones, title: "Customer Support", text: "We're here to help" },
];

export function BenefitsBar() {
  return (
    <section className="border-b border-ink/10 bg-cream" aria-label="Store services">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 md:grid-cols-4 md:px-10 md:py-12">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="flex items-center gap-4">
            <benefit.icon size={26} strokeWidth={1.2} className="shrink-0 text-gold" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.16em]">{benefit.title}</p>
              <p className="mt-1 text-xs text-ink/55">{benefit.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
