type PageIntroProps = {
  title: string;
  description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
  return <section className="bg-[#f4f1ed] px-6 py-16 text-center md:px-12 md:py-24"><div className="mx-auto max-w-2xl"><h1 className="display text-6xl leading-none md:text-8xl">{title}</h1><p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-ink/60 md:text-base md:leading-8">{description}</p></div></section>;
}
