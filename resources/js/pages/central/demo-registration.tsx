import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Form, Formik } from 'formik';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Container,
    FormControlLabel,
    Grid,
    Typography,
    Link as MuiLink,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from '@inertiajs/react';
import BusinessIcon from '@mui/icons-material/Business';
import AuthLayout from '@/layouts/auth/AuthLayout';
import TextField from '@/components/ui/TextField';
import * as Yup from 'yup';

interface DemoRegistrationProps {
    trialDays: number;
}

const validationSchema = Yup.object().shape({
    user: Yup.object().shape({
        first_name: Yup.string()
            .required('Il nome è obbligatorio')
            .max(255, 'Il nome non può superare 255 caratteri'),
        last_name: Yup.string()
            .required('Il cognome è obbligatorio')
            .max(255, 'Il cognome non può superare 255 caratteri'),
        email: Yup.string()
            .required('L\'email è obbligatoria')
            .email('Inserisci un\'email valida'),
        password: Yup.string()
            .required('La password è obbligatoria')
            .min(8, 'La password deve essere almeno 8 caratteri'),
        password_confirmation: Yup.string()
            .required('Conferma la password')
            .oneOf([Yup.ref('password')], 'Le password non corrispondono'),
    }),
    terms_accepted: Yup.boolean()
        .oneOf([true], 'Devi accettare i termini e condizioni'),
});

export default function DemoRegistration({ trialDays }: DemoRegistrationProps) {
    const theme = useTheme();
    const { errors } = usePage().props;
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        // Check for server errors
        if (errors && Object.keys(errors).length > 0) {
            // Get first error message
            const firstError = Object.values(errors)[0];
            setServerError(typeof firstError === 'string' ? firstError : 'Si è verificato un errore durante la registrazione.');
        }
    }, [errors]);

    return (
        <AuthLayout>
            <Head title="Registrazione Demo" />

            <Container maxWidth="sm">
                <Formik
                    initialValues={{
                        user: {
                            first_name: '',
                            last_name: '',
                            email: '',
                            password: '',
                            password_confirmation: '',
                        },
                        is_demo: true,
                        terms_accepted: false,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        router.post(route('tenant.register.store'), values, {
                            onSuccess: () => {
                                console.log('Demo registration successful');
                            },
                            onError: (errors) => {
                                console.error('Demo registration failed', errors);
                                setErrors(errors);
                                setSubmitting(false);
                            },
                            onFinish: () => {
                                setSubmitting(false);
                            },
                        });
                    }}
                >
                    {({ values, isSubmitting, submitForm }) => (
                        <Form>
                            <Card
                                sx={{
                                    mt: 4,
                                    background: theme.palette.background.default,
                                }}
                            >
                                <CardHeader
                                    title={
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                                                <BusinessIcon />
                                            </Avatar>
                                            <Typography component="h1" variant="h5">
                                                Prova Demo Gratuita
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid size={12}>
                                            <Alert severity="info">
                                                Inizia subito con la versione demo! Avrai accesso completo per {trialDays} giorni
                                                con dati di esempio già configurati. Nessuna carta di credito richiesta.
                                            </Alert>
                                        </Grid>

                                        {serverError && (
                                            <Grid size={12}>
                                                <Alert severity="error" onClose={() => setServerError(null)}>
                                                    {serverError}
                                                </Alert>
                                            </Grid>
                                        )}

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

                                        <Grid size={12}>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                disabled={isSubmitting || !values.terms_accepted}
                                                onClick={submitForm}
                                            >
                                                {isSubmitting ? 'Creazione demo in corso...' : 'Inizia Demo Gratuita'}
                                            </Button>
                                        </Grid>

                                        <Grid size={12} sx={{ mt: 2 }}>
                                            <Typography variant="body2" align="center">
                                                Hai già un account?{' '}
                                                <MuiLink component={Link} href="/login" variant="body2">
                                                    Accedi
                                                </MuiLink>
                                            </Typography>
                                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                                Vuoi registrare un account completo?{' '}
                                                <MuiLink component={Link} href={route('tenant.register')} variant="body2">
                                                    Registrazione Completa
                                                </MuiLink>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Form>
                    )}
                </Formik>
            </Container>
        </AuthLayout>
    );
}
