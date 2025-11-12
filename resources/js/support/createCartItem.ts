import {
  AllPriceLists,
  PriceListArticle,
  PriceListDayPass,
  PriceListGiftCard,
  PriceListMembershipFee,
  PriceListSubscription,
  PriceListSubscriptionContent
} from '@/types';
import { ARTICLE, MEMBERSHIP, SUBSCRIPTION } from '@/pages/price-lists/price-lists';

export interface SaleRowFormValues {
  price_list: PriceListArticle | PriceListMembershipFee | PriceListSubscription | PriceListDayPass | PriceListGiftCard;
  quantity: number;
  unit_price: number;
  percentage_discount: number;
  absolute_discount: number;
  total: number;

  start_date?: Date | null;
  subscription_selected_content?: PriceListSubscriptionContent[];
}

export const createCartItem = (priceList: AllPriceLists, startDate: Date | number | null = null, options: PriceListSubscriptionContent[] = []): SaleRowFormValues | SaleRowFormValues[] | undefined => {
  // Products without expiry (no start_date needed)
  if (priceList.type === ARTICLE || priceList.type === 'day_pass' || priceList.type === 'gift_card') {
    return createArticle(priceList);
  }

  // Products with expiry require start date
  // BaseProduct, CourseProduct, Membership, Token
  if (!startDate) {
    startDate = new Date(); // Default to today
  }

  const start = new Date(startDate);

  if (priceList.type === MEMBERSHIP) {
    return createMembership(priceList, start);
  }

  if (priceList.type === SUBSCRIPTION) {
    return createSubscription(priceList, start, options);
  }

  if (priceList.type === 'token') {
    return createToken(priceList, start);
  }

  // BaseProduct and CourseProduct fall through here
  return createProductWithExpiry(priceList, start);
}

const createArticle = (priceList: PriceListArticle | PriceListDayPass | PriceListGiftCard): SaleRowFormValues => {
  return {
    price_list: priceList,
    quantity: 1,
    unit_price: priceList.price,
    percentage_discount: 0,
    absolute_discount: 0,
    total: priceList.price,
  }
}

const createMembership = (priceList: PriceListMembershipFee, startDate: Date): SaleRowFormValues => {
  return {
    price_list: priceList,
    quantity: 1,
    unit_price: priceList.price,
    percentage_discount: 0,
    absolute_discount: 0,
    total: priceList.price,
    start_date: startDate,
  };
}

const createSubscription = (priceList: PriceListSubscription, startDate: Date, options: PriceListSubscriptionContent[] = []): SaleRowFormValues => {
  const standardContent = Array.isArray(priceList.standard_content) ? priceList.standard_content : [];
  const content = [...standardContent, ...options];
  const price = content.reduce((acc, item) => {
    return acc + item.price;
  }, 0);

  return {
    price_list: priceList,
    quantity: 1,
    unit_price: price,
    percentage_discount: 0,
    absolute_discount: 0,
    total: priceList.price,
    start_date: startDate,
    subscription_selected_content: content,
  }
}

const createToken = (priceList: any, startDate: Date): SaleRowFormValues => {
  return {
    price_list: priceList,
    quantity: 1,
    unit_price: priceList.price,
    percentage_discount: 0,
    absolute_discount: 0,
    total: priceList.price,
    start_date: startDate,
  };
}

const createProductWithExpiry = (priceList: any, startDate: Date): SaleRowFormValues => {
  // For BaseProduct and CourseProduct
  return {
    price_list: priceList,
    quantity: 1,
    unit_price: priceList.price,
    percentage_discount: 0,
    absolute_discount: 0,
    total: priceList.price,
    start_date: startDate,
  };
}
