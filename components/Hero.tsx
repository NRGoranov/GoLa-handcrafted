"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Every frame is a keyframe so scroll can show the next picture immediately. */
const VIDEO_SRC = "/video/gola-assembly-scrub.mp4";
const POSTER_SRC = "/images/assembly/assembled.jpg";
const FRAME_RATE = 24;

/** ~30vh of scroll per second of picture, plus one sticky viewport. */
function trackForDuration(seconds: number) {
  const vh = Math.round(Math.min(420, Math.max(220, 100 + seconds * 30)));
  return `${vh}vh`;
}

type HeroCopy = {
  imageAlt: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

function sectionProgress(section: HTMLElement) {
  const scrollable = section.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  const passed = Math.min(Math.max(-section.getBoundingClientRect().top, 0), scrollable);
  return passed / scrollable;
}

function frameTime(progress: number, duration: number) {
  const frame = 1 / FRAME_RATE;
  const last = Math.max(0, duration - frame);
  const raw = Math.min(last, Math.max(0, progress * duration));
  return Math.round(raw / frame) * frame;
}

export default function Hero({ copy }: { copy: HeroCopy }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [track, setTrack] = useState("341vh");

  useEffect(() => {
    const section = sectionRef.current;
    const embedded = Boolean(
      section?.closest(".studio-preview-screen-inner, .studio-preview-card")
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyCompact = () => setCompact(embedded || motionQuery.matches);
    applyCompact();
    motionQuery.addEventListener("change", applyCompact);
    return () => motionQuery.removeEventListener("change", applyCompact);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setTrack(trackForDuration(video.duration));
        if (compact) {
          video.currentTime = Math.max(0, video.duration - 1 / FRAME_RATE);
        }
      }
      setReady(true);
    };

    if (video.readyState >= 2) onReady();
    video.addEventListener("loadeddata", onReady);
    return () => video.removeEventListener("loadeddata", onReady);
  }, [compact]);

  useEffect(() => {
    if (compact || !ready) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let frame = 0;
    const targetRef = { current: 0 };

    const seek = () => {
      if (video.seeking || !Number.isFinite(video.duration)) return;
      const target = targetRef.current;
      if (Math.abs(video.currentTime - target) >= 1 / FRAME_RATE) {
        video.currentTime = target;
      }
    };

    const apply = () => {
      frame = 0;
      const progress = sectionProgress(section);
      targetRef.current = frameTime(progress, video.duration);
      if (playheadRef.current) {
        playheadRef.current.style.width = `${progress * 100}%`;
      }
      seek();
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    apply();
    video.addEventListener("seeked", seek);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      video.removeEventListener("seeked", seek);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [compact, ready]);

  const scrubbing = !compact;

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative bg-ink"
      style={{ height: scrubbing ? track : undefined }}
    >
      <div
        className={
          scrubbing
            ? "sticky top-0 h-screen overflow-hidden"
            : "relative min-h-[88vh] overflow-hidden"
        }
      >
        <img
          src={POSTER_SRC}
          alt={copy.imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none"
          style={{ opacity: ready ? 1 : 0 }}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-y-0 left-0 w-[min(100%,48rem)] bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-ink" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" />
        {scrubbing ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-0.5 bg-ivory/20"
            aria-hidden="true"
          >
            <div ref={playheadRef} className="h-full w-0 bg-caramel" />
          </div>
        ) : null}

        <div className="container-luxury relative z-10 flex h-full min-h-[88vh] flex-col justify-center pt-16">
          <motion.div
            initial={compact || reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: compact || reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl space-y-6"
          >
            <h1 className="font-serif text-4xl leading-tight text-ivory sm:text-5xl md:text-6xl">
              {copy.title}
            </h1>
            <p className="max-w-xl text-sm text-ivory/85 sm:text-base">{copy.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#collection"
                className="focus-ring inline-flex min-h-11 items-center rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink transition-[color,background-color,transform] duration-100 ease-out hover:bg-[#c99d6b] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                {copy.ctaSecondary}
              </a>
              <a
                href="#inquiry"
                className="focus-ring inline-flex min-h-11 items-center rounded-full border border-ivory/50 px-6 py-3 text-sm text-ivory transition-[color,border-color,transform] duration-100 ease-out hover:border-caramel hover:text-caramel active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                {copy.ctaPrimary}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
