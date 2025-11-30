import * as React from 'react';
import { Formik, FormikConfig } from 'formik';
import OnlineForm from '@/components/products/forms/OnlineForm';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { RequestPayload } from '@inertiajs/core';
import { Product } from '@/types';
import { BaseProductPageProps } from '@/pages/products/base-products';

interface OnlineTabProps {
  product: Product;
  onDismiss: () => void;
  tab?: string | number;
}

const OnlineTab : React.FC<OnlineTabProps> = ({product, onDismiss, tab}) => {
  const { currentTenantId } = usePage<BaseProductPageProps>().props;

  const formik: FormikConfig<{description: string, short_description: string}> = {
    initialValues: {
      description: product.description || '',
      short_description: product.short_description || ''
    },
    onSubmit: (values) => {
      const data = {
        ...product,
        description: values.description,
        short_description: values.short_description
      };
      router.patch(
        route('app.base-products.update', { base_product: product.id, tenant: currentTenantId, tab }),
        data as unknown as RequestPayload,
        { preserveState: false }
      );
    },
  }
  return (
   <Formik {...formik}>
     <OnlineForm onDismiss={onDismiss} />
   </Formik>
 );
};

export default OnlineTab
