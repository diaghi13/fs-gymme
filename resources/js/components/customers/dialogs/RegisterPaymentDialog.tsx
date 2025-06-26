import {router, usePage} from "@inertiajs/react";
import {Form, Formik} from "formik";
import {DialogContent, Grid, Typography} from "@mui/material";
import {DateTimePicker} from "@mui/x-date-pickers";
import React from "react";
import { Payment, Sale } from '@/types';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { Str } from '@/support/Str';
import Dialog from '@/components/ui/Dialog';

interface RegisterPaymentDialogProps {
  sale: Sale;
  payment: Payment;
  open: boolean;
  onClose: () => void;
}

const RegisterPaymentDialog = ({sale, payment, open, onClose}: RegisterPaymentDialogProps) => {
  const {props: {customer}} = usePage<CustomerShowProps>();

  return (
    <Formik
      initialValues={{payed_at: new Date()}}
      onSubmit={(values) => {
        router.put(
          route('app.customer-sale-payments.update', {customer: customer.id, sale: sale.id, payment: payment.id}),
          values,
          {preserveScroll: true}
        )
        onClose();
      }}
    >
      {({submitForm, values, setFieldValue}) => (
        <Form>
          <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={"xs"}
            title="Conferma pagamento"
            onAgree={submitForm}
          >
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography>{`Importo: ${Str.EURO(payment.amount).format()}`}</Typography>
                </Grid>
                <Grid size={12}>
                  <DateTimePicker
                    slotProps={{textField: {variant: "standard"}}}
                    label={"Data pagamento"}
                    value={values.payed_at}
                    onChange={(value) => setFieldValue('payed_at', value)}
                    sx={{width: "100%"}}
                  />
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        </Form>
      )}
    </Formik>
  )
}

export default RegisterPaymentDialog;
