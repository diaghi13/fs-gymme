import * as React from 'react';
import { PageProps } from '@/types';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch as MuiSwitch,
  Tabs,
  Tab,
} from '@mui/material';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface PaymentMethod {
  id: number;
  code: string;
  description: string;
  order: number;
  is_active: boolean;
  is_system: boolean;
  label: string;
  conditions_count: number;
}

interface PaymentCondition {
  id: number;
  description: string;
  payment_method_id: number;
  payment_method_code: string;
  payment_method_description: string;
  number_of_installments: number | null;
  end_of_month: boolean;
  visible: boolean;
  active: boolean;
  is_default: boolean;
  is_system: boolean;
  financial_resource_type_id: number | null;
}

interface PaymentSettingsProps extends PageProps {
  paymentMethods: PaymentMethod[];
  paymentConditions: PaymentCondition[];
}

const PaymentSettingsPage: React.FC<PaymentSettingsProps> = ({
  paymentMethods,
  paymentConditions,
  currentTenantId,
}) => {
  // State management
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [confirmAdvancedDialog, setConfirmAdvancedDialog] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCustomMethodDialog, setShowCustomMethodDialog] = useState(false);
  const [showCustomConditionDialog, setShowCustomConditionDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Filter payment methods
  const filteredMethods = paymentMethods.filter((method) => {
    if (searchText.trim() === '') return true;
    const search = searchText.toLowerCase();
    return (
      method.code.toLowerCase().includes(search) ||
      method.description.toLowerCase().includes(search)
    );
  });

  // Filter payment conditions
  const filteredConditions = paymentConditions.filter((condition) => {
    if (searchText.trim() === '') return true;
    const search = searchText.toLowerCase();
    return (
      condition.description.toLowerCase().includes(search) ||
      condition.payment_method_code?.toLowerCase().includes(search)
    );
  });

  const handleToggleMethod = (methodId: number, currentStatus: boolean) => {
    router.patch(
      route('app.configurations.payment.toggle-active', {
        tenant: currentTenantId,
        paymentMethod: methodId,
      }),
      { is_active: !currentStatus },
      { preserveScroll: true }
    );
  };

  const handleToggleCondition = (conditionId: number, currentStatus: boolean) => {
    router.patch(
      route('app.configurations.payment.condition.toggle-active', {
        tenant: currentTenantId,
        paymentCondition: conditionId,
      }),
      { active: !currentStatus },
      { preserveScroll: true }
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
    <Layout title="Impostazioni Pagamenti">
      <Grid container spacing={3}>
        {/* Info Card */}
        <Grid size={12}>
          <Alert severity="info">
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Sistema Pagamenti FatturaPA
            </Typography>
            <Typography variant="body2">
              Il sistema gestisce {paymentMethods.length} metodi di pagamento ufficiali
              FatturaPA e {paymentConditions.length} condizioni di pagamento. Puoi
              attivare/disattivare i metodi necessari per la tua attività.
            </Typography>
          </Alert>
        </Grid>

        {/* Advanced Configuration Section */}
        {!showAdvanced ? (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    <strong>Gestione Pagamenti:</strong> Attiva/disattiva metodi di
                    pagamento FatturaPA e gestisci le condizioni di pagamento
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={handleOpenAdvanced}>
                    Gestisci Pagamenti
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
                    Gestione Metodi e Condizioni di Pagamento
                  </Typography>
                  <Chip label="Configurazione" color="primary" size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Search Filter */}
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Cerca metodo o condizione"
                      placeholder="Es: MP05, Bonifico, 30 giorni..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <Box sx={{ mr: 1, color: 'text.secondary' }}>🔍</Box>
                          ),
                        },
                      }}
                    />
                  </Grid>

                  {/* Tabs for Methods and Conditions */}
                  <Grid size={12}>
                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                      <Tab label={`Metodi di Pagamento (${filteredMethods.length})`} />
                      <Tab label={`Condizioni di Pagamento (${filteredConditions.length})`} />
                    </Tabs>
                  </Grid>

                  {/* Payment Methods Table */}
                  {tabValue === 0 && (
                    <>
                      <Grid size={12}>
                        <Button
                          variant="contained"
                          onClick={() => setShowCustomMethodDialog(true)}
                        >
                          + Crea Metodo Personalizzato
                        </Button>
                      </Grid>

                      <Grid size={12}>
                        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Attivo</TableCell>
                                <TableCell>Codice</TableCell>
                                <TableCell>Descrizione</TableCell>
                                <TableCell>Condizioni</TableCell>
                                <TableCell>Sistema</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredMethods.map((method) => (
                                <TableRow
                                  key={method.id}
                                  sx={{
                                    '&:hover': { bgcolor: 'action.hover' },
                                    opacity: method.is_active ? 1 : 0.5,
                                  }}
                                >
                                  <TableCell>
                                    <MuiSwitch
                                      checked={method.is_active}
                                      onChange={() =>
                                        handleToggleMethod(method.id, method.is_active)
                                      }
                                      disabled={!method.is_system}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                      {method.code}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{method.description}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`${method.conditions_count} condizioni`}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {method.is_system ? (
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
                          Mostrando {filteredMethods.length} di {paymentMethods.length}{' '}
                          metodi
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {/* Payment Conditions Table */}
                  {tabValue === 1 && (
                    <>
                      <Grid size={12}>
                        <Button
                          variant="contained"
                          onClick={() => setShowCustomConditionDialog(true)}
                        >
                          + Crea Condizione Personalizzata
                        </Button>
                      </Grid>

                      <Grid size={12}>
                        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Attiva</TableCell>
                                <TableCell>Descrizione</TableCell>
                                <TableCell>Metodo</TableCell>
                                <TableCell>Rate</TableCell>
                                <TableCell>Fine Mese</TableCell>
                                <TableCell>Sistema</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredConditions.map((condition) => (
                                <TableRow
                                  key={condition.id}
                                  sx={{
                                    '&:hover': { bgcolor: 'action.hover' },
                                    opacity: condition.active ? 1 : 0.5,
                                  }}
                                >
                                  <TableCell>
                                    <MuiSwitch
                                      checked={condition.active}
                                      onChange={() =>
                                        handleToggleCondition(condition.id, condition.active)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>{condition.description}</TableCell>
                                  <TableCell>
                                    <Typography variant="caption">
                                      {condition.payment_method_code}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {condition.number_of_installments || '-'}
                                  </TableCell>
                                  <TableCell>
                                    {condition.end_of_month ? (
                                      <Chip label="Sì" size="small" color="primary" />
                                    ) : (
                                      '-'
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {condition.is_system ? (
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
                          Mostrando {filteredConditions.length} di{' '}
                          {paymentConditions.length} condizioni
                        </Typography>
                      </Grid>
                    </>
                  )}

                  <Grid size={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Nota:</strong> I metodi e le condizioni disattivati non
                        appariranno nei menu di selezione durante la creazione di vendite e
                        fatture.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmAdvancedDialog}
        onClose={() => setConfirmAdvancedDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Gestione Metodi di Pagamento</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Gestione Pagamenti FatturaPA
            </Typography>
            <Typography variant="body2">
              Puoi attivare/disattivare i metodi di pagamento ufficiali FatturaPA e creare
              condizioni personalizzate per adattare il sistema alle tue esigenze.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAdvancedDialog(false)}>Annulla</Button>
          <Button onClick={handleConfirmAdvanced} variant="contained" color="primary">
            Accedi alla Gestione
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Method Dialog - Placeholder */}
      <Dialog
        open={showCustomMethodDialog}
        onClose={() => setShowCustomMethodDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crea Metodo di Pagamento Personalizzato</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ my: 2 }}>
            <Typography variant="body2">
              I metodi personalizzati sono utili per casi specifici non coperti dai codici
              FatturaPA standard.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Funzionalità in fase di implementazione
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomMethodDialog(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Custom Condition Dialog - Placeholder */}
      <Dialog
        open={showCustomConditionDialog}
        onClose={() => setShowCustomConditionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crea Condizione di Pagamento Personalizzata</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ my: 2 }}>
            <Typography variant="body2">
              Le condizioni personalizzate permettono di definire rate, scadenze e modalità
              specifiche per i tuoi clienti.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Funzionalità in fase di implementazione
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomConditionDialog(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default PaymentSettingsPage;
