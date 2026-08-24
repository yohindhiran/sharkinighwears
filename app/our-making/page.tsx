import Image from "next/image";
import { Heart, Play, Star } from "lucide-react";
import { BenefitsBar } from "@/components/storefront/benefits-bar";

const heroImage = "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=1600&q=85";
const videoImage = "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=2200&q=85";

const testimonials = [
  {
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=85",
    quote: "Beautiful fabric and extremely comfortable. The fit is perfect for everyday wear.",
    name: "Priya S.",
  },
  {
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=85",
    quote: "The quality feels premium and the nightwear is so comfortable.",
    name: "Ananya R.",
  },
  {
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=85",
    quote: "I loved the fabric, stitching and overall finish. Definitely ordering again.",
    name: "Divya M.",
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 py-16 md:grid-cols-[.9fr_1.1fr] md:gap-20 md:px-10 md:py-28 lg:py-36">
        <div className="max-w-xl">
          <p className="eyebrow text-gold">Our story</p>
          <h1 className="display mt-5 max-w-lg text-7xl leading-[.88] md:text-9xl">About SHARKI</h1>
          <p className="mt-8 max-w-md text-base leading-8 text-ink/75">At SHARKI NIGHTWEARS, we believe that comfortable nights lead to better days.</p>
          <div className="mt-6 max-w-md space-y-4 text-sm leading-7 text-ink/60">
            <p>We create comfortable, elegant and thoughtfully designed nightwear for the moments that belong entirely to you.</p>
            <p>From the feel of the fabric to the ease of the fit, every detail is considered to make everyday comfort feel beautifully effortless.</p>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-bold uppercase tracking-[.16em] text-ink/70">
            <span className="flex items-center gap-2"><Heart size={14} className="text-gold" strokeWidth={1.5} /> Premium comfort</span>
            <span className="flex items-center gap-2"><Heart size={14} className="text-gold" strokeWidth={1.5} /> Thoughtful design</span>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-sand md:aspect-[5/6]">
          <Image src={heroImage} alt="SHARKI NIGHTWEARS fashion collection" fill priority className="object-cover transition duration-700 hover:scale-105" sizes="(max-width: 768px) 100vw, 55vw" />
        </div>
      </section>

      <section className="relative aspect-[4/3] min-h-[360px] w-full overflow-hidden bg-ink md:aspect-[2.35/1]" aria-label="SHARKI NIGHTWEARS craftsmanship">
        <Image src={videoImage} alt="SHARKI NIGHTWEARS garment craftsmanship" fill className="object-cover brightness-[.72] transition duration-700 hover:scale-105" sizes="100vw" />
        <button type="button" aria-label="Play SHARKI NIGHTWEARS story" className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/75 bg-white/10 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-white hover:text-ink md:h-24 md:w-24">
          <Play size={24} fill="currentColor" strokeWidth={1.2} className="ml-1" />
        </button>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-28">
        <div className="text-center">
          <p className="eyebrow text-gold">Our valuable clients</p>
          <h2 className="display mt-4 text-5xl leading-none md:text-7xl">Women who choose comfort.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="border border-ink/10 bg-white/50 p-7 transition duration-300 hover:-translate-y-1 hover:border-gold/50 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-sand">
                  <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex gap-1" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} className="fill-gold text-gold" />)}
                </div>
              </div>
              <blockquote className="mt-8 min-h-[84px] text-sm leading-7 text-ink/70">&ldquo;{testimonial.quote}&rdquo;</blockquote>
              <figcaption className="mt-7 border-t border-ink/10 pt-5 text-[10px] font-bold uppercase tracking-[.18em]">{testimonial.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <BenefitsBar />
    </div>
  );
}
