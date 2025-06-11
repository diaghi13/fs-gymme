import * as React from 'react';
import { Customer } from '@/types';
import { Formik, FormikConfig, FormikProps } from 'formik';
import CustomerForm from '@/components/customers/forms/CustomerForm';
import Dialog from '@/components/ui/Dialog';

interface EditCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
}

const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({ open, onClose, customer }) => {
  const formikRef = React.useRef<FormikProps<Partial<Customer>>>(null);
  const formik: FormikConfig<Partial<Customer>> = {
    initialValues: {
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      birth_date: customer.birth_date ? new Date(customer.birth_date) : null,
      gender: customer.gender || 'female',
      birthplace: customer.birthplace || '',
      tax_id_code: customer.tax_id_code || '',
      email: customer.email || '',
      phone: customer.phone || '',
      street: customer.street || '',
      number: customer.number || '',
      city: customer.city || '',
      zip: customer.zip || '',
      province: customer.province || '',
      country: customer.country || 'Italia'
    },
    onSubmit: (values, { setSubmitting }) => {
      // Here you would typically handle the form submission, e.g., send data to an API
      console.log('Form submitted with values:', values);
      setSubmitting(false);
      onClose(); // Close the dialog after submission
    }
  };

  return (
    <Formik {...formik}>
      <Dialog
        open={open}
        onClose={onClose}
        title="Modifica cliente"
        fullWidth
        maxWidth="md"
        isForm
      >
        <CustomerForm customer={customer} formTitle="Modifica cliente" onDismiss={onClose} />
      </Dialog>
    </Formik>
  );
};

export default EditCustomerDialog;
