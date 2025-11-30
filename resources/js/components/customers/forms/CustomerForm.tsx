import * as React from 'react';
import { Form, useFormikContext } from 'formik';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  Typography
} from '@mui/material';
import TextField from '@/components/ui/TextField';
import DatePicker from '@/components/ui/DatePicker';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import CodiceFiscale from 'codice-fiscale-js';
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { CityAutocompleteAsyncNew } from '@/components/ui/CityAutocompleteAsyncNew';
import axios from 'axios';
import { route } from 'ziggy-js';

interface CustomerFormProps {
  formTitle?: string;
  onDismiss?: () => void;
  customer?: Customer;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ formTitle, onDismiss }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<Customer>();
  const [province, setProvince] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  // Check email availability on blur
  const handleEmailBlur = async () => {
    if (!values.email || errors.email) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    try {
      const response = await axios.post(route('api.v1.customers.check-email'), {
        email: values.email
      });
      setEmailAvailable(response.data.available);
    } catch (error) {
      console.error('Email check failed:', error);
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  // Calculate tax code
  const handleCalculatePersonalCode = () => {
    try {
      const cf = new CodiceFiscale({
        name: values.first_name,
        surname: values.last_name,
        gender: values.gender === 'F' ? 'F' : 'M',
        day: new Date(values.birth_date!).getDate(),
        month: new Date(values.birth_date!).getMonth() + 1,
        year: new Date(values.birth_date!).getFullYear(),
        birthplace: values.birthplace!,
        birthplaceProvincia: province
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setFieldValue('tax_id_code', cf.code);
    } catch (error) {
      console.error('Errore calcolo CF:', error);
    }
  };

  return (
    <Form>
      <Grid container spacing={3}>
        {/* Personal Info Section */}
        {formTitle && (
          <Grid size={12}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Informazioni generali
            </Typography>
            <Divider />
          </Grid>
        )}

        {/* Company Toggle */}
        <Grid size={12}>
          <FormControlLabel
            control={
              <Switch
                checked={isCompany}
                onChange={(e) => setIsCompany(e.target.checked)}
              />
            }
            label="È un'azienda"
          />
        </Grid>

        {isCompany && (
          <Grid size={12}>
            <TextField
              label="Ragione sociale *"
              name="company_name"
              helperText="Nome completo dell'azienda"
            />
          </Grid>
        )}

        <Grid size={6}>
          <TextField
            label="Nome *"
            name="first_name"
            required
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Cognome *"
            name="last_name"
            required
          />
        </Grid>

        <Grid size={6}>
          <DatePicker
            label="Data di nascita"
            name="birth_date"
            helperText="Necessaria per il calcolo del codice fiscale"
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
              value={values.gender || ''}
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

        {/* Tax Info Section */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            Informazioni fiscali
          </Typography>
          <Divider />
        </Grid>

        <Grid size={12}>
          <Grid container spacing={2}>
            <Grid size={10}>
              <TextField
                label="Codice Fiscale *"
                name="tax_id_code"
                required
                helperText="16 caratteri alfanumerici"
              />
            </Grid>
            <Grid size={2} sx={{ display: 'flex', alignItems: 'end', justifyContent: 'end' }}>
              <Button
                variant="outlined"
                onClick={handleCalculatePersonalCode}
                disabled={!values.first_name || !values.last_name || !values.birth_date || !values.birthplace || !province}
                fullWidth
              >
                Calcola
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {isCompany && (
          <Grid size={6}>
            <TextField
              label="Partita IVA"
              name="vat_number"
              helperText="11 cifre numeriche"
            />
          </Grid>
        )}

        {/* Contacts Section */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            Recapiti
          </Typography>
          <Divider />
        </Grid>

        <Grid size={6}>
          <TextField
            label="Email *"
            name="email"
            type="email"
            required
            onBlur={handleEmailBlur}
            helperText={
              emailChecking
                ? 'Verifica in corso...'
                : emailAvailable === false
                ? 'Email già utilizzata'
                : emailAvailable === true
                ? 'Email disponibile'
                : 'Indirizzo email principale'
            }
            error={emailAvailable === false}
          />
        </Grid>

        <Grid size={6}>
          <TextField
            label="Telefono"
            name="phone"
            helperText="Numero di cellulare o telefono fisso"
          />
        </Grid>

        {/* Address Section */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            Indirizzo di residenza
          </Typography>
          <Divider />
        </Grid>

        <Grid size={10}>
          <TextField
            label="Indirizzo"
            name="street"
            helperText="Via, piazza, corso..."
          />
        </Grid>
        <Grid size={2}>
          <TextField
            label="Numero"
            name="number"
          />
        </Grid>

        <Grid size={6}>
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
        <Grid size={3}>
          <TextField
            label="CAP"
            name="zip"
            helperText="5 cifre"
          />
        </Grid>
        <Grid size={3}>
          <TextField
            label="Provincia"
            name="province"
            helperText="Es: MI, RM"
          />
        </Grid>

        <Grid size={6}>
          <TextField
            label="Nazione"
            name="country"
            helperText="Codice ISO (IT, FR, DE...)"
          />
        </Grid>

        {/* GDPR Consents Section */}
        <Grid size={12}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            Consensi e privacy
          </Typography>
          <Divider />
        </Grid>

        <Grid size={12}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.gdpr_consent || false}
                  onChange={(e) => setFieldValue('gdpr_consent', e.target.checked)}
                />
              }
              label="Consenso al trattamento dei dati personali (GDPR)"
            />
            <FormHelperText>
              Obbligatorio per poter procedere con la registrazione
            </FormHelperText>

            <FormControlLabel
              control={
                <Checkbox
                  checked={values.marketing_consent || false}
                  onChange={(e) => setFieldValue('marketing_consent', e.target.checked)}
                />
              }
              label="Consenso per comunicazioni marketing e promozionali"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={values.photo_consent || false}
                  onChange={(e) => setFieldValue('photo_consent', e.target.checked)}
                />
              }
              label="Consenso per l'uso di foto e video"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={values.medical_data_consent || false}
                  onChange={(e) => setFieldValue('medical_data_consent', e.target.checked)}
                />
              }
              label="Consenso per il trattamento di dati sanitari"
            />
          </FormGroup>
        </Grid>

        {/* Submit Actions */}
        <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          {onDismiss && (
            <Button variant="outlined" onClick={onDismiss}>
              Annulla
            </Button>
          )}
          <FormikSaveButton>
            Salva Cliente
          </FormikSaveButton>
        </Grid>
      </Grid>
    </Form>
  );
};

export default CustomerForm;
