import React from 'react';
import { Formik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import { AutocompleteOption, BaseProduct, CourseProduct, VatRate } from '@/types';
import SaleForm from '@/components/products/forms/SaleForm';
import { router, usePage } from '@inertiajs/react';
import { BaseProductPageProps } from '@/pages/products/base-products';
import { CourseProductPageProps } from '@/pages/products/course-products';
import { RequestPayload } from '@inertiajs/core';

interface SellingFormProps {
  product: BaseProduct | CourseProduct;
  onDismiss: () => void;
}

export default function SaleTab({ product, onDismiss }: SellingFormProps) {
  const { currentTenantId } = usePage<BaseProductPageProps | CourseProductPageProps>().props;

  const formik: FormikConfig<{
    saleable_in_subscription: boolean;
    vat_rate: VatRate | null;
    selling_description: string;
  }> = {
    initialValues: {
      saleable_in_subscription: product.saleable_in_subscription!,
      vat_rate: product.vat_rate ?? null,
      selling_description: product.selling_description!
    },
    validationSchema: Yup.object({
      //"vat": Yup.object().required("Il campo è richiesto"),
      'selling_description': Yup.string().required('Il campo è richiesto')
    }),
    onSubmit: (values) => {
      const data = {
        ...product,
        ...values,
        vat_rate_id: values.vat_rate?.id ?? null
      };

      router.patch(
        route('app.course-products.update', { course_product: product.id!, tenant: currentTenantId, tab: '4' }),
        data as unknown as RequestPayload,
        {
          preserveScroll: true,
          preserveState: false
        }
      );
    },
    enableReinitialize: true
  };

  return (
    <Formik {...formik}>
      <SaleForm onDismiss={onDismiss} />
    </Formik>
  );
};
