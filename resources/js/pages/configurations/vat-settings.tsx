import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import Layout from '@/layouts/configurations/Layout';
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch as MuiSwitch,
  TextField as MuiTextField,
} from '@mui/material';
import { useState } from 'react';
import Autocomplete from '@/components/ui/Autocomplete';
import Switch from '@/components/ui/Switch';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { router } from '@inertiajs/react';

interface VatSettings {
  default_sales_vat_rate_id: number | null;
  default_purchase_vat_rate_id: number | null;
  split_payment_enabled: boolean;
  reverse_charge_enabled: boolean;
}

interface VatRateType {
  id: number;
  code: string;
  type: string;
  description: string;
  order: number;
}

interface VatRateGroup {
  id: number;
  code: string;
  group: string;
  description: string;
  order: number;
}

interface VatRate {
  id: number;
  code: string;
  description: string;
  percentage: number;
  nature: string | null;
  type: {
    id: number;
    code: string;
    type: string;
  };
  group: {
    id: number;
    code: string;
    group: string;
  };
  is_system: boolean;
  is_active: boolean;
  visible_in_activity: boolean;
  checkout_application: boolean;
  label: string;
}

interface VatNature {
  id: number;
  code: string;
  description: string;
  full_label: string;
  parent_code: string | null;
  usage_notes: string | null;
  requires_document_reference: boolean;
  is_parent: boolean;
}

interface VatSettingsProps extends PageProps {
  settings: VatSettings;
  vatRates: VatRate[];
  vatNatures: VatNature[];
  vatRateTypes: VatRateType[];
  vatRateGroups: VatRateGroup[];
}

const VatSettingsPage: React.FC<VatSettingsProps> = ({
  settings,
  vatRates,
  vatNatures,
  vatRateTypes,
  vatRateGroups,
  currentTenantId,
}) => {
  const formikConfig: FormikConfig<VatSettings> = {
    initialValues: settings,
    onSubmit: (values, { setSubmitting }) => {
      router.patch(
        route('app.configurations.vat.update', { tenant: currentTenantId }),
        values as any,
        {
          onFinish: () => setSubmitting(false),
        }
      );
    },
  };

  // Count VAT natures by category for info display
  const naturesCount = {
    total: vatNatures.length,
    parent: vatNatures.filter((n) => n.is_parent).length,
    children: vatNatures.filter((n) => !n.is_parent).length,
  };

  // Advanced section state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [typeFilter, setTypeFilter] = useState<number | 'all'>('all');
  const [groupFilter, setGroupFilter] = useState<number | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [confirmAdvancedDialog, setConfirmAdvancedDialog] = useState(false);

  // Filter vat rates based on selected filters
  const filteredVatRates = vatRates.filter((rate) => {
    if (typeFilter !== 'all' && rate.type.id !== typeFilter) return false;
    if (groupFilter !== 'all' && rate.group.id !== groupFilter) return false;

    // Text search filter (case insensitive)
    if (searchText.trim() !== '') {
      const search = searchText.toLowerCase();
      const matchesCode = rate.code.toLowerCase().includes(search);
      const matchesDescription = rate.description.toLowerCase().includes(search);
      const matchesNature = rate.nature?.toLowerCase().includes(search);

      if (!matchesCode && !matchesDescription && !matchesNature) {
        return false;
      }
    }

    return true;
  });

  const handleToggleActive = (rateId: number, currentStatus: boolean) => {
    router.patch(
      route('app.configurations.vat.toggle-active', { tenant: currentTenantId, vatRate: rateId }),
      { is_active: !currentStatus },
      {
        preserveScroll: true,
      }
    );
  };

  const handleOpenAdvanced = () => {
    setConfirmAdvancedDialog(true);
  };

  const handleConfirmAdvanced = () => {
    setConfirmAdvancedDialog(false);
    setShowAdvanced(true);
  };

  return (
    <Layout title="Impostazioni IVA">
      <Formik {...formikConfig}>
        {({ values, isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Info Card */}
              <Grid size={12}>
                <Alert severity="info">
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Sistema IVA Dinamico Attivo
                  </Typography>
                  <Typography variant="body2">
                    Il sistema gestisce dinamicamente {vatRates.length} aliquote IVA,{' '}
                    {naturesCount.total} nature fiscali ({naturesCount.parent} principali +{' '}
                    {naturesCount.children} specifiche), {vatRateTypes.length} tipologie e{' '}
                    {vatRateGroups.length} gruppi. Le nature IVA vengono applicate automaticamente
                    in base all'aliquota selezionata nelle vendite.
                  </Typography>
                </Alert>
              </Grid>

              {/* Default VAT Rates */}
              <Grid size={12}>
                <Card>
                  <CardHeader
                    title="Aliquote IVA Predefinite"
                    subheader="Seleziona le aliquote IVA predefinite per vendite e acquisti"
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                          name="default_sales_vat_rate_id"
                          label="IVA Predefinita Vendite"
                          options={vatRates}
                          getOptionLabel={(option) => option?.label || ''}
                        />
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Questa aliquota sarà preselezionata automaticamente quando crei una
                            nuova vendita
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                          name="default_purchase_vat_rate_id"
                          label="IVA Predefinita Acquisti"
                          options={vatRates}
                          getOptionLabel={(option) => option?.label || ''}
                        />
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Questa aliquota sarà preselezionata automaticamente quando registri un
                            acquisto
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Special Regimes */}
              <Grid size={12}>
                <Card>
                  <CardHeader
                    title="Regimi Fiscali Speciali"
                    subheader="Attiva regimi IVA speciali se applicabili alla tua attività"
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid size={12}>
                        <Switch
                          name="split_payment_enabled"
                          label="Scissione Pagamenti (Split Payment)"
                          helperText="Regime per operazioni con la Pubblica Amministrazione dove l'IVA viene versata direttamente allo Stato dal cliente PA invece che al fornitore"
                        />
                        {values.split_payment_enabled && (
                          <Box sx={{ mt: 1, ml: 4 }}>
                            <Chip
                              label="Attivo"
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Le fatture verso PA includeranno automaticamente la dicitura
                              "Scissione Pagamenti"
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      <Grid size={12}>
                        <Switch
                          name="reverse_charge_enabled"
                          label="Inversione Contabile (Reverse Charge)"
                          helperText="Regime dove l'IVA è a carico del cessionario/committente (es. edilizia, cessioni intraUE, servizi internazionali)"
                        />
                        {values.reverse_charge_enabled && (
                          <Box sx={{ mt: 1, ml: 4 }}>
                            <Chip
                              label="Attivo"
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Disponibili nature N6.x per inversione contabile nella selezione
                              aliquote
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>

                    <Alert severity="warning" sx={{ mt: 3 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Attenzione
                      </Typography>
                      <Typography variant="body2">
                        L'attivazione di questi regimi speciali richiede verifica con il
                        commercialista. L'applicazione errata può comportare sanzioni fiscali.
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>

              {/* Advanced Configuration Section */}
              {!showAdvanced ? (
                <Grid size={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          <strong>Configurazione Avanzata:</strong> Gestisci attivazione aliquote
                          IVA per tenant e crea aliquote personalizzate
                        </Typography>
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={handleOpenAdvanced}
                        >
                          Apri Configurazione Avanzata
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                <Grid size={12}>
                  <Accordion defaultExpanded>
                    <AccordionSummary>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="h6" sx={{ flex: 1 }}>
                          ⚠️ Configurazione Avanzata Aliquote IVA
                        </Typography>
                        <Chip label="Avanzato" color="warning" size="small" />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {/* Warning Alert */}
                        <Grid size={12}>
                          <Alert severity="warning">
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                              Attenzione - Area Configurazione Avanzata
                            </Typography>
                            <Typography variant="body2">
                              Questa sezione permette di attivare/disattivare aliquote IVA specifiche
                              per questo tenant e di creare aliquote personalizzate. Le modifiche
                              possono influenzare la fatturazione elettronica. Consultare il
                              commercialista prima di apportare modifiche.
                            </Typography>
                          </Alert>
                        </Grid>

                        {/* Filters */}
                        <Grid size={12}>
                          <MuiTextField
                            fullWidth
                            variant="standard"
                            label="Cerca aliquota (codice, descrizione, natura)"
                            placeholder="Es: 22, esente, N3..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <Box sx={{ mr: 1, color: 'text.secondary' }}>
                                    🔍
                                  </Box>
                                ),
                              },
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth variant="standard">
                            <InputLabel>Filtra per Tipo</InputLabel>
                            <Select
                              value={typeFilter}
                              label="Filtra per Tipo"
                              onChange={(e) =>
                                setTypeFilter(e.target.value as number | 'all')
                              }
                            >
                              <MenuItem value="all">Tutti i tipi</MenuItem>
                              {vatRateTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                  {type.code} - {type.type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth variant="standard">
                            <InputLabel>Filtra per Gruppo</InputLabel>
                            <Select
                              value={groupFilter}
                              label="Filtra per Gruppo"
                              onChange={(e) =>
                                setGroupFilter(e.target.value as number | 'all')
                              }
                            >
                              <MenuItem value="all">Tutti i gruppi</MenuItem>
                              {vatRateGroups.map((group) => (
                                <MenuItem key={group.id} value={group.id}>
                                  {group.code} - {group.group}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid size={12}>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                              variant="contained"
                              onClick={() => setShowCustomDialog(true)}
                            >
                              + Crea Aliquota Personalizzata
                            </Button>
                            {(searchText || typeFilter !== 'all' || groupFilter !== 'all') && (
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setSearchText('');
                                  setTypeFilter('all');
                                  setGroupFilter('all');
                                }}
                              >
                                Azzera Filtri
                              </Button>
                            )}
                          </Box>
                        </Grid>

                        {/* VAT Rates Table */}
                        <Grid size={12}>
                          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Attiva</TableCell>
                                  <TableCell>Codice</TableCell>
                                  <TableCell>Descrizione</TableCell>
                                  <TableCell>%</TableCell>
                                  <TableCell>Tipo</TableCell>
                                  <TableCell>Gruppo</TableCell>
                                  <TableCell>Natura</TableCell>
                                  <TableCell>Sistema</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filteredVatRates.map((rate) => (
                                  <TableRow
                                    key={rate.id}
                                    sx={{
                                      '&:hover': { bgcolor: 'action.hover' },
                                      opacity: rate.is_active ? 1 : 0.5,
                                    }}
                                  >
                                    <TableCell>
                                      <MuiSwitch
                                        checked={rate.is_active}
                                        onChange={() =>
                                          handleToggleActive(rate.id, rate.is_active)
                                        }
                                        disabled={!rate.is_system}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={600}>
                                        {rate.code}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{rate.description}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={`${rate.percentage}%`}
                                        size="small"
                                        color={rate.percentage > 0 ? 'primary' : 'default'}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="caption">
                                        {rate.type.code}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="caption">
                                        {rate.group.code}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      {rate.nature && (
                                        <Chip label={rate.nature} size="small" />
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {rate.is_system ? (
                                        <Chip label="Sistema" size="small" color="default" />
                                      ) : (
                                        <Chip label="Custom" size="small" color="secondary" />
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            Mostrando {filteredVatRates.length} di {vatRates.length} aliquote IVA
                          </Typography>
                        </Grid>

                        <Grid size={12}>
                          <Alert severity="info">
                            <Typography variant="body2">
                              <strong>Nota:</strong> Le aliquote disattivate non appariranno nei
                              menu di selezione durante la creazione di vendite e fatture. Le
                              aliquote di sistema possono essere attivate/disattivate, mentre le
                              aliquote custom possono essere eliminate.
                            </Typography>
                          </Alert>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}

              {/* Save Button */}
              <Grid size={12}>
                <Card>
                  <CardContent sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <FormikSaveButton loading={isSubmitting} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      {/* Confirmation Dialog for Advanced Mode */}
      <Dialog
        open={confirmAdvancedDialog}
        onClose={() => setConfirmAdvancedDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>⚠️ Conferma Accesso Configurazione Avanzata</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Attenzione - Area per Utenti Esperti
            </Typography>
            <Typography variant="body2">
              Stai per accedere alla configurazione avanzata delle aliquote IVA. Questa sezione
              permette di:
            </Typography>
          </Alert>
          <Box component="ul" sx={{ mt: 2, pl: 3 }}>
            <Typography component="li" variant="body2" gutterBottom>
              Attivare/disattivare aliquote IVA specifiche per questo tenant
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              Creare aliquote IVA personalizzate per casi particolari
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              Modificare quali aliquote sono disponibili nella fatturazione
            </Typography>
          </Box>
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>IMPORTANTE:</strong> Le modifiche in questa sezione possono influenzare la
              conformità fiscale e la fatturazione elettronica. Si consiglia di consultare il
              commercialista prima di apportare modifiche.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAdvancedDialog(false)}>Annulla</Button>
          <Button onClick={handleConfirmAdvanced} variant="contained" color="warning">
            Accedi alla Configurazione Avanzata
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom VAT Rate Dialog - TODO: Implement */}
      <Dialog
        open={showCustomDialog}
        onClose={() => setShowCustomDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crea Aliquota IVA Personalizzata</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Le aliquote personalizzate sono utili per casi particolari o nuove disposizioni
              legislative. Consultare sempre il commercialista prima di creare nuove aliquote.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Funzionalità in fase di implementazione - richiedere endpoint backend
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomDialog(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default VatSettingsPage;
