import {router, usePage} from "@inertiajs/react";

import {Form, Formik} from "formik";

import {DialogContent, Grid} from "@mui/material";



import { AutocompleteOptions, Payment, Sale } from '@/types';
import {DateTimePicker} from "@mui/x-date-pickers";
import React from "react";
import { CustomerShowProps } from '@/pages/customers/customer-show';
import Dialog from '@/components/ui/Dialog';
import DatePicker from '@/components/ui/DatePicker';
import Select from "@/components/ui/Select";
import MoneyTextField from '@/components/ui/MoneyTextField';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  sale: Sale;
  payment?: Payment;
}

const PaymentDialog = ({sale, open, onClose, payment}: PaymentDialogProps) => {
  const {props: {payment_methods, customer}} = usePage<CustomerShowProps>();

  return (
    <Formik
      initialValues={{
        expiry_payment_date: payment ? new Date(payment.due_date) : new Date(),
        amount: payment?.amount ?? 0,
        payment_method_id: payment?.payment_method_id ?? "",
        payed_at: payment?.payed_at ? new Date( payment?.payed_at) : null,
      }}
      onSubmit={(values) => {
        //console.log(values);
        if (payment) {
          router.put(
            route('customer-sale-payments.update', {customer: customer.id, sale: sale.id,  payment: payment.id}),
            values,
            {preserveScroll: true}
          )
        } else {
          router.post(
            route('customer-sale-payments.store', {customer: customer.id, sale: sale.id}),
            values,
            {preserveScroll: true}
          )
        }
        onClose();
      }}
    >
      {({submitForm, values, setFieldValue}) => (
        <Form>
          <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={"sm"}
            title={payment ? "Modifica pagamento" : "Inserisci pagamento"}
            onAgree={submitForm}
          >
            <DialogContent sx={{px: 0}}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <DatePicker
                    label={"Scadenza pagamento"}
                    name="expiry_payment_date"
                  />
                </Grid>
                <Grid size={6} />
                <Grid size={6}>
                  <MoneyTextField name="amount" label="Importo"/>
                </Grid>
                <Grid size={6}>
                  <Select
                    name="payment_method_id"
                    label="Metodo di pagamento"
                    options={payment_methods.map(method => ({label: method.description, value: method.id}))}
                  />
                </Grid>
                <Grid size={6}>
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

export default PaymentDialog;
