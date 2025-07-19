import React from 'react';
import { Formik, FormikConfig } from 'formik';
import { AutocompleteOption, PriceListArticle, PriceListMembershipFee, PriceListSubscription, Product } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import OptionalForm from '@/components/price-list/subscription/forms/OptionalForm';
import { RequestPayload } from '@inertiajs/core';

export type SubscriptionGeneralFormValues = {
  type: string;
  name: string;
  color: string;
  visible: boolean;
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

export default function SubscriptionOptionalTab({ priceList }: SubscriptionGeneralFormProps) {
  const {vatRateOptions, currentTenantId} = usePage<PriceListPageProps>().props;

  const formik: FormikConfig<Partial<SubscriptionGeneralFormValues>> = {
    initialValues: {
      optional_content: priceList.optional_content.map((content) => ({
        ...content,
        isDirty: false,
        vat_rate: vatRateOptions!.find((option) => option.value === content.vat_rate_id)!
      })),
    },
    onSubmit: (values) => {
      const data = {
        optional_content: values.optional_content!.map((content) => ({
          ...content,
          months_duration: content.months_duration ?? null,
          vat_rate_id: content.vat_rate?.value ?? null,
          vat_rate: undefined
        }))
      };

      if (!priceList.id) {
        router.post(
          route('app.price-lists.subscriptions.optional-content.store', { tenant: currentTenantId }),
          data as unknown as RequestPayload,
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.price-lists.subscriptions.optional-content.update', { subscription: priceList.id, tenant: currentTenantId }),
          data as unknown as RequestPayload,
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
      <OptionalForm onDismiss={handleDismiss} />
    </Formik>
  );
};
