import React, { useEffect } from 'react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { Subscription } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Formik, FormikConfig } from 'formik';
import { useState } from 'react';
import { RequestPayload } from '@inertiajs/core';
import Dialog from '@/components/ui/Dialog';
import EditSubscriptionForm from '@/components/customers/forms/EditSubscriptionForm';

interface EditSubscriptionDialogProps {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
}

const EditSubscriptionDialog : React.FC<EditSubscriptionDialogProps> = ({subscription, open, onClose}) => {
  const [firstRender, setFirstRender] = useState(true);
  const {props: {customer}} = usePage<CustomerShowProps>();
  const formik: FormikConfig<Partial<Subscription>> = {
    initialValues: {
      start_date: subscription.start_date && new Date(subscription.start_date),
      end_date: subscription.end_date ? new Date(subscription.end_date) : null,
      notes: subscription.notes ?? "",
    },
    onSubmit: (values) => {
      router.patch(
        route('customer-subscriptions.update', {customer: customer.id, subscription: subscription.id!}),
        values as unknown as RequestPayload,
        {
          preserveState: false,
          preserveScroll: true,
        }
      );

      onClose();
    }
  }

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    }
  }, [firstRender]);

  return (
    <Dialog
      open={open}
      maxWidth={"xs"}
      fullWidth
      onClose={onClose}
      title={`${subscription.entity?.name} - ${subscription.price_list?.name}`}
      hasActions={false}
    >
      <Formik {...formik}>
        <EditSubscriptionForm onClose={onClose} subscription={subscription} />
      </Formik>
    </Dialog>
  )
};

export default EditSubscriptionDialog
