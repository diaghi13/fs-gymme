import * as React from 'react';
import { Head } from '@inertiajs/react';
import PricingCard, { PricingCardFeature } from '@/components/subscription-plans/PricingCard';

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  trial_days: number;
  tier: string | null;
  is_active: boolean;
}

interface PlanWithFeatures extends SubscriptionPlan {
  features: PricingCardFeature[];
}

interface PricingExampleProps {
  plans: PlanWithFeatures[];
}

/**
 * Example page showing how to use PricingCard component dynamically.
 * This can be used in landing pages or anywhere you need to display subscription plans.
 */
const PricingExample: React.FC<PricingExampleProps> = ({ plans }) => {
  return (
    <>
      <Head title="Piani di Abbonamento" />

      {/* Dark background matching landing-new */}
      <div className="min-h-screen bg-brand-dark">
        {/* Pricing Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Piani Semplici, <span className="text-brand-accent">Trasparenti</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Scegli il piano perfetto per il tuo centro fitness. Nessun costo nascosto.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {plans
              .filter((plan) => plan.is_active)
              .map((plan) => (
                <PricingCard
                  key={plan.id}
                  name={plan.name}
                  description={plan.description}
                  price={plan.price}
                  interval={plan.interval}
                  trial_days={plan.trial_days}
                  features={plan.features}
                  highlighted={plan.tier === 'gold'}
                  ctaText={plan.tier === 'gold' ? 'PROVA GRATIS' : `Scegli ${plan.name}`}
                  ctaHref={`/register?plan=${plan.slug}`}
                />
              ))}
          </div>

          {/* FAQ or additional info */}
          <div className="text-center mt-16">
            <p className="text-gray-400">
              Hai domande?{' '}
              <a href="#contatti" className="text-brand-accent hover:underline">
                Contattaci
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingExample;
