import * as React from 'react';
import { Button, DialogContent, Grid } from '@mui/material';
import DatePicker from '@/components/ui/DatePicker';
import TextField from '@/components/ui/TextField';
import DialogActions from '@mui/material/DialogActions';
import { Form, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { addYears } from 'date-fns';
import { MedicalCertification } from '@/types';

interface MedicalCertificationFormProps {
  onClose: () => void;
}

const MedicalCertificationForm: React.FC<MedicalCertificationFormProps> = ({ onClose }) => {
  const  { values, setFieldValue } = useFormikContext<MedicalCertification>();

  useEffect(() => {
    const validUntil = values.certification_date ? addYears(values.certification_date, 1) : null;

    setFieldValue('valid_until', validUntil);
  }, [setFieldValue, values.certification_date]);

  return (
    <Form>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={6}>
            <DatePicker label={'Inizio validità'} name={'certification_date'} />
          </Grid>
          <Grid size={6}>
            <DatePicker label={'Scadenza validità'} name={'valid_until'} />
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

export default MedicalCertificationForm;
