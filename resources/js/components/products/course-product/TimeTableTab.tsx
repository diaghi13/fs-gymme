import React from "react";
import {Formik, FormikConfig} from "formik";
import { AutocompleteOptions, CourseProduct } from '@/types';
import TimetableForm from '@/components/products/forms/TimeTableForm';

interface TimetableFormProps {
  product: CourseProduct;
  planningOptions: AutocompleteOptions<number>
}

export default function TimetableTab({product, planningOptions}: TimetableFormProps) {

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
    onSubmit: (/*values*/) => {
      // TODO: change post and update method with xhr
      // const newValues: any = {
      //   ...product,
      //   plannings: [
      //     ...product.plannings!,
      //     {
      //       ...values,
      //       from_date: format(values.from_date, "yyyy-MM-dd"),
      //       to_date: format(values.to_date, "yyyy-MM-dd"),
      //       details: values.details.map((detail: ProductPlanningDetails) => ({
      //         ...detail,
      //         day: detail.day.value,
      //         time: format(new Date(detail.time), "HH:mm:ss"),
      //       }))
      //     }]
      // }

      /*router.patch(
        route('products.update', {type: product.type, product: product.id!}),
        newValues
      )*/
    },
  }

  return (
    <Formik {...formik}>
      <TimetableForm product={product} planningOptions={planningOptions} />
    </Formik>
  )
};
