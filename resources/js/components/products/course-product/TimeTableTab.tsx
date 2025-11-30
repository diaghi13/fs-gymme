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
  const [selectedPlanningId, setSelectedPlanningId] = React.useState<number | null>(null);

  // Find selected planning or get current active planning
  const getInitialPlanning = () => {
    if (!product.plannings || product.plannings.length === 0) {
      return null;
    }

    // Try to find selected planning
    const selected = product.plannings.find(p => p.selected);
    if (selected) {
      return selected;
    }

    // Otherwise find current planning based on today's date
    const today = new Date();
    const current = product.plannings.find(p => {
      const start = new Date(p.from_date);
      const end = new Date(p.to_date);
      return today >= start && today <= end;
    });

    return current || null;
  };

  const initialPlanning = getInitialPlanning();

  const formik: FormikConfig<{
    planning_id: number | null;
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
      planning_id: initialPlanning?.id || null,
      from_date: initialPlanning?.from_date ? new Date(initialPlanning.from_date) : null,
      to_date: initialPlanning?.to_date ? new Date(initialPlanning.to_date) : null,
      details: initialPlanning?.details?.map(detail => ({
        day: { value: detail.day, label: detail.day },
        time: new Date(`2000-01-01T${detail.time}`),
        duration_in_minutes: detail.duration_in_minutes,
        instructor_id: detail.instructor_id?.toString() || '',
        room_id: detail.room_id?.toString() || ''
      })) || [],
    },
    onSubmit: (values) => {
      if (!values.from_date || !values.to_date) {
        return;
      }

      const data = {
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

      if (values.planning_id) {
        // Update existing planning
        router.put(
          route('app.course-products.plannings.update', {
            course_product: product.id,
            planning: values.planning_id,
            tenant: currentTenantId
          }),
          data,
          { preserveState: false }
        );
      } else {
        // Create new planning
        router.post(
          route('app.course-products.plannings.store', {
            course_product: product.id,
            tenant: currentTenantId
          }),
          data,
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  }

  return (
    <Formik {...formik}>
      <TimetableForm product={product} planningOptions={planningOptions} />
    </Formik>
  )
};
