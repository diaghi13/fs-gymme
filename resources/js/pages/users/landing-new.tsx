import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

// --- Icons ---
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-dark flex-shrink-0" fill="none"
       viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconBolt = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
       strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24"
       stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24"
       stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24"
       stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconTurnstile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24"
       stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24"
       stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24"
       stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconLocation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24"
       stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// --- Types ---
interface LandingNewProps {
  auth?: {
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  };
  dashboardRoute?: string | null;
}

// --- Components ---

interface NavbarProps {
  auth?: LandingNewProps['auth'];
  dashboardRoute?: string | null;
}

const Navbar = ({ auth, dashboardRoute }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = !!auth?.user;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${scrolled ? 'pt-4' : 'pt-6'}`}>
      <nav className={`
        mx-4 px-6 py-3 rounded-2xl flex items-center justify-between gap-8
        transition-all duration-300 w-full max-w-5xl
        ${scrolled ? 'bg-brand-surface/80 backdrop-blur-xl border border-white/10 shadow-lg' : 'bg-transparent'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center transform -rotate-12 shadow-[0_0_15px_rgba(204,255,0,0.4)]">
            <span className="text-brand-dark font-black text-xl italic">G</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white hidden sm:block">Gymme</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-1">
          <a href="#features"
             className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            Features
          </a>
          <a href="#demo"
             className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            Demo
          </a>
          <a href="#pricing"
             className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            Prezzi
          </a>
          <a href="#contatti"
             className="px-4 py-2 text-sm font-medium text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            Contatti
          </a>
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          {isAuthenticated && dashboardRoute ? (
            <Link
              href={dashboardRoute}
              className="bg-brand-accent hover:bg-white text-brand-dark font-bold py-2 px-5 rounded-lg transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(204,255,0,0.2)] inline-block">
              Dashboard
            </Link>
          ) : (
            <Link
              href={route('login')}
              className="bg-brand-accent hover:bg-white text-brand-dark font-bold py-2 px-5 rounded-lg transition-all transform hover:scale-105 shadow-[0_4px_20px_rgba(204,255,0,0.2)] inline-block">
              Accedi
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          <IconMenu />
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div
          className="absolute top-24 left-4 right-4 bg-brand-surface border border-white/10 rounded-2xl p-4 flex flex-col space-y-2 md:hidden shadow-2xl z-50">
          <a onClick={() => setIsOpen(false)} href="#features"
             className="p-3 text-center text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
            Features
          </a>
          <a onClick={() => setIsOpen(false)} href="#demo"
             className="p-3 text-center text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
            Demo
          </a>
          <a onClick={() => setIsOpen(false)} href="#pricing"
             className="p-3 text-center text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
            Prezzi
          </a>
          <a onClick={() => setIsOpen(false)} href="#contatti"
             className="p-3 text-center text-gray-300 hover:text-white hover:bg-white/5 rounded-xl">
            Contatti
          </a>
          {isAuthenticated && dashboardRoute ? (
            <Link
              href={dashboardRoute}
              className="w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-xl mt-2 block text-center">
              Dashboard
            </Link>
          ) : (
            <Link
              href={route('login')}
              className="w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-xl mt-2 block text-center">
              Accedi
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-accent/20 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
        <div
          className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div
          className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Text Content */}
        <div className="text-center lg:text-left">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/5 mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-brand-accent animate-pulse"></span>
            <span className="text-xs font-bold text-brand-accent tracking-wider uppercase">Nuova Versione 2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-6">
            ALLENA <br />
            IL TUO <br />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-emerald-400">BUSINESS.</span>
          </h1>

          <p className="text-lg text-brand-muted max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            Dimentica i fogli Excel. Gymme è la piattaforma all-in-one che trasforma la gestione della tua palestra in
            un vantaggio competitivo. Semplice. Veloce. Potente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href={route('tenant.register')}
              className="group relative px-8 py-4 bg-brand-accent text-brand-dark font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-105 inline-flex items-center justify-center">
              <div
                className="absolute inset-0 w-full h-full bg-white/20 transform -translate-x-full skew-x-12 group-hover:animate-[shimmer_1s_infinite]"></div>
              <span className="relative flex items-center gap-2">
                    Inizia Gratis
                    <IconBolt />
                </span>
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all backdrop-blur-md inline-flex items-center justify-center">
              Scopri Features
            </a>
          </div>

          <div
            className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1"><IconCheck /> Setup in 5 minuti</span>
            <span className="flex items-center gap-1"><IconCheck /> No Carta di Credito</span>
          </div>
        </div>

        {/* Abstract Floating UI (CSS Only - No Images) */}
        <div className="relative h-[500px] w-full hidden md:block perspective-1000">
          {/* Main Card (Dashboard) */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-brand-surface border border-white/10 rounded-2xl p-6 shadow-2xl animate-float glass-panel">
            {/* Mock Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 w-24 bg-white/10 rounded"></div>
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-full bg-white/5"></div>
                <div className="h-8 w-8 rounded-full bg-brand-accent/20 border border-brand-accent/50"></div>
              </div>
            </div>
            {/* Mock Chart */}
            <div className="flex items-end gap-2 h-32 mb-6">
              <div className="w-1/6 bg-brand-accent/20 h-[40%] rounded-t-sm"></div>
              <div className="w-1/6 bg-brand-accent/30 h-[60%] rounded-t-sm"></div>
              <div className="w-1/6 bg-brand-accent/50 h-[80%] rounded-t-sm"></div>
              <div className="w-1/6 bg-brand-accent/40 h-[50%] rounded-t-sm"></div>
              <div
                className="w-1/6 bg-brand-accent h-[90%] rounded-t-sm relative shadow-[0_0_20px_rgba(204,255,0,0.5)]"></div>
              <div className="w-1/6 bg-brand-accent/20 h-[70%] rounded-t-sm"></div>
            </div>
            {/* Mock List */}
            <div className="space-y-3">
              <div className="h-10 w-full bg-white/5 rounded-lg flex items-center px-3 gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500/20"></div>
                <div className="h-2 w-20 bg-white/10 rounded"></div>
              </div>
              <div className="h-10 w-full bg-white/5 rounded-lg flex items-center px-3 gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-500/20"></div>
                <div className="h-2 w-24 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>

          {/* Floating Notification Card 1 */}
          <div
            className="absolute top-[20%] right-0 w-64 bg-[#1A2333] border border-brand-accent/30 p-4 rounded-xl shadow-xl animate-float-delayed z-20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white text-xs font-bold">Accesso Consentito</p>
                <p className="text-gray-400 text-[10px]">Tornello Principale • 10:42</p>
              </div>
            </div>
          </div>

          {/* Floating Stat Card 2 */}
          <div
            className="absolute bottom-[20%] left-[-20px] w-48 bg-[#1A2333] border border-white/5 p-4 rounded-xl shadow-xl animate-float z-20 backdrop-blur-md">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Nuovi Iscritti</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">+24</span>
              <span className="text-green-400 text-xs font-bold">↑ 12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

interface FeatureBoxProps {
  icon: React.ComponentType;
  title: string;
  desc: string;
  colSpan?: string;
}

const FeatureBox = ({ icon: Icon, title, desc, colSpan = 'col-span-1' }: FeatureBoxProps) => (
  <div
    className={`${colSpan} group relative p-8 rounded-3xl bg-brand-surface border border-white/5 overflow-hidden transition-all duration-300 hover:border-brand-accent/50 hover:shadow-[0_0_30px_rgba(204,255,0,0.1)]`}>
    <div
      className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-brand-accent/10 transition-all"></div>

    <div className="relative z-10">
      <div
        className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-brand-dark transition-all duration-300">
        <Icon />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-brand-muted leading-relaxed text-sm md:text-base">{desc}</p>
    </div>
  </div>
);

const Features = () => {
  return (
    <div id="features" className="py-32 relative bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-brand-accent font-mono text-sm tracking-widest uppercase mb-3">Core Features</h2>
          <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            COSTRUITO PER <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">PERFORMARE.</span>
          </h3>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureBox
            icon={IconUsers}
            title="Gestione Totale"
            desc="Dall'iscrizione al certificato medico. Automatizza il ciclo di vita del cliente e riduci la carta a zero."
            colSpan="md:col-span-2"
          />
          <FeatureBox
            icon={IconTurnstile}
            title="Accessi Smart"
            desc="Il tuo tornello diventa intelligente. Integrazione hardware nativa per un controllo flussi impeccabile."
          />
          <FeatureBox
            icon={IconChart}
            title="Analytics"
            desc="Dashboard finanziarie e report presenze. Prendi decisioni basate sui dati, non sulle sensazioni."
          />
          <FeatureBox
            icon={IconShield}
            title="GDPR Safe"
            desc="Sicurezza bancaria per i dati dei tuoi utenti. Compliance automatica e backup giornalieri."
            colSpan="md:col-span-2"
          />
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  // Images tailored to look like "User Stories"
  return (
    <div id="demo" className="py-24 bg-[#0F1420] border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">OGNI SPAZIO.<br />UNA
              SOLUZIONE.</h2>
            <p className="text-brand-muted max-w-md">Dai box underground ai centri wellness di lusso. Gymme si adatta al
              tuo stile.</p>
          </div>
          <button
            className="text-white border-b border-brand-accent pb-1 hover:text-brand-accent transition-colors">Vedi
            tutti i casi d'uso
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          {/* Card 1 */}
          <div
            className="min-w-[300px] md:min-w-[400px] snap-center relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                 alt="Gym" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-2">Fitness Club</span>
              <h3 className="text-2xl font-bold text-white">Urban Gym Milano</h3>
            </div>
          </div>
          {/* Card 2 */}
          <div
            className="min-w-[300px] md:min-w-[400px] snap-center relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1000&auto=format&fit=crop"
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                 alt="Crossfit" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-2">Functional Box</span>
              <h3 className="text-2xl font-bold text-white">Crossfit Darsena</h3>
            </div>
          </div>
          {/* Card 3 */}
          <div
            className="min-w-[300px] md:min-w-[400px] snap-center relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2068&auto=format&fit=crop"
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                 alt="Yoga" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-2">Yoga Studio</span>
              <h3 className="text-2xl font-bold text-white">Lotus Space</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Pricing = () => {
  return (
    <div id="pricing" className="py-32 bg-brand-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">INVESTI NELLA<br />CRESCITA.
          </h2>
          <p className="text-brand-muted">Piani trasparenti. Nessun costo nascosto.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Basic */}
          <div className="p-8 rounded-3xl bg-brand-surface border border-white/5 hover:border-white/20 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">ASD Starter</h3>
            <div className="text-3xl font-bold text-white mb-6">€29<span
              className="text-sm font-normal text-brand-muted">/mese</span></div>
            <ul className="space-y-4 mb-8 text-sm text-gray-400">
              <li className="flex gap-3"><IconCheck /> Fino a 100 iscritti</li>
              <li className="flex gap-3"><IconCheck /> Anagrafica Base</li>
              <li className="flex gap-3"><IconCheck /> Backup Cloud</li>
            </ul>
            <Link
              href={route('tenant.register')}
              className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white hover:text-brand-dark transition-all inline-block text-center">
              Scegli Starter
            </Link>
          </div>

          {/* Pro (Highlighted) */}
          <div
            className="p-8 rounded-3xl bg-[#1A2333] border-2 border-brand-accent relative transform md:-translate-y-4 shadow-[0_0_50px_rgba(204,255,0,0.15)]">
            <div
              className="absolute top-0 right-0 bg-brand-accent text-brand-dark text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">POPOLARE
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fitness Pro</h3>
            <div className="text-4xl font-bold text-white mb-6">€69<span
              className="text-sm font-normal text-brand-muted">/mese</span></div>
            <p className="text-brand-accent text-sm mb-6 font-medium">Tutto quello che serve per scalare.</p>
            <ul className="space-y-4 mb-8 text-sm text-gray-300">
              <li className="flex gap-3 text-white"><IconCheck /> Iscritti Illimitati</li>
              <li className="flex gap-3 text-white"><IconCheck /> Fatturazione Elettronica</li>
              <li className="flex gap-3 text-white"><IconCheck /> Controllo Accessi</li>
              <li className="flex gap-3 text-white"><IconCheck /> App Utente Personalizzata</li>
            </ul>
            <Link
              href={route('tenant.register')}
              className="w-full py-4 rounded-xl bg-brand-accent text-brand-dark font-black hover:bg-white transition-all shadow-lg hover:shadow-xl inline-block text-center">
              PROVA GRATIS
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-8 rounded-3xl bg-brand-surface border border-white/5 hover:border-white/20 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-3xl font-bold text-white mb-6">Custom</div>
            <ul className="space-y-4 mb-8 text-sm text-gray-400">
              <li className="flex gap-3"><IconCheck /> Multi-sede</li>
              <li className="flex gap-3"><IconCheck /> API Access</li>
              <li className="flex gap-3"><IconCheck /> Account Manager</li>
            </ul>
            <a
              href="#contatti"
              className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white hover:text-brand-dark transition-all inline-block text-center">
              Contattaci
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  return (
    <div id="contatti" className="py-24 bg-brand-surface relative overflow-hidden">
      {/* Decorative elements */}
      <div
        className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-accent/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* Left Column: Info */}
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-6">PARLIAMO <br /> DI FUTURO.
            </h2>
            <p className="text-brand-muted text-lg mb-8 leading-relaxed">
              Hai domande specifiche o vuoi una demo guidata? Il nostro team è pronto ad ascoltare le tue esigenze e
              configurare la soluzione perfetta per la tua struttura.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-brand-accent">
                  <IconMail />
                </div>
                <div>
                  <h4 className="text-white font-bold">Email</h4>
                  <a href="mailto:hello@gymme.it"
                     className="text-brand-muted hover:text-brand-accent transition-colors">hello@gymme.it</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-brand-accent">
                  <IconPhone />
                </div>
                <div>
                  <h4 className="text-white font-bold">Telefono</h4>
                  <a href="tel:+39021234567" className="text-brand-muted hover:text-brand-accent transition-colors">+39
                    02 123 4567</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-brand-accent">
                  <IconLocation />
                </div>
                <div>
                  <h4 className="text-white font-bold">Headquarters</h4>
                  <p className="text-brand-muted">Via dell'Innovazione 42, Milano (MI)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-brand-dark border border-white/5 p-8 rounded-3xl shadow-2xl">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Nome</label>
                  <input type="text"
                         className="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                         placeholder="Mario Rossi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Palestra / Attività</label>
                  <input type="text"
                         className="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                         placeholder="Fit Club ASD" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email</label>
                <input type="email"
                       className="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                       placeholder="mario@esempio.it" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Messaggio</label>
                <textarea rows={4}
                          className="w-full bg-brand-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-none"
                          placeholder="Vorrei maggiori informazioni su..."></textarea>
              </div>

              <button type="button"
                      className="w-full py-4 bg-brand-accent text-brand-dark font-bold text-lg rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] shadow-lg">
                Invia Messaggio
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#05080f] pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-brand-accent rounded flex items-center justify-center">
                <span className="text-brand-dark font-black text-xs">G</span>
              </div>
              <span className="text-2xl font-bold text-white">Gymme</span>
            </div>
            <p className="text-brand-muted max-w-xs">Software gestionale per palestre che guardano al futuro.</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-brand-muted hover:text-brand-accent transition-colors">Instagram</a>
            <a href="#" className="text-brand-muted hover:text-brand-accent transition-colors">LinkedIn</a>
            <a href="#" className="text-brand-muted hover:text-brand-accent transition-colors">Facebook</a>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between text-sm text-gray-600">
          <p>© 2024 Gymme. Made for fitness.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Termini</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LandingNew = ({ auth, dashboardRoute }: LandingNewProps) => {
  return (
    <>
      <Head title="Gymme - Gestionale Palestre" />
      <div
        className="bg-brand-dark min-h-screen font-sans antialiased text-brand-text selection:bg-brand-accent selection:text-brand-dark">
        {/* Background Noise Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay"
             style={{ backgroundImage: `url("data:image/svg+xml,...")` }}>
        </div>

        <Navbar auth={auth} dashboardRoute={dashboardRoute} />
        <Hero />
        <Features />
        <Gallery />
        <Pricing />
        <Contact />
        <Footer />
      </div>
    </>
  );
};

export default LandingNew;
