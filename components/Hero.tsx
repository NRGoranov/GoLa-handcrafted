"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const heroRotationImages = [
  "/images/heroRotation/hero-1.jpg",
  "/images/heroRotation/hero-2.jpeg",
  "/images/heroRotation/hero-3.jpeg",
  "/images/heroRotation/hero-4.jpeg"
];

type HeroCopy = {
  imageAlt: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export default function Hero({ copy }: { copy: HeroCopy }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroRotationImages.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section id="top" className="relative min-h-[88vh] overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        <motion.div
          key={heroRotationImages[activeIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={heroRotationImages[activeIndex]}
            alt={copy.imageAlt}
            fill
            priority={activeIndex === 0}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-ink" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-ink" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" />

      <div className="container-luxury relative z-10 flex min-h-[88vh] flex-col justify-center pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl space-y-6"
        >
          <h1 className="font-serif text-4xl leading-tight text-ivory sm:text-5xl md:text-6xl">
            {copy.title}
          </h1>
          <p className="max-w-xl text-sm text-ivory/85 sm:text-base">
            {copy.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#inquiry"
              className="focus-ring inline-flex min-h-11 items-center rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink transition hover:bg-[#c99d6b]"
            >
              {copy.ctaPrimary}
            </a>
            <a
              href="#collection"
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-ivory/50 px-6 py-3 text-sm text-ivory transition hover:border-caramel hover:text-caramel"
            >
              {copy.ctaSecondary}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
