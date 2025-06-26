import React from 'react';
import { Formik, FormikConfig } from 'formik';
import {
  AutocompleteOption,
  PriceListArticle, PriceListMembershipFee,
  PriceListSubscription,
  Product
} from '@/types';
import { router, usePage } from '@inertiajs/react';
import GeneralForm from '@/components/price-list/subscription/forms/GeneralForm';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';

export type SubscriptionGeneralFormValues = {
  type: string;
  name: string;
  color: string;
  saleable: boolean;
  parent_id: string | number | null;
  standard_content: Array<SubscriptionGeneralFormValuesWithContent>;
  optional_content: Array<SubscriptionGeneralFormValuesWithContent>;
}

export type SubscriptionGeneralFormValuesWithContent = {
  id?: number,
  days_duration: number | null,
  months_duration: number | null,
  price: number | null,
  vat_rate_id: number | null,
  vat_rate: AutocompleteOption<number> | null,
  entrances?: number | null,
  daily_access?: number | null,
  weekly_access?: number | null,
  reservation_limit?: number | null,
  daily_reservation_limit?: number | null,
  is_optional: boolean,
  price_listable_id: number,
  price_listable_type: 'App\\Models\\Product\\Product' | 'App\\Models\\PriceList\\PriceList',
  price_listable: Product | PriceListMembershipFee | PriceListArticle,

  isDirty: boolean
}

interface SubscriptionGeneralFormProps {
  priceList: PriceListSubscription;
}

export default function SubscriptionGeneralTab({ priceList }: SubscriptionGeneralFormProps) {
  const {vatRateOptions} = usePage<PriceListPageProps>().props;

  const formik: FormikConfig<Partial<SubscriptionGeneralFormValues>> = {
    initialValues: {
      type: priceList.type,
      name: priceList.name ?? '',
      color: priceList.color ?? '',
      saleable: priceList.saleable ?? true,
      parent_id: priceList.parent_id ?? '',
      standard_content: priceList.standard_content.map((content) => ({
        ...content,
        isDirty: false,
        vat_rate: vatRateOptions!.find((option) => option.value === content.vat_rate_id)!
      })),
    },
    onSubmit: (values) => {
      const data = {
        ...values,
        standard_content: values.standard_content!.map((content) => ({
          ...content,
          months_duration: content.months_duration ?? null,
          vat_rate_id: content.vat_rate?.value ?? null,
          vat_rate: undefined
        }))
      };

      if (!priceList.id) {
        router.post(
          route('app.price-lists.subscriptions.store'),
          data as any,
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.price-lists.subscriptions.update', { subscription: priceList.id }),
          data as any,
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  };

  const handleDismiss = () => {
    router.get(
      route('app.price-lists.index', ),
      undefined,
      { preserveState: true }
    );
  };

  return (
    <Formik {...formik}>
      <GeneralForm onDismiss={handleDismiss} />
    </Formik>
  );
};
