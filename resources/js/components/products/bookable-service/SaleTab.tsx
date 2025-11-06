import React from 'react';
import { Formik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import { BookableService, VatRate } from '@/types';
import SaleForm from '@/components/products/forms/SaleForm';
import { router, usePage } from '@inertiajs/react';
import { BookableServicePageProps } from '@/pages/products/bookable-services';
import { RequestPayload } from '@inertiajs/core';

interface SaleTabProps {
  service: BookableService;
  onDismiss: () => void;
}

export default function SaleTab({ service, onDismiss }: SaleTabProps) {
  const { currentTenantId } = usePage<BookableServicePageProps>().props;

  const formik: FormikConfig<{
    saleable_in_subscription: boolean;
    vat_rate: VatRate | null;
    selling_description: string;
  }> = {
    initialValues: {
      saleable_in_subscription: service.saleable_in_subscription!,
      vat_rate: service.vat_rate ?? null,
      selling_description: service.selling_description!
    },
    validationSchema: Yup.object({
      'selling_description': Yup.string().required('Il campo è richiesto')
    }),
    onSubmit: (values) => {
      const data = {
        saleable_in_subscription: values.saleable_in_subscription,
        vat_rate: values.vat_rate ? { value: values.vat_rate.id } : null,
        selling_description: values.selling_description
      };

      router.patch(
        route('app.bookable-services.sales.update', { bookable_service: service.id, tenant: currentTenantId }),
        data as unknown as RequestPayload,
        { preserveState: false }
      );
    },
    enableReinitialize: true
  };

  return (
    <Formik {...formik}>
      <SaleForm onDismiss={onDismiss} />
    </Formik>
  );
}
