import React from 'react';
import { Formik, FormikConfig } from 'formik';
import {
  AutocompleteOption,
  BookableService,
  PriceListArticle,
  PriceListMembershipFee,
  PriceListToken,
  PriceListGiftCard,
  PriceListDayPass,
  PriceListSubscription,
  Product
} from '@/types';
import { router, usePage } from '@inertiajs/react';
import GeneralForm from '@/components/price-list/subscription/forms/GeneralForm';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import { RequestPayload } from '@inertiajs/core';

export type SubscriptionGeneralFormValues = {
  type: string;
  name: string;
  color: string;
  saleable: boolean;
  parent_id: string | number | null;
  standard_content: Array<SubscriptionGeneralFormValuesWithContent>;
  optional_content: Array<SubscriptionGeneralFormValuesWithContent>;

  // Subscription-level benefits
  guest_passes_total?: number | null;
  guest_passes_per_month?: number | null;
  multi_location_access?: boolean;
}

export type SubscriptionGeneralFormValuesWithContent = {
  id?: number;
  days_duration: number | null;
  months_duration: number | null;
  price: number | null;
  vat_rate_id: number | null;
  vat_rate: AutocompleteOption<number> | null;
  entrances?: number | null;
  is_optional: boolean;
  price_listable_id: number;
  price_listable_type:
    // PRODUCTS (3)
    | 'App\\Models\\Product\\BaseProduct'
    | 'App\\Models\\Product\\CourseProduct'
    | 'App\\Models\\Product\\BookableService'
    // PRICELISTS (5)
    | 'App\\Models\\PriceList\\Article'
    | 'App\\Models\\PriceList\\Membership'
    | 'App\\Models\\PriceList\\Token'
    | 'App\\Models\\PriceList\\DayPass'
    | 'App\\Models\\PriceList\\GiftCard';
  price_listable: Product | BookableService | PriceListMembershipFee | PriceListArticle | PriceListToken | PriceListGiftCard | PriceListDayPass;

  // Access rules
  unlimited_entries?: boolean;
  total_entries?: number | null;
  daily_entries?: number | null;
  weekly_entries?: number | null;
  monthly_entries?: number | null;

  // Booking rules
  max_concurrent_bookings?: number | null;
  daily_bookings?: number | null;
  weekly_bookings?: number | null;
  advance_booking_days?: number | null;
  cancellation_hours?: number | null;

  // Validity rules
  validity_type?: 'duration' | 'fixed_date' | 'first_use';
  validity_days?: number | null;
  validity_months?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  freeze_days_allowed?: number | null;
  freeze_cost_cents?: number | null;

  // Time restrictions
  has_time_restrictions?: boolean;
  time_restrictions?: Array<{
    id?: number;
    days?: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> | null;
    start_time?: string | null;
    end_time?: string | null;
    restriction_type?: 'allowed' | 'blocked';
    description?: string | null;
  }>;

  // Service access
  service_access_type?: 'all' | 'included' | 'excluded';
  services?: Array<{
    id: number;
    usage_limit?: number | null;
    usage_period?: 'day' | 'week' | 'month' | null;
  }>;

  // Benefits & perks

  // Metadata
  sort_order?: number;
  settings?: Record<string, unknown> | null;

  // Legacy fields (backward compatibility)
  daily_access?: number | null;
  weekly_access?: number | null;
  reservation_limit?: number | null;
  daily_reservation_limit?: number | null;

  isDirty: boolean;
}

interface SubscriptionGeneralFormProps {
  priceList: PriceListSubscription;
}

export default function SubscriptionGeneralTab({ priceList }: SubscriptionGeneralFormProps) {
  const {vatRateOptions, currentTenantId} = usePage<PriceListPageProps>().props;

  const formik: FormikConfig<Partial<SubscriptionGeneralFormValues>> = {
    initialValues: {
      type: priceList.type,
      name: priceList.name ?? '',
      color: priceList.color ?? '',
      saleable: priceList.saleable ?? true,
      parent_id: priceList.parent_id ?? '',
      guest_passes_total: priceList.guest_passes_total ?? null,
      guest_passes_per_month: priceList.guest_passes_per_month ?? null,
      multi_location_access: priceList.multi_location_access ?? false,
      standard_content: priceList.standard_content.map((content) => ({
        ...content,
        price_listable_type: content.price_listable_type as SubscriptionGeneralFormValuesWithContent['price_listable_type'],
        isDirty: false,
        vat_rate: vatRateOptions!.find((option) => option.value === content.vat_rate_id)!
      })),
    },
    onSubmit: (values) => {
      const data = {
        ...values,
        standard_content: values.standard_content!.map((content) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { vat_rate, price_listable, isDirty, ...contentData } = content;
          return {
            ...contentData,
            vat_rate_id: vat_rate?.value ?? null,
            // Ensure all optional fields are properly set to null if undefined
            months_duration: content.months_duration ?? null,
            days_duration: content.days_duration ?? null,
            entrances: content.entrances ?? null,
            unlimited_entries: content.unlimited_entries ?? false,
            total_entries: content.total_entries ?? null,
            daily_entries: content.daily_entries ?? null,
            weekly_entries: content.weekly_entries ?? null,
            monthly_entries: content.monthly_entries ?? null,
            max_concurrent_bookings: content.max_concurrent_bookings ?? null,
            daily_bookings: content.daily_bookings ?? null,
            weekly_bookings: content.weekly_bookings ?? null,
            advance_booking_days: content.advance_booking_days ?? null,
            cancellation_hours: content.cancellation_hours ?? null,
            validity_type: content.validity_type ?? 'duration',
            validity_days: content.validity_days ?? null,
            validity_months: content.validity_months ?? null,
            valid_from: content.valid_from ?? null,
            valid_to: content.valid_to ?? null,
            freeze_days_allowed: content.freeze_days_allowed ?? null,
            freeze_cost_cents: content.freeze_cost_cents ?? null,
            has_time_restrictions: content.has_time_restrictions ?? false,
            time_restrictions: content.time_restrictions ?? [],
            service_access_type: content.service_access_type ?? 'all',
            services: content.services ?? [],
            sort_order: content.sort_order ?? 0,
            settings: content.settings ?? null,
          };
        })
      };

      if (!priceList.id) {
        router.post(
          route('app.price-lists.subscriptions.store', { tenant: currentTenantId }),
          data as unknown as RequestPayload,
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.price-lists.subscriptions.update', { subscription: priceList.id, tenant: currentTenantId }),
          data as unknown as RequestPayload,
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  };

  const handleDismiss = () => {
    router.get(
      route('app.price-lists.index', { tenant: currentTenantId }),
      undefined,
      { preserveState: false }
    );
  };

  return (
    <Formik {...formik}>
      <GeneralForm onDismiss={handleDismiss} />
    </Formik>
  );
};
