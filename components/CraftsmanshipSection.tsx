import Image from "next/image";
import SectionHeading from "./SectionHeading";

type CraftsmanshipCopy = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: [string, string, string];
  imageAlt: string;
};

export default function CraftsmanshipSection({ copy }: { copy: CraftsmanshipCopy }) {
  return (
    <section id="craftsmanship" className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24">
      <div className="container-luxury grid items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-ivory/10">
          <Image
            src="/images/heroRotation/hero-2.jpeg"
            alt={copy.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />
        </div>

        <div>
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
          <ul className="space-y-4 text-sm text-mist sm:text-base">
            <li>{copy.bullets[0]}</li>
            <li>{copy.bullets[1]}</li>
            <li>{copy.bullets[2]}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
