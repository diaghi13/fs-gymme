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
  MenuItem,
  Alert,
  Button,
  IconButton,
  Select as MuiSelect,
  FormControl,
  InputLabel,
  Chip,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
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
                          checked={contentValue.unlimited_entries ?? true}
                          onChange={(e) => setFieldValue(`${content}[${index}].unlimited_entries`, e.target.checked)}
                        />
                      }
                      label="Accessi Illimitati"
                    />
                    {contentValue.unlimited_entries && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                        Lascia vuoto il campo "Ingressi" nella riga principale per accessi illimitati
                      </Typography>
                    )}
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
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tipi di validità:</strong>
                      </Typography>
                      <Typography variant="body2" component="div">
                        • <strong>Durata:</strong> L'abbonamento inizia dalla data di acquisto e dura per il periodo specificato (es. 30 giorni o 3 mesi)<br/>
                        • <strong>Data Fissa:</strong> L'abbonamento è valido solo in un periodo specifico (es. dal 1 gennaio al 31 marzo)<br/>
                        • <strong>Primo Utilizzo:</strong> L'abbonamento inizia dal primo accesso del cliente e dura per il periodo specificato
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      select
                      label="Tipo Validità"
                      name={`${content}[${index}].validity_type`}
                      value={contentValue.validity_type ?? 'duration'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue(`${content}[${index}].validity_type`, e.target.value)}
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

          {/* Time Restrictions Section */}
          <Grid size={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Restrizioni Orarie</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={contentValue.has_time_restrictions ?? false}
                          onChange={(e) => {
                            setFieldValue(`${content}[${index}].has_time_restrictions`, e.target.checked);
                            if (!e.target.checked) {
                              setFieldValue(`${content}[${index}].time_restrictions`, []);
                            }
                          }}
                        />
                      }
                      label="Abilita Restrizioni Orarie"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                      Limita l'accesso a giorni/orari specifici (es. "Solo mattina", "Solo weekend")
                    </Typography>
                  </Grid>

                  {contentValue.has_time_restrictions && (
                    <>
                      <Grid size={12}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            Puoi definire più restrizioni orarie. Ad esempio: "Lun-Ven 06:00-13:00" per accesso mattutino.
                          </Typography>
                        </Alert>
                      </Grid>

                      {(contentValue.time_restrictions || []).map((restriction: any, restrictionIndex: number) => (
                        <Grid size={12} key={restrictionIndex}>
                          <Box sx={{ p: 2, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                              <Grid size={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight="bold">Restrizione {restrictionIndex + 1}</Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const restrictions = [...(contentValue.time_restrictions || [])];
                                    restrictions.splice(restrictionIndex, 1);
                                    setFieldValue(`${content}[${index}].time_restrictions`, restrictions);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Grid>

                              <Grid size={6}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Tipo Restrizione</InputLabel>
                                  <MuiSelect
                                    value={restriction.restriction_type || 'allowed'}
                                    label="Tipo Restrizione"
                                    onChange={(e) => {
                                      const restrictions = [...(contentValue.time_restrictions || [])];
                                      restrictions[restrictionIndex] = {
                                        ...restrictions[restrictionIndex],
                                        restriction_type: e.target.value
                                      };
                                      setFieldValue(`${content}[${index}].time_restrictions`, restrictions);
                                    }}
                                  >
                                    <MenuItem value="allowed">Permesso</MenuItem>
                                    <MenuItem value="blocked">Bloccato</MenuItem>
                                  </MuiSelect>
                                </FormControl>
                              </Grid>

                              <Grid size={6}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Giorni</InputLabel>
                                  <MuiSelect
                                    multiple
                                    value={restriction.days || []}
                                    label="Giorni"
                                    onChange={(e) => {
                                      const restrictions = [...(contentValue.time_restrictions || [])];
                                      restrictions[restrictionIndex] = {
                                        ...restrictions[restrictionIndex],
                                        days: e.target.value
                                      };
                                      setFieldValue(`${content}[${index}].time_restrictions`, restrictions);
                                    }}
                                    renderValue={(selected) => (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => (
                                          <Chip key={value} label={value} size="small" />
                                        ))}
                                      </Box>
                                    )}
                                  >
                                    <MenuItem value="monday">Lunedì</MenuItem>
                                    <MenuItem value="tuesday">Martedì</MenuItem>
                                    <MenuItem value="wednesday">Mercoledì</MenuItem>
                                    <MenuItem value="thursday">Giovedì</MenuItem>
                                    <MenuItem value="friday">Venerdì</MenuItem>
                                    <MenuItem value="saturday">Sabato</MenuItem>
                                    <MenuItem value="sunday">Domenica</MenuItem>
                                  </MuiSelect>
                                </FormControl>
                              </Grid>

                              <Grid size={4}>
                                <TextField
                                  label="Ora Inizio"
                                  type="time"
                                  name={`${content}[${index}].time_restrictions[${restrictionIndex}].start_time`}
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>

                              <Grid size={4}>
                                <TextField
                                  label="Ora Fine"
                                  type="time"
                                  name={`${content}[${index}].time_restrictions[${restrictionIndex}].end_time`}
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>

                              <Grid size={4}>
                                <TextField
                                  label="Descrizione"
                                  name={`${content}[${index}].time_restrictions[${restrictionIndex}].description`}
                                  placeholder="es. Solo mattina"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        </Grid>
                      ))}

                      <Grid size={12}>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => {
                            const restrictions = contentValue.time_restrictions || [];
                            setFieldValue(`${content}[${index}].time_restrictions`, [
                              ...restrictions,
                              {
                                restriction_type: 'allowed',
                                days: [],
                                start_time: '',
                                end_time: '',
                                description: ''
                              }
                            ]);
                          }}
                          variant="outlined"
                          size="small"
                        >
                          Aggiungi Restrizione
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Service Access Section */}
          <Grid size={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Accesso Servizi</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Limita l'abbonamento a servizi/corsi specifici invece di dare accesso completo
                      </Typography>
                    </Alert>
                  </Grid>

                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo Accesso Servizi</InputLabel>
                      <MuiSelect
                        value={contentValue.service_access_type || 'all'}
                        label="Tipo Accesso Servizi"
                        onChange={(e) => {
                          setFieldValue(`${content}[${index}].service_access_type`, e.target.value);
                          if (e.target.value === 'all') {
                            setFieldValue(`${content}[${index}].services`, []);
                          }
                        }}
                      >
                        <MenuItem value="all">Tutti i Servizi</MenuItem>
                        <MenuItem value="included">Solo Servizi Selezionati</MenuItem>
                        <MenuItem value="excluded">Tutti Tranne Selezionati</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </Grid>

                  {contentValue.service_access_type && contentValue.service_access_type !== 'all' && (
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {contentValue.service_access_type === 'included'
                          ? 'Seleziona i servizi/corsi a cui l\'abbonamento dà accesso:'
                          : 'Seleziona i servizi/corsi da escludere dall\'abbonamento:'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        Nota: Questa funzionalità sarà disponibile dopo aver salvato il contenuto.
                        Potrai selezionare i servizi dalla lista dei prodotti disponibili.
                      </Typography>
                      {/* TODO: Implement service selector with autocomplete/multi-select
                          This will require loading available products and managing the services array */}
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  );
};

export default ExtraFormRow;
