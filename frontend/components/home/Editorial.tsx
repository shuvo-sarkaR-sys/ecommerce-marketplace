import { LinkButton } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export function Editorial() {
  return (
    <section className="container-editorial py-24">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <ImagePlaceholder label="The Modern Generation" aspect="aspect-[4/3]" />
        </div>
        <div className="md:col-span-5 md:pl-8">
          <p className="label-caps mb-4">Editorial</p>
          <h2 className="font-display text-h1 italic">
            Curated for the modern generation
          </h2>
          <p className="mt-6 max-w-sm text-body text-charcoal">
            Every brand on MAISON is chosen by hand -- independent labels making
            clothing with a point of view, not just product. This season we&apos;re
            following six of them from sketch to storefront.
          </p>
          <LinkButton href="/collections" variant="secondary" size="md" className="mt-8">
            Read the Story
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
