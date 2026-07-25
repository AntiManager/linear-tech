import Link from 'next/link';

export default function ContactCTA() {
  return (
    <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-card border border-primary/10 bg-bg p-8 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-text">Сделайте заявку или задайте вопрос</h2>
          <p className="mb-6 text-muted">
            Отправьте запрос — инженер свяжется с вами в течение часа и поможет подобрать оборудование
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/rfq"
              className="rounded-btn bg-primary px-8 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Оставить заявку
            </Link>
            <a
              href="tel:+73433821172"
              className="rounded-btn border-2 border-primary px-8 py-3 font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              +7 (343) 382-11-72
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
