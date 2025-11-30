import React from 'react';
import { Formik, FormikConfig } from 'formik';
import { router, usePage } from '@inertiajs/react';
import { BaseProduct, CourseProduct, PageProps } from '@/types';
import GeneralForm from '@/components/products/forms/GeneralForm';
import { RequestPayload } from '@inertiajs/core';

interface GeneralFormProps {
  product: BaseProduct | CourseProduct;
  onDismiss: () => void;
}

export default function GeneralTab({ product, onDismiss }: GeneralFormProps) {
  const { currentTenantId } = usePage<PageProps>().props;

  const formik: FormikConfig<{
    name: string;
    color: string;
    description: string;
    short_description: string;
    is_active: boolean;
  }> = {
    initialValues: {
      name: product.name ?? '',
      color: product.color ?? '',
      description: product.description ?? '',
      short_description: product.short_description ?? '',
      is_active: product.is_active
    },
    onSubmit: (values) => {
      if (!product.id) {
        router.post(
          route('app.base-products.store', { tenant: currentTenantId }),
          values,
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.base-products.update', { base_product: product.id, tenant: currentTenantId }),
          { ...product, ...values } as unknown as RequestPayload,
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
