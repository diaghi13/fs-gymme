import * as React from 'react';
import { useEffect } from 'react';
import { Form, useFormikContext } from 'formik';
import { Button, DialogActions, Grid } from '@mui/material';
import { Subscription } from '@/types';
import { addDays, addMonths } from 'date-fns';
import DatePicker from '@/components/ui/DatePicker';
import TextField from '@/components/ui/TextField';

interface EditSubscriptionFormProps {
  subscription: Partial<Subscription>;
  onClose: () => void;
}

const EditSubscriptionForm : React.FC<EditSubscriptionFormProps> = ({subscription, onClose}) => {
  const [firstRender, setFirstRender] = React.useState(true);
  const {values, setFieldValue} = useFormikContext<Partial<Subscription>>();

  useEffect(() => {
    if (!firstRender) {
      const startDate = values.start_date
        ? new Date(values.start_date)
        : null;

      if (!startDate) {
        setFieldValue('end_date', null);
        return;
      }

      let endDate = null;

      if (startDate && subscription.sale_row?.entitable?.days_duration) {
        endDate = addDays(startDate, subscription.sale_row.entitable.days_duration);
      }

      if (startDate && subscription.sale_row?.entitable?.months_duration) {
        endDate = addMonths(startDate, subscription.sale_row.entitable.months_duration);
      }

      setFieldValue('end_date', endDate);
    }
  }, [values.start_date, setFieldValue]);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    }
  }, [firstRender]);

  return (
    <Form>
      <Grid container spacing={2}>
        <Grid size={6}>
          <DatePicker label={"Dal"} name={'start_date'}/>
        </Grid>
        <Grid size={6}>
          <DatePicker label={"Al"} name={'end_date'}/>
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
};

export default EditSubscriptionForm
