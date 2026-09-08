"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import shoe from "@/aseets/banner.png";
const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative h-[88vh] min-h-[650px] overflow-hidden bg-charcoal">
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="placeholder-surface absolute inset-0 opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t z-0 from-ink/70 via-ink/10 to-transparent" >
      <Image
        src={shoe}
        alt="Hero Image"
        className="absolute  inset-0 h-full w-full object-cover object-top"
      />
      </div>

      <div className="container-editorial absolute inset-x-10 top-20 z-10 pb-20">
        <motion.p
          custom={0}
          initial="hidden"
          animate="show"
          variants={reveal}
          className="label-caps mb-5 text-ivory/80"
        >
          Autumn / Winter Collection
        </motion.p>
        <motion.h1
          custom={0.12}
          initial="hidden"
          animate="show"
          variants={reveal}
          className="font-display text-[100px] font-bold text-display italic text-ivory"
        >
          The New Standard <br/> of Style
        </motion.h1>
        <motion.p
          custom={0.24}
          initial="hidden"
          animate="show"
          variants={reveal}
          className="mt-6 max-w-md text-body text-ivory/85"
        >
          Discover distinctive fashion from Bangladesh&apos;s most exciting independent
          brands.
        </motion.p>
        <motion.div
          custom={0.36}
          initial="hidden"
          animate="show"
          variants={reveal}
          className="mt-9 flex flex-wrap gap-4"
        >
          <LinkButton href="/shop" variant="primary" className="text-white" size="lg">
            Shop Collection
          </LinkButton>
          <LinkButton
            href="/brands"
            variant="secondary"
            size="lg"
            className="border-ivory text-ivory hover:bg-ivory hover:text-ink"
          >
            Explore Brands
          </LinkButton>
        </motion.div>
      </div>
    </section>
  );
}
