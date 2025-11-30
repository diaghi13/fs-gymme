/**
 * Subscription Content Type Constants
 *
 * Defines the different types of products/pricelists that can be included in a subscription.
 * These must match the backend SubscriptionContentType enum.
 *
 * Split between:
 * - PRODUCTS (3): catalog items (what we physically offer)
 * - PRICELISTS (5): commercial offerings (how we sell them)
 */

export const SUBSCRIPTION_CONTENT_TYPES = {
  // PRODUCTS (Catalog)
  BASE_PRODUCT: 'App\\Models\\Product\\BaseProduct',
  COURSE_PRODUCT: 'App\\Models\\Product\\CourseProduct',
  BOOKABLE_SERVICE: 'App\\Models\\Product\\BookableService',

  // PRICELISTS (Commercial offerings)
  ARTICLE: 'App\\Models\\PriceList\\Article',
  MEMBERSHIP: 'App\\Models\\PriceList\\Membership',
  TOKEN: 'App\\Models\\PriceList\\Token',
  DAY_PASS: 'App\\Models\\PriceList\\DayPass',
  GIFT_CARD: 'App\\Models\\PriceList\\GiftCard',
} as const;

export type SubscriptionContentType = typeof SUBSCRIPTION_CONTENT_TYPES[keyof typeof SUBSCRIPTION_CONTENT_TYPES];

/**
 * Check if a type requires duration configuration
 */
export function requiresDuration(type: SubscriptionContentType): boolean {
  return [
    SUBSCRIPTION_CONTENT_TYPES.BASE_PRODUCT,
    SUBSCRIPTION_CONTENT_TYPES.COURSE_PRODUCT,
    SUBSCRIPTION_CONTENT_TYPES.BOOKABLE_SERVICE,
    SUBSCRIPTION_CONTENT_TYPES.MEMBERSHIP,
  ].includes(type);
}

/**
 * Check if a type supports entrance limits
 */
export function supportsEntrances(type: SubscriptionContentType): boolean {
  return [
    SUBSCRIPTION_CONTENT_TYPES.BASE_PRODUCT,
    SUBSCRIPTION_CONTENT_TYPES.COURSE_PRODUCT,
    SUBSCRIPTION_CONTENT_TYPES.BOOKABLE_SERVICE,
    SUBSCRIPTION_CONTENT_TYPES.TOKEN,
  ].includes(type);
}

/**
 * Check if a type is a membership
 */
export function isMembershipFee(type: SubscriptionContentType): boolean {
  return type === SUBSCRIPTION_CONTENT_TYPES.MEMBERSHIP;
}

/**
 * Check if a type is a Product (catalog)
 */
export function isProduct(type: SubscriptionContentType): boolean {
  return [
    SUBSCRIPTION_CONTENT_TYPES.BASE_PRODUCT,
    SUBSCRIPTION_CONTENT_TYPES.COURSE_PRODUCT,
    SUBSCRIPTION_CONTENT_TYPES.BOOKABLE_SERVICE,
  ].includes(type);
}

/**
 * Check if a type is a PriceList (commercial offering)
 */
export function isPriceList(type: SubscriptionContentType): boolean {
  return [
    SUBSCRIPTION_CONTENT_TYPES.ARTICLE,
    SUBSCRIPTION_CONTENT_TYPES.MEMBERSHIP,
    SUBSCRIPTION_CONTENT_TYPES.TOKEN,
    SUBSCRIPTION_CONTENT_TYPES.DAY_PASS,
    SUBSCRIPTION_CONTENT_TYPES.GIFT_CARD,
  ].includes(type);
}

/**
 * Get human-readable label for a content type
 */
export function getContentTypeLabel(type: SubscriptionContentType): string {
  const labels: Record<SubscriptionContentType, string> = {
    [SUBSCRIPTION_CONTENT_TYPES.BASE_PRODUCT]: 'Prodotto Base',
    [SUBSCRIPTION_CONTENT_TYPES.COURSE_PRODUCT]: 'Corso',
    [SUBSCRIPTION_CONTENT_TYPES.BOOKABLE_SERVICE]: 'Servizio Prenotabile',
    [SUBSCRIPTION_CONTENT_TYPES.ARTICLE]: 'Articolo',
    [SUBSCRIPTION_CONTENT_TYPES.MEMBERSHIP]: 'Quota Associativa',
    [SUBSCRIPTION_CONTENT_TYPES.TOKEN]: 'Pacchetto Token',
    [SUBSCRIPTION_CONTENT_TYPES.DAY_PASS]: 'Ingresso Giornaliero',
    [SUBSCRIPTION_CONTENT_TYPES.GIFT_CARD]: 'Carta Regalo',
  };

  return labels[type] || 'Sconosciuto';
}

