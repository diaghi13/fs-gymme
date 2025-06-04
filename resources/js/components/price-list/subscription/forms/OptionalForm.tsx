import React from 'react';
import { Form } from 'formik';
import { Button, Grid } from '@mui/material';
import SubscriptionTable from '@/components/price-list/subscription/content-table/SubscriptionTable';
import FormikSaveButton from '@/components/ui/FormikSaveButton';

interface SubscriptionGeneralFormProps {
  onDismiss: () => void;
}

const GeneralForm: React.FC<SubscriptionGeneralFormProps> = ({ onDismiss }) => {
  return (
    <Form>
      <>
        <Grid container spacing={4}>
          <Grid size={12}>
            <SubscriptionTable contentType={'optional'} />
          </Grid>
          <Grid size={12} sx={{ textAlign: 'end' }}>
            <Button size="small" sx={{ marginRight: 2 }} onClick={onDismiss}>Annulla</Button>
            <FormikSaveButton />
          </Grid>
        </Grid>
      </>
    </Form>
  );
};

export default GeneralForm;
