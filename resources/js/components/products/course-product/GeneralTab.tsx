import React from 'react';
import { Formik, FormikConfig } from 'formik';
import { router, usePage } from '@inertiajs/react';
import { BaseProduct, CourseProduct, PageProps } from '@/types';
import GeneralForm from '@/components/products/forms/GeneralForm';

interface GeneralFormProps {
  product: BaseProduct | CourseProduct;
  onDismiss: () => void;
}

export default function GeneralTab({ product, onDismiss }: GeneralFormProps) {
  const { currentTenantId } = usePage<PageProps>().props;

  const formik: FormikConfig<{
    name: string;
    color: string;
    visible: boolean;
  }> = {
    initialValues: {
      name: product.name ?? '',
      color: product.color ?? '',
      visible: product.visible
    },
    onSubmit: (values) => {
      if (!product.id) {
        router.post(
          route('app.course-products.store', { tenant: currentTenantId }),
          values,
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.course-products.update', { course_product: product.id, tenant: currentTenantId }),
          values,
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
