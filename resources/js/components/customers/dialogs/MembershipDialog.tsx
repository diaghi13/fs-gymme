import React from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { Formik, FormikConfig } from 'formik';
import { Membership } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { RequestPayload } from '@inertiajs/core';
import MembershipForm from '@/components/customers/forms/MembershipForm';

interface MembershipDialogProps {
  membership: Membership;
  open: boolean;
  onClose: () => void;
}

export default function MembershipDialog({ membership, open, onClose }: MembershipDialogProps) {
  const { customer } = usePage<CustomerShowProps>().props;

  const formik: FormikConfig<Partial<Membership>> = {
    initialValues: {
      start_date: new Date(membership.start_date),
      end_date: membership?.end_date ? new Date(membership.end_date) : null,
      card_number: membership?.card_number ?? '',
      notes: membership?.notes ?? ''
    },
    onSubmit: (values) => {
      if (!membership?.id) {
        router.post(
          route('app.customers.memberships.store', { customer: customer.id }),
          values as unknown as RequestPayload,
          {
            preserveState: false,
            preserveScroll: true
          }
        );
      } else {
        router.patch(
          route(
            'customers.memberships.update',
            { customerSubscription: membership.id }
          ),
          values as unknown as RequestPayload,
          {
            preserveState: false,
            preserveScroll: true
          }
        );
      }
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth={'sm'} onClose={onClose}>
      <DialogTitle>
        Tesseramento
      </DialogTitle>
      <Formik {...formik}>
        <MembershipForm onClose={onClose} />
      </Formik>
    </Dialog>
  );
};
