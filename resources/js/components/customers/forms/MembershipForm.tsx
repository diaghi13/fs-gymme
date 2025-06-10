import * as React from 'react';
import { useEffect } from 'react';
import { addYears } from 'date-fns';
import { Form, useFormikContext } from 'formik';
import { Button, DialogContent, Grid } from '@mui/material';
import DatePicker from '@/components/ui/DatePicker';
import TextField from '@/components/ui/TextField';
import DialogActions from '@mui/material/DialogActions';
import { Membership } from '@/types';

interface MembershipFormProps {
  onClose: () => void;
}

const MembershipForm : React.FC<MembershipFormProps> = ({onClose}) => {
  const  {values, setFieldValue} = useFormikContext<Partial<Membership>>();

  useEffect(() => {
    const expiryDate = values.start_date ? addYears(values.start_date, 1) : null;

    setFieldValue('end_date', expiryDate);
  }, [values.start_date, setFieldValue]);

  return (
    <Form>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={6}>
            <DatePicker label={'Data registrazione'} name={'start_date'} />
          </Grid>
          <Grid size={6}>
            <DatePicker label={'Scadenza validità'} name={'end_date'} />
          </Grid>
          <Grid size={12}>
            <TextField label={'N. tessera'} name={'card_number'} />
          </Grid>
          <Grid size={12}>
            <TextField label={'Note'} name={'notes'} multiline />
          </Grid>
          <Grid size={12}>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={onClose}>Annulla</Button>
              <Button type={'submit'} variant={'contained'}>
                Salva
              </Button>
            </DialogActions>
          </Grid>
        </Grid>
      </DialogContent>
    </Form>
  );
};

export default MembershipForm
