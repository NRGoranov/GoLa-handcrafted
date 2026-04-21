import Image from "next/image";
import SectionHeading from "./SectionHeading";

export default function CraftsmanshipSection() {
  return (
    <section id="craftsmanship" className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24">
      <div className="container-luxury grid items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-ivory/10">
          <Image
            src="/images/heroRotation/hero-2.jpeg"
            alt="Close-up of handcrafted woodworking and leather stitching"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />
        </div>

        <div>
          <SectionHeading
            eyebrow="Process"
            title="Crafted with Intention"
            description="Every GoLa piece is worked by hand: selected materials, measured shaping, and detailed finishing that honors character over volume."
          />
          <ul className="space-y-4 text-sm text-mist sm:text-base">
            <li>No mass production - each handbag is created in small, attentive runs.</li>
            <li>Hand-finished edges, hardware placement, and grain-matched panels.</li>
            <li>Natural variations are preserved to make every piece inherently unique.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
