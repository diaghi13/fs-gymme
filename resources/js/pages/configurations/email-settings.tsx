import * as React from 'react';
import { PageProps } from '@/types';
import { Form, Formik, FormikConfig } from 'formik';
import Layout from '@/layouts/configurations/Layout';
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControlLabel,
  FormHelperText,
  Grid,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField as MuiTextField,
  Typography,
} from '@mui/material';
import TextField from '@/components/ui/TextField';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { router } from '@inertiajs/react';
import { Email, Notifications } from '@mui/icons-material';

interface EmailSettings {
  sender: string;
  sender_name: string;
  reply_to: string;
  signature: string;
  admin_recipients: string[];
}

interface NotificationSettings {
  invoice_accepted: boolean;
  invoice_rejected: boolean;
  customer_created: boolean;
  subscription_expiring: boolean;
  subscription_expired: boolean;
  medical_cert_expiring: boolean;
  sports_registration_expiring: boolean;
  warning_threshold: number;
}

interface EmailSettingsProps extends PageProps {
  settings: EmailSettings;
  notifications: NotificationSettings;
}

const EmailSettingsPage: React.FC<EmailSettingsProps> = ({
  auth,
  settings,
  notifications,
  currentTenantId,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [emailInput, setEmailInput] = React.useState('');

  const emailFormikConfig: FormikConfig<EmailSettings> = {
    initialValues: settings,
    onSubmit: (values, { setSubmitting }) => {
      const payload = values as unknown as Record<string, unknown>;
      router.patch(
        route('app.configurations.email.update', { tenant: currentTenantId }),
        payload,
        {
          onFinish: () => setSubmitting(false),
        }
      );
    },
  };

  const notificationFormikConfig: FormikConfig<NotificationSettings> = {
    initialValues: notifications,
    onSubmit: (values, { setSubmitting }) => {
      const payload = values as unknown as Record<string, unknown>;
      router.patch(
        route('app.configurations.email.notifications.update', { tenant: currentTenantId }),
        payload,
        {
          onFinish: () => setSubmitting(false),
        }
      );
    },
  };

  return (
    <Layout title="Impostazioni Email e Notifiche">
      <Card>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab icon={<Email />} label="Configurazione Email" />
          <Tab icon={<Notifications />} label="Preferenze Notifiche" />
        </Tabs>

        {/* Tab 1: Email Configuration */}
        {activeTab === 0 && (
          <Formik {...emailFormikConfig}>
            {({ values, handleChange, setFieldValue, isSubmitting }) => (
              <Form>
                <CardHeader
                  title="Configurazione Email"
                  subheader="Imposta le email predefinite per le comunicazioni del sistema"
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Alert severity="info">
                        Queste email verranno utilizzate come mittenti predefiniti per tutte le
                        comunicazioni automatiche del sistema (fatture, notifiche, etc.)
                      </Alert>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="sender"
                        label="Email Mittente"
                        type="email"
                        value={values.sender}
                        onChange={handleChange}
                        helperText="Email utilizzata come mittente (es: noreply@domain.it)"
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="sender_name"
                        label="Nome Mittente"
                        value={values.sender_name}
                        onChange={handleChange}
                        helperText="Nome visualizzato come mittente (es: Nome Azienda)"
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        name="reply_to"
                        label="Reply-To Email"
                        type="email"
                        value={values.reply_to}
                        onChange={handleChange}
                        helperText="Email dove arriveranno le risposte (es: info@domain.it)"
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Destinatari Admin
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {values.admin_recipients.map((email, index) => (
                          <Chip
                            key={index}
                            label={email}
                            onDelete={() => {
                              const newRecipients = [...values.admin_recipients];
                              newRecipients.splice(index, 1);
                              setFieldValue('admin_recipients', newRecipients);
                            }}
                            size="small"
                          />
                        ))}
                      </Stack>
                      <MuiTextField
                        fullWidth
                        variant="standard"
                        label="Aggiungi Email Admin"
                        type="email"
                        value={emailInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailInput(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (emailInput && !values.admin_recipients.includes(emailInput)) {
                              setFieldValue('admin_recipients', [
                                ...values.admin_recipients,
                                emailInput,
                              ]);
                              setEmailInput('');
                            }
                          }
                        }}
                        helperText="Email che riceveranno notifiche importanti. Premi Invio per aggiungere."
                        sx={{ mt: 1 }}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="signature"
                        label="Firma Email"
                        value={values.signature}
                        onChange={handleChange}
                        helperText="Firma automatica aggiunta a tutte le email (opzionale)"
                      />
                    </Grid>

                    <Grid size={12}>
                      <Alert severity="success">
                        <Typography variant="subtitle2" gutterBottom>
                          Anteprima Email
                        </Typography>
                        <Typography variant="body2">
                          <strong>Da:</strong> {values.sender_name} &lt;{values.sender}&gt;
                          <br />
                          <strong>Rispondi a:</strong> {values.reply_to}
                          <br />
                          {values.signature && (
                            <>
                              <strong>Firma:</strong>
                              <br />
                              {values.signature.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                  {line}
                                  <br />
                                </React.Fragment>
                              ))}
                            </>
                          )}
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardContent sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <FormikSaveButton loading={isSubmitting} />
                </CardContent>
              </Form>
            )}
          </Formik>
        )}

        {/* Tab 2: Notification Preferences */}
        {activeTab === 1 && (
          <Formik {...notificationFormikConfig}>
            {({ values, setFieldValue, handleChange, isSubmitting }) => (
              <Form>
                <CardHeader
                  title="Preferenze Notifiche"
                  subheader="Scegli quali notifiche email ricevere automaticamente"
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Alert severity="info">
                        Le notifiche attive verranno inviate agli indirizzi email admin configurati
                        nel tab "Configurazione Email"
                      </Alert>
                    </Grid>

                    {/* Warning Threshold Configuration */}
                    <Grid size={12}>
                      <Alert severity="warning">
                        <Typography variant="subtitle2" gutterBottom>
                          Soglia Avvisi Scadenze
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Configura quanti giorni prima della scadenza mostrare gli avvisi nella
                          scheda cliente per abbonamenti, certificati medici e tesseramenti sportivi.
                        </Typography>
                        <MuiTextField
                          name="warning_threshold"
                          label="Giorni di preavviso"
                          type="number"
                          value={values.warning_threshold}
                          onChange={handleChange}
                          size="small"
                          slotProps={{
                            htmlInput: {
                              min: 1,
                              max: 90,
                            },
                          }}
                          sx={{ mt: 2, maxWidth: 300 }}
                          helperText="Mostra avviso X giorni prima della scadenza (es: 7 giorni)"
                        />
                      </Alert>
                    </Grid>

                    {/* Fatturazione Elettronica */}
                    <Grid size={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Fatturazione Elettronica
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.invoice_accepted}
                            onChange={(e) =>
                              setFieldValue('invoice_accepted', e.target.checked)
                            }
                          />
                        }
                        label="Fattura Accettata da SDI"
                      />
                      <FormHelperText>
                        Ricevi notifica quando una fattura elettronica viene accettata dal Sistema
                        di Interscambio
                      </FormHelperText>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.invoice_rejected}
                            onChange={(e) =>
                              setFieldValue('invoice_rejected', e.target.checked)
                            }
                          />
                        }
                        label="Fattura Rifiutata da SDI"
                      />
                      <FormHelperText>
                        Ricevi notifica quando una fattura elettronica viene rifiutata (richiede
                        azione immediata)
                      </FormHelperText>
                    </Grid>

                    {/* Clienti */}
                    <Grid size={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Clienti
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.customer_created}
                            onChange={(e) =>
                              setFieldValue('customer_created', e.target.checked)
                            }
                          />
                        }
                        label="Nuovo Cliente Registrato"
                      />
                      <FormHelperText>
                        Ricevi notifica quando un nuovo cliente viene registrato nel sistema
                      </FormHelperText>
                    </Grid>

                    {/* Abbonamenti */}
                    <Grid size={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Abbonamenti
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.subscription_expiring}
                            onChange={(e) =>
                              setFieldValue('subscription_expiring', e.target.checked)
                            }
                          />
                        }
                        label="Abbonamento in Scadenza"
                      />
                      <FormHelperText>
                        Ricevi notifica quando un abbonamento sta per scadere
                      </FormHelperText>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.subscription_expired}
                            onChange={(e) =>
                              setFieldValue('subscription_expired', e.target.checked)
                            }
                          />
                        }
                        label="Abbonamento Scaduto"
                      />
                      <FormHelperText>
                        Ricevi notifica quando un abbonamento è scaduto
                      </FormHelperText>
                    </Grid>

                    {/* Certificati Medici */}
                    <Grid size={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Certificati Medici e Tesseramenti
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.medical_cert_expiring}
                            onChange={(e) =>
                              setFieldValue('medical_cert_expiring', e.target.checked)
                            }
                          />
                        }
                        label="Certificato Medico in Scadenza"
                      />
                      <FormHelperText>
                        Ricevi notifica quando un certificato medico sta per scadere
                      </FormHelperText>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.sports_registration_expiring}
                            onChange={(e) =>
                              setFieldValue('sports_registration_expiring', e.target.checked)
                            }
                          />
                        }
                        label="Tesseramento in Scadenza"
                      />
                      <FormHelperText>
                        Ricevi notifica quando un tesseramento sportivo sta per scadere
                      </FormHelperText>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardContent sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <FormikSaveButton loading={isSubmitting} />
                </CardContent>
              </Form>
            )}
          </Formik>
        )}
      </Card>
    </Layout>
  );
};

export default EmailSettingsPage;
