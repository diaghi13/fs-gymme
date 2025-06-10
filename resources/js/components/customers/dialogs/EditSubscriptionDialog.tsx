import React, { useEffect } from 'react';
import { Grid, DialogActions, Button, TextField } from '@mui/material';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { Subscription } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Formik, Form, FormikConfig } from 'formik';
import { useState } from 'react';
import { RequestPayload } from '@inertiajs/core';
import Dialog from '@/components/ui/Dialog';
import DatePicker from '@/components/ui/DatePicker';

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
      start_date: subscription.start_date ? new Date(subscription.start_date) : null,
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
        {({values, setFieldValue}) => {
          useEffect(() => {
            if (!firstRender) {
              let oldFrom = values.from;

              if (subscription.duration?.days) {
                oldFrom = addDays(oldFrom!, subscription.duration?.days);
              }

              if (subscription.duration?.months) {
                oldFrom = addMonths(oldFrom!, subscription.duration?.months);
              }

              setFieldValue("to", oldFrom);
            }
          }, [values.from])

          return (
            <Form>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <DatePicker label={"Dal"} name={'from'}/>
                </Grid>
                <Grid size={6}>
                  <DatePicker label={"Al"} name={'to'}/>
                </Grid>
                <Grid size={12}>
                  <TextField label={"Note"} name={"notes"} multiline/>
                </Grid>
              </Grid>
              <DialogActions sx={{mt: 2}}>
                <Button onClick={onClose}>Annulla</Button>
                <Button type={"submit"} variant={"contained"}>
                  Salva
                </Button>
              </DialogActions>
            </Form>
          )
        }}
      </Formik>
    </Dialog>
  )
};

export default EditSubscriptionDialog
