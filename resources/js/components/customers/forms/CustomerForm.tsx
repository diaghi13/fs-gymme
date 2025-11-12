import * as React from 'react';
import { Form, useFormikContext } from 'formik';
import {
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import TextField from '@/components/ui/TextField';
import DatePicker from '@/components/ui/DatePicker';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import CodiceFiscale from 'codice-fiscale-js';
import { useState } from 'react';
import { Customer } from '@/types';
import { CityAutocompleteAsyncNew } from '@/components/ui/CityAutocompleteAsyncNew';

interface CustomerFormProps {
  formTitle?: string;
  onDismiss?: () => void;
  customer?: Customer;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ formTitle, onDismiss }) => {
  const { values, setFieldValue } = useFormikContext<Customer>();
  const [province, setProvince] = useState('');

  const handleCalculatePersonalCode = () => {
    const cf = new CodiceFiscale({
      name: values.first_name,
      surname: values.last_name,
      gender: values.gender === 'female' ? 'F' : 'M',
      day: new Date(values.birth_date!).getDate(),
      month: new Date(values.birth_date!).getMonth() + 1,
      year: new Date(values.birth_date!).getFullYear(),
      birthplace: values.birthplace!,
      birthplaceProvincia: province
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    setFieldValue('tax_id_code', cf.code);
  };

  return (
    <Form>
      <Grid container spacing={2}>
        {formTitle && (
          <Grid size={12}>
            <Typography mt={2}>Informazioni generali</Typography>
            <Divider />
          </Grid>
        )}
        <Grid size={6}>
          <TextField
            label="Nome"
            name="first_name"
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Cognome"
            name="last_name"
          />
        </Grid>
        <Grid size={6}>
          <DatePicker
            label="Data di nascita"
            name="birth_date"
          />
        </Grid>
        <Grid size={6}>
          <CityAutocompleteAsyncNew
            name="birthplace"
            label="Luogo di nascita"
            onCitySelect={(city) => {
              if (city) {
                setProvince(city.sigla);
              }
            }}
          />
        </Grid>
        <Grid size={12}>
          <FormControl>
            <FormLabel id="gender-radio-buttons-group-label">
              Genere
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="gender-radio-buttons-group-label"
              name="gender"
              value={values.gender}
              onChange={(event) => setFieldValue('gender', event.target.value)}
            >
              <FormControlLabel
                value="F"
                control={<Radio />}
                label="Donna"
              />
              <FormControlLabel
                value="M"
                control={<Radio />}
                label="Uomo"
              />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label="Altro"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={2}>
            <Grid size={10}>
              <TextField
                label="C.F."
                name="tax_id_code"
              />
            </Grid>
            <Grid size={2} sx={{ display: 'flex', alignItems: 'end', justifyContent: 'end' }}>
              <Button variant={'outlined'} onClick={handleCalculatePersonalCode}>Calcola</Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Typography mt={2}>Recapiti</Typography>
          <Divider />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Email"
            name="email"
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Telefono"
            name="phone"
          />
        </Grid>
        <Grid size={12}>
          <Typography mt={2}>Residenza</Typography>
          <Divider />
        </Grid>
        <Grid size={{ sm: 10, md: 10 }}>
          <TextField
            label="Indirizzo"
            name="street"
          />
        </Grid>
        <Grid size={{ sm: 2, md: 2 }}>
          <TextField
            label="Numero"
            name="number"
          />
        </Grid>
        <Grid size={{ sm: 6, md: 6 }}>
          <CityAutocompleteAsyncNew
            name="city"
            label="Città"
            onCitySelect={(city) => {
              if (city) {
                setFieldValue('province', city.sigla);
                setFieldValue('zip', city.cap);
              }
            }}
          />
        </Grid>
        <Grid size={{ sm: 3, md: 3 }}>
          <TextField label="CAP" name="zip" />
        </Grid>
        <Grid size={{ sm: 3, md: 3 }}>
          <TextField
            label="Provincia"
            name="province"
          />
        </Grid>
        <Grid size={{ sm: 6, md: 6 }}>
          <TextField
            label="Nazione"
            name="country"
          />
        </Grid>
        <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button variant="text" onClick={onDismiss}>Annulla</Button>
          <FormikSaveButton />
        </Grid>
      </Grid>
    </Form>
  );
};

export default CustomerForm;
