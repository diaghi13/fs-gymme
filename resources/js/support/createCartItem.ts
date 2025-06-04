import {
  AllPriceLists,
  PriceListArticle,
  PriceListMembershipFee,
  PriceListSubscription,
  PriceListSubscriptionContent
} from '@/types';
import { ARTICLE, MEMBERSHIP, SUBSCRIPTION } from '@/pages/price-lists/price-lists';

export interface SaleRowFormValues {
  price_list: PriceListArticle | PriceListMembershipFee | PriceListSubscription;
  quantity: number;
  unit_price: number;
  percentage_discount: number;
  absolute_discount: number;
  total: number;

  start_date?: Date | null;
  subscription_selected_content?: PriceListSubscriptionContent[];
}

export const createCartItem = (priceList: AllPriceLists, startDate: Date | number | null = null, options: PriceListSubscriptionContent[] = []): SaleRowFormValues | SaleRowFormValues[] | undefined => {
  if (priceList.type === ARTICLE) {
    return createArticle(priceList);
  }

  if (!startDate) {
    alert('Inserisci una data di inizio')
    throw new Error("No start date provided for subscription calculation");
  }

  if (priceList.type === MEMBERSHIP) {
    return createMembership(priceList, new Date(startDate));
  }

  if (priceList.type === SUBSCRIPTION) {
    return createSubscription(priceList, new Date(startDate), options);
  }
}

const createArticle = (priceList: PriceListArticle): SaleRowFormValues => {
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
  const content = [...priceList.standard_content, ...options];
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
