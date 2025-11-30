import { Head, Link } from '@inertiajs/react';
import React, { JSX } from 'react';

type Props = {
  appName?: string;
};

const features: Array<{ title: string; desc: string }> = [
  { title: 'Gestione vendite', desc: 'Crea, monitora e analizza vendite e pagamenti in tempo reale.' },
  { title: 'Listini dinamici', desc: 'Configura listini e regole di prezzo per prodotti e servizi.' },
  { title: 'Multitenant', desc: 'Isola dati e configurazioni per ogni azienda/tenant in sicurezza.' },
  { title: 'Reportistica', desc: 'Insight immediati su fatturato, clienti e performance.' },
];

export default function Index({ appName = 'Gymme' }: Props): JSX.Element {
  return (
    <>
      <Head title={`Benvenuto su ${appName}`} />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
        {/* Nav */}
        <header className="container mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/10 ring-1 ring-white/15 grid place-items-center">
                <span className="text-lg font-bold">G</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">{appName}</span>
            </div>
            <nav className="flex items-center gap-2">
              <Link href="/login" className="rounded-md px-3 py-2 text-sm text-white/85 hover:text-white">
                Accedi
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white text-slate-900 px-4 py-2 text-sm font-medium hover:bg-white/90"
              >
                Registrati
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <main className="container mx-auto px-4">
          <section className="py-20 md:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                Organizza, vendi e scala la tua attività con {appName}.
              </h1>
              <p className="mt-5 text-white/75 text-lg md:text-xl leading-relaxed">
                Un\'unica piattaforma per gestire listini, clienti, pagamenti e report. Pensata per multi\-tenant,
                veloce da usare, pronta a crescere con te.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Link
                  href="/register"
                  className="rounded-lg bg-white text-slate-950 px-5 py-3 text-sm font-semibold hover:bg-white/90"
                >
                  Inizia ora
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg ring-1 ring-white/20 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/5"
                >
                  Ho già un account
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-5">
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA banner */}
            <div className="mt-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 p-0.5">
              <div className="rounded-2xl bg-slate-900/90 px-6 py-8 ring-1 ring-white/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold">Pronto a partire?</h4>
                    <p className="text-white/80 text-sm mt-1">
                      Crea il tuo tenant e configura i listini in pochi minuti.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/register"
                      className="rounded-md bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-white/90"
                    >
                      Crea account
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-md ring-1 ring-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/5"
                    >
                      Accedi
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-10 text-center text-white/60 text-sm">
          © {new Date().getFullYear()} {appName}. Tutti i diritti riservati.
        </footer>
      </div>
    </>
  );
}
