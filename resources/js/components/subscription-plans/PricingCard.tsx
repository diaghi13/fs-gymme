import * as React from 'react';
import { Link } from '@inertiajs/react';

// Icon component for feature checkmarks
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-dark flex-shrink-0" fill="none"
       viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export interface PricingCardFeature {
  id: number;
  name: string;
  display_name: string;
  is_included: boolean;
  quota_limit: number | null;
}

export interface PricingCardProps {
  name: string;
  description?: string | null;
  price: number;
  interval: string;
  trial_days?: number;
  features?: PricingCardFeature[];
  highlighted?: boolean;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  disabled?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  description,
  price,
  interval,
  trial_days = 0,
  features = [],
  highlighted = false,
  ctaText = 'Scegli questo piano',
  ctaHref,
  onCtaClick,
  disabled = false,
}) => {
  const intervalLabel = interval === 'month' ? 'mese' : interval === 'year' ? 'anno' : interval;
  const includedFeatures = features.filter((f) => f.is_included);

  const renderCta = () => {
    const buttonClasses = `w-full py-${highlighted ? '4' : '3'} rounded-xl font-bold transition-all inline-block text-center ${
      highlighted
        ? 'bg-brand-accent text-brand-dark font-black hover:bg-white shadow-lg hover:shadow-xl'
        : 'border border-white/20 text-white hover:bg-white hover:text-brand-dark'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    if (ctaHref) {
      return (
        <Link href={ctaHref} className={buttonClasses}>
          {ctaText}
        </Link>
      );
    }

    return (
      <button onClick={onCtaClick} disabled={disabled} className={buttonClasses}>
        {ctaText}
      </button>
    );
  };

  return (
    <div
      className={`p-8 rounded-3xl relative transition-all ${
        highlighted
          ? 'bg-[#1A2333] border-2 border-brand-accent shadow-[0_0_50px_rgba(204,255,0,0.15)] transform md:-translate-y-4'
          : 'bg-brand-surface border border-white/5 hover:border-white/20'
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 right-0 bg-brand-accent text-brand-dark text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
          POPOLARE
        </div>
      )}

      {/* Header */}
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>

      {/* Pricing */}
      <div className={`mb-6 ${highlighted ? 'text-4xl' : 'text-3xl'} font-bold text-white`}>
        €{price.toFixed(0)}
        <span className="text-sm font-normal text-brand-muted">/{intervalLabel}</span>
      </div>

      {/* Description */}
      {description && (
        <p className={`text-sm mb-6 font-medium ${highlighted ? 'text-brand-accent' : 'text-gray-400'}`}>
          {description}
        </p>
      )}

      {/* Features */}
      {includedFeatures.length > 0 && (
        <ul className={`space-y-4 mb-8 text-sm ${highlighted ? 'text-gray-300' : 'text-gray-400'}`}>
          {includedFeatures.map((feature) => (
            <li key={feature.id} className={`flex gap-3 ${highlighted ? 'text-white' : ''}`}>
              <IconCheck />
              {feature.display_name}
              {feature.quota_limit && ` (${feature.quota_limit})`}
            </li>
          ))}
        </ul>
      )}

      {/* Trial Badge */}
      {trial_days > 0 && (
        <div className="mb-4">
          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded-full border border-green-600/30">
            {trial_days} giorni di prova gratuita
          </span>
        </div>
      )}

      {/* CTA Button */}
      {renderCta()}
    </div>
  );
};

export default PricingCard;
