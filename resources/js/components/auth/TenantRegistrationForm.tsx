import React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import { Link as MuiLink } from '@mui/material';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import BusinessIcon from '@mui/icons-material/Business';
import { Link } from '@inertiajs/react';
import TextField from '@/components/ui/TextField';
import { useFormikContext } from 'formik';

interface TenantRegistrationFormProps {
    steps: Array<string>;
    activeStep: number;
    onReset: () => void;
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;
    trialDays: number;
    isSubmitting: boolean;
    isValid: boolean;
    serverError?: string | null;
    onClearError?: () => void;
}

// Step 1: User (Owner) Information
const UserStep = ({ trialDays }: { trialDays: number }) => {
    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Inizia la tua prova gratuita di {trialDays} giorni! Nessuna carta di credito richiesta.
                </Alert>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Crea il tuo account amministratore
                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="user.first_name"
                    label="Nome"
                    required
                    fullWidth
                    autoFocus
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="user.last_name"
                    label="Cognome"
                    required
                    fullWidth
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    name="user.email"
                    label="Email"
                    type="email"
                    required
                    fullWidth
                    helperText="Userai questa email per accedere"
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    name="user.password"
                    label="Password"
                    type="password"
                    required
                    fullWidth
                    helperText="Minimo 8 caratteri"
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    name="user.password_confirmation"
                    label="Conferma Password"
                    type="password"
                    required
                    fullWidth
                />
            </Grid>
        </Grid>
    );
};

// Step 2: Company Information
const CompanyStep = () => {
    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Informazioni sulla tua azienda
                </Typography>
            </Grid>
            <Grid size={12}>
                <TextField
                    name="company.business_name"
                    label="Ragione Sociale"
                    required
                    fullWidth
                    autoFocus
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="company.tax_code"
                    label="Codice Fiscale"
                    required
                    fullWidth
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="company.vat_number"
                    label="Partita IVA"
                    required
                    fullWidth
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <TextField
                    name="company.street"
                    label="Via"
                    required
                    fullWidth
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                    name="company.number"
                    label="Numero"
                    fullWidth
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="company.city"
                    label="Città"
                    required
                    fullWidth
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                    name="company.zip_code"
                    label="CAP"
                    required
                    fullWidth
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                    name="company.province"
                    label="Provincia"
                    fullWidth
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    name="company.country"
                    label="Paese"
                    fullWidth
                    defaultValue="IT"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="company.phone"
                    label="Telefono"
                    required
                    fullWidth
                    helperText="Numero di telefono principale"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="company.email"
                    label="Email Aziendale"
                    type="email"
                    required
                    fullWidth
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="company.pec_email"
                    label="PEC"
                    type="email"
                    required
                    fullWidth
                    helperText="Posta Elettronica Certificata"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="company.sdi_code"
                    label="Codice SDI"
                    fullWidth
                    helperText="Opzionale - Sistema di Interscambio"
                />
            </Grid>
        </Grid>
    );
};

// Step 3: Structure Information
const StructureStep = () => {
    const { values, setFieldValue } = useFormikContext<any>();
    const sameAsCompany = values.structure.same_as_company;

    const handleSameAsCompanyChange = (checked: boolean) => {
        setFieldValue('structure.same_as_company', checked);

        if (checked) {
            // Auto-copy company data to structure
            setFieldValue('structure.name', values.company.business_name);
            setFieldValue('structure.street', values.company.street);
            setFieldValue('structure.number', values.company.number);
            setFieldValue('structure.city', values.company.city);
            setFieldValue('structure.zip_code', values.company.zip_code);
            setFieldValue('structure.province', values.company.province);
            setFieldValue('structure.country', values.company.country);
            setFieldValue('structure.phone', values.company.phone);
            setFieldValue('structure.email', values.company.email);
        } else {
            // Clear structure data when unchecked
            setFieldValue('structure.name', '');
            setFieldValue('structure.street', '');
            setFieldValue('structure.number', '');
            setFieldValue('structure.city', '');
            setFieldValue('structure.zip_code', '');
            setFieldValue('structure.province', '');
            setFieldValue('structure.phone', '');
            setFieldValue('structure.email', '');
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Informazioni sulla prima struttura/sede
                </Typography>
            </Grid>

            {/* Same as Company Checkbox */}
            <Grid size={12}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={sameAsCompany}
                            onChange={(e) => handleSameAsCompanyChange(e.target.checked)}
                        />
                    }
                    label={
                        <Typography variant="body2">
                            La struttura ha gli stessi dati dell'azienda
                        </Typography>
                    }
                />
            </Grid>

            {/* Structure fields - disabled when same_as_company is checked */}
            <Grid size={12}>
                <TextField
                    name="structure.name"
                    label="Nome Struttura"
                    required={!sameAsCompany}
                    fullWidth
                    autoFocus={!sameAsCompany}
                    disabled={sameAsCompany}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <TextField
                    name="structure.street"
                    label="Via"
                    required={!sameAsCompany}
                    fullWidth
                    disabled={sameAsCompany}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                    name="structure.number"
                    label="Numero"
                    fullWidth
                    disabled={sameAsCompany}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="structure.city"
                    label="Città"
                    required={!sameAsCompany}
                    fullWidth
                    disabled={sameAsCompany}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                    name="structure.zip_code"
                    label="CAP"
                    required={!sameAsCompany}
                    fullWidth
                    disabled={sameAsCompany}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                    name="structure.province"
                    label="Provincia"
                    fullWidth
                    disabled={sameAsCompany}
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    name="structure.country"
                    label="Paese"
                    fullWidth
                    defaultValue="IT"
                    disabled={sameAsCompany}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="structure.phone"
                    label="Telefono"
                    fullWidth
                    disabled={sameAsCompany}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    name="structure.email"
                    label="Email"
                    type="email"
                    fullWidth
                    disabled={sameAsCompany}
                />
            </Grid>

            {/* Terms and Conditions */}
            <Grid size={12} sx={{ mt: 2 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            name="terms_accepted"
                            onChange={(e) => {
                                values.terms_accepted = e.target.checked;
                            }}
                        />
                    }
                    label={
                        <Typography variant="body2">
                            Accetto i{' '}
                            <MuiLink href="/terms" target="_blank">
                                termini e condizioni
                            </MuiLink>{' '}
                            e la{' '}
                            <MuiLink href="/privacy" target="_blank">
                                privacy policy
                            </MuiLink>
                        </Typography>
                    }
                />
            </Grid>
        </Grid>
    );
};

export default function TenantRegistrationForm({
    steps,
    activeStep,
    onReset,
    onBack,
    onNext,
    onSubmit,
    trialDays,
    isSubmitting,
    isValid,
    serverError,
    onClearError,
}: TenantRegistrationFormProps) {
    const { values, errors, touched, validateForm } = useFormikContext<any>();

    const handleNext = async () => {
        const validationErrors = await validateForm();

        // Check if current step has errors
        const currentStepFields = {
            0: 'user',
            1: 'company',
            2: 'structure',
        };

        const currentField = currentStepFields[activeStep as keyof typeof currentStepFields];
        const hasErrors = currentField && validationErrors[currentField];

        if (!hasErrors) {
            onNext();
        }
    };

    return (
        <>
            <CardHeader
                sx={{ px: 0 }}
                title={
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                }
            />
            <CardContent>
                <Box sx={{ width: '100%' }}>
                    {activeStep === steps.length ? (
                        <React.Fragment>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    py: 4,
                                }}
                            >
                                <Avatar sx={{ m: 1, bgcolor: 'success.main', width: 56, height: 56 }}>
                                    <BusinessIcon />
                                </Avatar>
                                <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                                    Registrazione Completata!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Verrai reindirizzato al tuo tenant tra poco...
                                </Typography>
                            </Box>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                            >
                                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                    <BusinessIcon />
                                </Avatar>
                                <Typography component="h1" variant="h5">
                                    Registra il tuo Tenant
                                </Typography>

                                {trialDays > 0 && (
                                    <Chip
                                        label={`Prova gratuita ${trialDays} giorni`}
                                        color="success"
                                        sx={{ mt: 1 }}
                                    />
                                )}

                                {serverError && (
                                    <Alert severity="error" onClose={onClearError} sx={{ mt: 2, width: '100%' }}>
                                        {serverError}
                                    </Alert>
                                )}

                                <Box sx={{ mt: 3, width: '100%' }}>
                                    {activeStep === 0 && <UserStep trialDays={trialDays} />}
                                    {activeStep === 1 && <CompanyStep />}
                                    {activeStep === 2 && <StructureStep />}

                                    <Grid container sx={{ mt: 2 }}>
                                        <Grid size={12}>
                                            <Typography variant="body2">
                                                Hai già un account?{' '}
                                                <MuiLink component={Link} href="/login" variant="body2">
                                                    Accedi
                                                </MuiLink>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3, mt: 3, borderTop: 1, borderColor: 'divider' }}>
                                <Button
                                    color="inherit"
                                    disabled={activeStep === 0}
                                    onClick={onBack}
                                    sx={{ mr: 1 }}
                                >
                                    Indietro
                                </Button>
                                <Box sx={{ flex: '1 1 auto' }} />
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        onClick={onSubmit}
                                        variant="contained"
                                        disabled={isSubmitting || !values.terms_accepted}
                                    >
                                        {isSubmitting ? 'Registrazione...' : 'Completa Registrazione'}
                                    </Button>
                                ) : (
                                    <Button onClick={handleNext} variant="contained">
                                        Avanti
                                    </Button>
                                )}
                            </Box>
                        </React.Fragment>
                    )}
                </Box>
            </CardContent>
        </>
    );
}
