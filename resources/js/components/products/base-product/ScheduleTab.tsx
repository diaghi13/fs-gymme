import React from 'react';
import { Formik, FormikConfig } from 'formik';
import { format } from 'date-fns/format';
import { router } from '@inertiajs/react';
import { BaseProduct, ProductSchedule } from '@/types';
import ScheduleForm from '@/components/products/forms/ScheduleForm';
import { scheduleOptions } from '@/components/products';

interface ScheduleFormProps {
    product: BaseProduct;
    onDismiss: () => void;
}

export const normalizeSchedule = (schedule: ProductSchedule): ProductSchedule => {
    let from_time = schedule.from_time;
    let to_time = schedule.to_time;

    if (typeof schedule.from_time === 'string') {
        const parts = schedule.from_time.split(':').map((number: string) => parseInt(number));
        from_time = new Date().setHours(parts[0], parts[1], parts[2]);
    }

    if (typeof schedule.to_time === 'string') {
        const parts = schedule.to_time.split(':').map((number: string) => parseInt(number));
        to_time = new Date().setHours(parts[0], parts[1], parts[2]);
    }

    if (typeof schedule.from_time === 'number') {
        from_time = new Date(schedule.from_time);
    }

    if (typeof schedule.to_time === 'number') {
        to_time = new Date(schedule.to_time);
    }

    const day = scheduleOptions.find(option => option.value === schedule.day)!;

    return {
        ...schedule,
        day,
        from_time,
        to_time
    };
};

export const normalizeScheduleToSave = (schedule: ProductSchedule) => {
    let day = schedule.day;
    let from_time = schedule.from_time;
    let to_time = schedule.to_time;

    if (from_time instanceof Date || typeof from_time === 'number') {
        from_time = format(from_time, 'HH:mm:ss');
    }

    if (to_time instanceof Date || typeof to_time === 'number') {
        to_time = format(to_time, 'HH:mm:ss');
    }

    if (typeof day === 'object') {
        day = day.value;
    }

    return {
        ...schedule,
        day,
        from_time,
        to_time
    };
}

export default function ScheduleTab({ product, onDismiss }: ScheduleFormProps) {
    const formik: FormikConfig<{
        is_schedulable: boolean,
        product_schedules: ProductSchedule[]
    }> = {
        initialValues: {
            is_schedulable: product.is_schedulable,
            product_schedules: product.product_schedules && product.product_schedules.map(normalizeSchedule)
        },
        onSubmit: (values) => {
            router.post(
                route('base-products.schedules.store', { product: product.id }),
                { schedules: values.product_schedules.map(normalizeScheduleToSave) },
                {
                    preserveState: true,
                    preserveScroll: true
                }
            );
        },
        enableReinitialize: true
    };

    return (
        <Formik {...formik}>
            <ScheduleForm onDismiss={onDismiss} />
        </Formik>
    );
};
