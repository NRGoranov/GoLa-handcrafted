import SectionHeading from "./SectionHeading";

type CustomCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cards: {
    sizingTitle: string;
    sizingBody: string;
    personalizationTitle: string;
    personalizationBody: string;
    bespokeTitle: string;
    bespokeBody: string;
  };
};

export default function CustomSection({ copy }: { copy: CustomCopy }) {
  return (
    <section id="custom" className="container-luxury py-20 sm:py-24">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
          <h3 className="font-serif text-2xl text-ivory">{copy.cards.sizingTitle}</h3>
          <p className="mt-2 text-sm text-mist">
            {copy.cards.sizingBody}
          </p>
        </article>
        <article className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
          <h3 className="font-serif text-2xl text-ivory">{copy.cards.personalizationTitle}</h3>
          <p className="mt-2 text-sm text-mist">
            {copy.cards.personalizationBody}
          </p>
        </article>
        <article className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
          <h3 className="font-serif text-2xl text-ivory">{copy.cards.bespokeTitle}</h3>
          <p className="mt-2 text-sm text-mist">
            {copy.cards.bespokeBody}
          </p>
        </article>
      </div>
    </section>
  );
}
