import * as React from 'react';
import {
  Grid,
  TableCell,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextField from '@/components/ui/TextField';
import { useFormikContext } from 'formik';
import { SubscriptionGeneralFormValues } from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';

interface ExtraExpandableFormRowProps {
  index: number;
  content: 'standard_content' | 'optional_content';
}

const ExtraFormRow: React.FC<ExtraExpandableFormRowProps> = ({ index, content }) => {
  const { values, setFieldValue } = useFormikContext<SubscriptionGeneralFormValues>();
  const contentValue = content === 'standard_content' ? values.standard_content[index] : values.optional_content[index];

  return (
    <TableRow sx={{ backgroundColor: 'rgba(209,209,209,0.11)' }}>
      <TableCell colSpan={11}>
        <Grid container spacing={2}>
          {/* Access Rules Section */}
          <Grid size={12}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Regole di Accesso</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={contentValue.unlimited_entries ?? false}
                          onChange={(e) => setFieldValue(`${content}[${index}].unlimited_entries`, e.target.checked)}
                        />
                      }
                      label="Accessi Illimitati"
                    />
                  </Grid>
                  {!contentValue.unlimited_entries && (
                    <>
                      <Grid size={3}>
                        <TextField
                          label="Ingressi Totali"
                          name={`${content}[${index}].total_entries`}
                          type="number"
                          helperText="Numero totale di ingressi consentiti"
                        />
                      </Grid>
                      <Grid size={3}>
                        <TextField
                          label="Ingressi Giornalieri"
                          name={`${content}[${index}].daily_entries`}
                          type="number"
                          helperText="Max ingressi al giorno"
                        />
                      </Grid>
                      <Grid size={3}>
                        <TextField
                          label="Ingressi Settimanali"
                          name={`${content}[${index}].weekly_entries`}
                          type="number"
                          helperText="Max ingressi a settimana"
                        />
                      </Grid>
                      <Grid size={3}>
                        <TextField
                          label="Ingressi Mensili"
                          name={`${content}[${index}].monthly_entries`}
                          type="number"
                          helperText="Max ingressi al mese"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Booking Rules Section */}
          <Grid size={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Regole di Prenotazione</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <TextField
                      label="Prenotazioni Simultanee"
                      name={`${content}[${index}].max_concurrent_bookings`}
                      type="number"
                      helperText="Max prenotazioni contemporanee"
                    />
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      label="Prenotazioni Giornaliere"
                      name={`${content}[${index}].daily_bookings`}
                      type="number"
                      helperText="Max prenotazioni al giorno"
                    />
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      label="Prenotazioni Settimanali"
                      name={`${content}[${index}].weekly_bookings`}
                      type="number"
                      helperText="Max prenotazioni a settimana"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Anticipo Prenotazione (giorni)"
                      name={`${content}[${index}].advance_booking_days`}
                      type="number"
                      helperText="Giorni massimi di anticipo"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Cancellazione (ore)"
                      name={`${content}[${index}].cancellation_hours`}
                      type="number"
                      helperText="Ore minime per cancellazione"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Validity Rules Section */}
          <Grid size={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Regole di Validità</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      select
                      label="Tipo Validità"
                      name={`${content}[${index}].validity_type`}
                      value={contentValue.validity_type ?? 'duration'}
                      onChange={(e) => setFieldValue(`${content}[${index}].validity_type`, e.target.value)}
                    >
                      <MenuItem value="duration">Durata</MenuItem>
                      <MenuItem value="fixed_date">Data Fissa</MenuItem>
                      <MenuItem value="first_use">Primo Utilizzo</MenuItem>
                    </TextField>
                  </Grid>

                  {contentValue.validity_type === 'duration' && (
                    <>
                      <Grid size={6}>
                        <TextField
                          label="Giorni Validità"
                          name={`${content}[${index}].validity_days`}
                          type="number"
                          helperText="Durata in giorni"
                        />
                      </Grid>
                      <Grid size={6}>
                        <TextField
                          label="Mesi Validità"
                          name={`${content}[${index}].validity_months`}
                          type="number"
                          helperText="Durata in mesi"
                        />
                      </Grid>
                    </>
                  )}

                  {contentValue.validity_type === 'fixed_date' && (
                    <>
                      <Grid size={6}>
                        <TextField
                          label="Valido Da"
                          name={`${content}[${index}].valid_from`}
                          type="date"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={6}>
                        <TextField
                          label="Valido Fino"
                          name={`${content}[${index}].valid_to`}
                          type="date"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid size={6}>
                    <TextField
                      label="Giorni Freeze Consentiti"
                      name={`${content}[${index}].freeze_days_allowed`}
                      type="number"
                      helperText="Giorni di sospensione permessi"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Costo Freeze (centesimi)"
                      name={`${content}[${index}].freeze_cost_cents`}
                      type="number"
                      helperText="Costo per sospensione in centesimi"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Benefits Section */}
          <Grid size={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Benefici e Vantaggi</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Guest Pass Totali"
                      name={`${content}[${index}].guest_passes_total`}
                      type="number"
                      helperText="Numero totale guest pass"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Guest Pass al Mese"
                      name={`${content}[${index}].guest_passes_per_month`}
                      type="number"
                      helperText="Guest pass mensili"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Sconto (%)"
                      name={`${content}[${index}].discount_percentage`}
                      type="number"
                      helperText="Percentuale sconto (0-100)"
                    />
                  </Grid>
                  <Grid size={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={contentValue.multi_location_access ?? false}
                          onChange={(e) => setFieldValue(`${content}[${index}].multi_location_access`, e.target.checked)}
                        />
                      }
                      label="Accesso Multi-Sede"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Note: Time Restrictions and Service Access sections will be added in separate components
              for better organization and to manage complex interactions */}
        </Grid>
      </TableCell>
    </TableRow>
  );
};

export default ExtraFormRow;
