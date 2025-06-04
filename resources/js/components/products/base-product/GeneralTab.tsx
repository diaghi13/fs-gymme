import React from 'react';
import { Formik, FormikConfig } from 'formik';
import { router } from '@inertiajs/react';
import { BaseProduct, CourseProduct } from '@/types';
import GeneralForm from '@/components/products/forms/GeneralForm';

interface GeneralFormProps {
    product: BaseProduct | CourseProduct;
    onDismiss: () => void;
}

export default function GeneralTab({ product, onDismiss }: GeneralFormProps) {

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
                    route('base-products.store'),
                    values,
                    { preserveState: false }
                );
            } else {
                router.patch(
                    route('base-products.update', { ['base_product']: product.id }),
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
