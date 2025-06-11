import * as React from 'react';
import { Form, useFormikContext } from 'formik';
import {
  Autocomplete,
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
import CityAutocompleteAsync from '@/components/ui/CityAutocompleteAsync';
import CodiceFiscale from 'codice-fiscale-js';
import { useCallback, useState } from 'react';
import { AutocompleteOptions, CityFull, Customer } from '@/types';
import { COMUNI_API } from '@/support/CONSTS';
import axios from 'axios';

interface CustomerFormProps {
  formTitle?: string;
  onDismiss?: () => void;
  customer: Customer;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ formTitle, onDismiss, customer }) => {
  const { values, setFieldValue } = useFormikContext<Customer>();
  const [province, setProvince] = useState("");
  const [zipCodeOptions, setZipCodeOptions] = useState<AutocompleteOptions>([]);
  const [zipCodeValue, setZipCodeValue] = useState<{value: string, label: string}[]>(customer.zip ? {label: customer.zip, value: customer.zip.toString()} : []);

  const fetchZipCodes = useCallback(async (code: string) => {
    const response = await axios.get(`${COMUNI_API}/cap?code=${code}`);
    const resData = response.data;

    return resData as { cap: string, denominazione: string, codice: string }[];
  }, []);
  const handleCalculatePersonalCode = () => {
    const cf = new CodiceFiscale({
      name: values.first_name,
      surname: values.last_name,
      gender: values.gender === 'female' ? 'F' : 'M',
      day: new Date(values.birth_date!).getDate(),
      month: new Date(values.birth_date!).getMonth() + 1,
      year: new Date(values.birth_date!).getFullYear(),
      birthplace: values.birthplace!,
      birthplaceProvincia: province,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    setFieldValue("personal_id", cf.code);
  }

  const handleCityAutocomplete = async (city: CityFull | null) => {
    if (city) {
      setFieldValue('city', city?.denominazione ?? "");
      setFieldValue('province', city?.sigla ?? "");
      setFieldValue('country', city ? "Italia" : "");

      const zipCodes = await fetchZipCodes(city.codice_ISTAT);

      setZipCodeOptions(zipCodes.map(zipCode => ({label: zipCode.cap, value: zipCode.cap})));

      if (!values.zip) {
        setZipCodeValue({label: zipCodes[0].cap, value: zipCodes[0].cap});
        setFieldValue('zip_code', zipCodes[0].cap);
      }
    }
  }

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
          <CityAutocompleteAsync
            label="Luogo di nascita"
            initialValue={values.birthplace ?? ''}
            onSelect={(city) => {
              setFieldValue('birthplace', city?.denominazione ?? '');
              setProvince(city?.sigla ?? '');
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
                value="female"
                control={<Radio />}
                label="Donna"
              />
              <FormControlLabel
                value="male"
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
          <CityAutocompleteAsync
            label="Città"
            //onSelect={handleCityAutocomplete}
            onSelect={() => {}}
            initialValue={values.city ? values.city : ''}
          />
        </Grid>
        <Grid size={{ sm: 3, md: 3 }}>
          <Autocomplete
            freeSolo
            autoSelect
            options={zipCodeOptions}
            value={zipCodeValue ? zipCodeValue : null}
            onChange={(event, value) => {
              if (typeof value === 'string') {
                setFieldValue('zip', value ? value : '');
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Cap"
                variant="standard"
                name='zip'
              />
            )}
          />
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
      </Grid>
    </Form>
  );
};

export default CustomerForm;
