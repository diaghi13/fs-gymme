import React from "react";
import {Formik, FormikConfig} from "formik";
import { format } from 'date-fns/format';
import { AutocompleteOptions, CourseProduct } from '@/types';
import TimetableForm from '@/components/products/forms/TimeTableForm';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { CourseProductPageProps } from '@/pages/products/course-products';

interface TimetableFormProps {
  product: CourseProduct;
  planningOptions: AutocompleteOptions<number>
}

export default function TimetableTab({product, planningOptions}: TimetableFormProps) {
  const { currentTenantId } = usePage<CourseProductPageProps>().props;

  const formik: FormikConfig<{
    name: string;
    from_date: Date | null;
    to_date: Date | null;
    details: Array<{
      day: { value: string; label: string };
      time: Date;
      duration_in_minutes: number;
      instructor_id: string;
      room_id: string;
    }>;
  }> = {
    initialValues: {
      name: "",
      from_date: null,
      to_date: null,
      details: [],
    },
    onSubmit: (values) => {
      if (!values.from_date || !values.to_date) {
        return;
      }

      const data = {
        name: values.name,
        start_date: format(values.from_date, "yyyy-MM-dd"),
        end_date: format(values.to_date, "yyyy-MM-dd"),
        details: values.details.map((detail) => ({
          day: detail.day.value,
          time: format(new Date(detail.time), "HH:mm:ss"),
          duration_in_minutes: detail.duration_in_minutes,
          instructor_id: detail.instructor_id || null,
          room_id: detail.room_id || null,
        }))
      };

      router.post(
        route('app.course-products.plannings.store', {
          course_product: product.id,
          tenant: currentTenantId
        }),
        data,
        { preserveState: false }
      );
    },
    enableReinitialize: true
  }

  return (
    <Formik {...formik}>
      <TimetableForm product={product} planningOptions={planningOptions} />
    </Formik>
  )
};
