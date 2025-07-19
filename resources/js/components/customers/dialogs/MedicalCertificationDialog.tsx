import React from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { Formik, FormikConfig } from 'formik';
import { MedicalCertification } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import MedicalCertificationForm from '@/components/customers/forms/MedicalCertificationForm';
import { RequestPayload } from '@inertiajs/core';

interface MedicalCertificationDialogProps {
  medicalCertification: MedicalCertification;
  open: boolean;
  onClose: () => void;
}

export default function MedicalCertificationDialog(
  { medicalCertification, open, onClose }: MedicalCertificationDialogProps
) {
  const { customer, currentTenantId } = usePage<CustomerShowProps>().props;

  const formik: FormikConfig<MedicalCertification> = {
    initialValues: {
      id: medicalCertification?.id ?? undefined,
      certification_date: medicalCertification?.certification_date ? new Date(medicalCertification.certification_date) : null,
      valid_until: medicalCertification?.valid_until ? new Date(medicalCertification.valid_until) : null,
      notes: medicalCertification?.notes ?? ''
    },
    onSubmit: (values) => {
      if (!medicalCertification?.id) {
        router.post(
          route('app.customers.medical-certifications.store', { customer: customer.id, tenant: currentTenantId }),
          values as unknown as RequestPayload,
          {
            preserveState: false,
            preserveScroll: true
          }
        );
      } else {
        router.patch(
          route(
            'customers.medical-certifications.update',
            { customer: customer.id, medicalCertification: medicalCertification.id, tenant: currentTenantId }
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
        Certificato Medico
      </DialogTitle>
      <Formik {...formik}>
        <MedicalCertificationForm onClose={onClose} />
      </Formik>
    </Dialog>
  );
};
