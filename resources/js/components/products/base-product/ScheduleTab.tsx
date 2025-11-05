import React from 'react';
import { Formik, FormikConfig } from 'formik';
import { format } from 'date-fns/format';
import { BaseProduct } from '@/types';
import { route } from 'ziggy-js';
import ScheduleForm from '@/components/products/forms/ScheduleForm';
import { scheduleOptions } from '@/components/products';
import { router, usePage } from '@inertiajs/react';
import { RequestPayload } from '@inertiajs/core';
import { BaseProductPageProps } from '@/pages/products/base-products';


const parseTime = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

interface ScheduleTabProps {
  product: BaseProduct;
  onDismiss: () => void;
  tab: string | number;
}

export default function ScheduleTab({ product, onDismiss, tab }: ScheduleTabProps) {
  const { currentTenantId } = usePage<BaseProductPageProps>().props;

  // Safely extract operating_hours with null checks
  const operatingHoursData = product.settings?.facility?.operating_hours || [];

  const parseOperatingHours = function(operatingHours: { day: string, open: string, close: string }[]): {
    day: { label: string, value: string },
    open: Date,
    close: Date
  }[] {
    if (!operatingHours || operatingHours.length === 0) {
      return [];
    }

    return operatingHours.map(({ day, open, close }) => {
      const dayOption = scheduleOptions.find(option => option.value === day);
      if (!dayOption) {
        throw new Error(`Invalid day value: ${day}`);
      }
      return {
        day: dayOption,
        open: parseTime(open),
        close: parseTime(close)
      };
    });
  }(operatingHoursData);

  const formik: FormikConfig<{
    is_schedulable: boolean;
    operating_hours: { day: { label: string, value: string }; open: Date; close: Date }[];
  }> = {
    initialValues: {
      is_schedulable: parseOperatingHours.length > 0,
      operating_hours: parseOperatingHours.length > 0
        ? parseOperatingHours
        : []
    },
    onSubmit: (values) => {
      if (product.id) {
        const operatingHours = values.operating_hours.map(({ day, open, close }) => ({
          day: day.value,
          open: format(open, 'HH:mm:ss'),
          close: format(close, 'HH:mm:ss')
        }));

        const updatedSettings = {
          ...(product.settings || {}),
          facility: {
            ...(product.settings?.facility || {}),
            operating_hours: values.is_schedulable ? operatingHours : []
          }
        };

        const data = {
          ...product,
          settings: updatedSettings
        };

        router.patch(
          route('app.base-products.update', { base_product: product.id, tenant: currentTenantId, tab }),
          data as unknown as RequestPayload,
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  };

  return (
    <Formik {...formik}>
      <ScheduleForm onDismiss={onDismiss} />
    </Formik>
  );
};
