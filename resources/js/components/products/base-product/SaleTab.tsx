import React from "react";
import {Formik, FormikConfig} from "formik";
import * as Yup from "yup";
import { AutocompleteOption, BaseProduct, CourseProduct } from '@/types';
import SaleForm from '@/components/products/forms/SaleForm';
import { router, usePage } from '@inertiajs/react';
import { BaseProductPageProps } from '@/pages/products/base-products';
import { CourseProductPageProps } from '@/pages/products/course-products';

interface SellingFormProps {
  product: BaseProduct | CourseProduct;
  onDismiss: () => void
}

export default function SaleTab({product, onDismiss}: SellingFormProps) {
  const { props } = usePage<BaseProductPageProps | CourseProductPageProps>();

  const formik: FormikConfig<{
    sale_in_subscription: boolean;
    vat_rate: AutocompleteOption<number> | null;
    selling_description: string;
  }> = {
    initialValues: {
      sale_in_subscription: product.sale_in_subscription!,
      vat_rate: product.vat_rate ? props.vatRateOptions!.find(option => option.value === product.vat_rate?.id) ?? null : null,
      selling_description: product.selling_description!,
    },
    validationSchema: Yup.object({
      //"vat": Yup.object().required("Il campo è richiesto"),
      "selling_description": Yup.string().required("Il campo è richiesto"),
    }),
    onSubmit: (values) => {
      router.patch(
        route('base-products.sales.update', {product: product.id!}),
        values,
        {
          preserveScroll: true,
          preserveState: false,
        }
      )
    },
    enableReinitialize: true,
  }

  return (
    <Formik {...formik}>
      <SaleForm onDismiss={onDismiss} />
    </Formik>
  )
};
