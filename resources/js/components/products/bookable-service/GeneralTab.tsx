import React from 'react';
import { Formik, FormikConfig } from 'formik';
import { router, usePage } from '@inertiajs/react';
import { BookableService, PageProps } from '@/types';
import GeneralForm from '@/components/products/forms/BookableServiceGeneralForm';
import { RequestPayload } from '@inertiajs/core';

interface GeneralFormProps {
  service: BookableService;
  onDismiss: () => void;
}

export default function GeneralTab({ service, onDismiss }: GeneralFormProps) {
  const { currentTenantId } = usePage<PageProps>().props;

  const formik: FormikConfig<{
    name: string;
    color: string;
    description: string;
    short_description: string;
    duration_minutes: number;
    requires_trainer: boolean;
    is_active: boolean;
    settings: BookableService['settings'];
  }> = {
    initialValues: {
      name: service.name ?? '',
      color: service.color ?? '',
      description: service.description ?? '',
      short_description: service.short_description ?? '',
      duration_minutes: service.duration_minutes ?? 60,
      requires_trainer: service.requires_trainer ?? true,
      is_active: service.is_active,
      settings: service.settings ?? {
        booking: {
          advance_days: 7,
          min_advance_hours: 2,
          cancellation_hours: 24,
          max_per_day: null,
          buffer_minutes: 15,
        },
        availability: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          time_slots: [],
          blackout_dates: [],
        },
        requirements: {
          requires_trainer: true,
          requires_equipment: false,
          requires_room: false,
          min_preparation_minutes: 0,
        },
      }
    },
    onSubmit: (values) => {
      if (!service.id) {
        router.post(
          route('app.bookable-services.store', { tenant: currentTenantId }),
          values,
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.bookable-services.update', { bookable_service: service.id, tenant: currentTenantId }),
          { ...service, ...values } as unknown as RequestPayload,
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  };

  return (
    <Formik {...formik}>
      <GeneralForm onDismiss={onDismiss} />
    </Formik>
  );
};