import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Form, Formik } from 'formik';
import { Container } from '@mui/material';
import AuthLayout from '@/layouts/auth/AuthLayout';
import { useTheme } from '@mui/material/styles';
import TenantRegistrationForm from '@/components/auth/TenantRegistrationForm';
import * as Yup from 'yup';

const steps = ['Tenant', 'Utente', 'Azienda', 'Struttura'];

interface TenantRegistrationProps {
    trialDays: number;
}

const validationSchema = Yup.object().shape({
    tenant: Yup.object().shape({
        name: Yup.string()
            .required('Il nome del tenant è obbligatorio')
            .min(3, 'Il nome deve essere almeno 3 caratteri')
            .max(255, 'Il nome non può superare 255 caratteri'),
        email: Yup.string()
            .required('L\'email è obbligatoria')
            .email('Inserisci un\'email valida'),
        phone: Yup.string()
            .nullable()
            .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Numero di telefono non valido'),
    }),
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
    company: Yup.object().shape({
        business_name: Yup.string()
            .required('La ragione sociale è obbligatoria')
            .max(255),
        tax_code: Yup.string()
            .required('Il codice fiscale è obbligatorio')
            .max(50),
        vat_number: Yup.string()
            .required('La partita IVA è obbligatoria')
            .max(50),
        street: Yup.string()
            .required('La via è obbligatoria')
            .max(255),
        city: Yup.string()
            .required('La città è obbligatoria')
            .max(100),
        zip_code: Yup.string()
            .required('Il CAP è obbligatorio')
            .max(20),
    }),
    structure: Yup.object().shape({
        name: Yup.string()
            .required('Il nome della struttura è obbligatorio')
            .max(255),
        street: Yup.string()
            .required('La via è obbligatoria')
            .max(255),
        city: Yup.string()
            .required('La città è obbligatoria')
            .max(100),
        zip_code: Yup.string()
            .required('Il CAP è obbligatorio')
            .max(20),
    }),
    terms_accepted: Yup.boolean()
        .oneOf([true], 'Devi accettare i termini e condizioni'),
});

export default function TenantRegistration({ trialDays }: TenantRegistrationProps) {
    const [activeStep, setActiveStep] = React.useState(0);
    const theme = useTheme();

    useEffect(() => {
        return () => {
            // Cleanup
        };
    }, []);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <AuthLayout>
            <Head title="Registrazione Tenant" />

            <Formik
                initialValues={{
                    tenant: {
                        name: '',
                        email: '',
                        phone: '',
                        vat_number: '',
                        tax_code: '',
                        address: '',
                        city: '',
                        postal_code: '',
                        country: 'IT',
                        pec_email: '',
                        sdi_code: '',
                    },
                    user: {
                        first_name: '',
                        last_name: '',
                        email: '',
                        password: '',
                        password_confirmation: '',
                    },
                    company: {
                        business_name: '',
                        tax_code: '',
                        vat_number: '',
                        street: '',
                        number: '',
                        city: '',
                        zip_code: '',
                        province: '',
                        country: 'IT',
                    },
                    structure: {
                        name: '',
                        street: '',
                        number: '',
                        city: '',
                        zip_code: '',
                        province: '',
                        country: 'IT',
                        phone: '',
                        email: '',
                    },
                    terms_accepted: false,
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                    router.post(route('tenant.register.store'), values, {
                        onSuccess: () => {
                            console.log('Registration successful');
                        },
                        onError: (errors) => {
                            console.error('Registration failed', errors);
                            setErrors(errors);
                            setSubmitting(false);
                        },
                        onFinish: () => {
                            setSubmitting(false);
                        },
                    });
                }}
            >
                {({ submitForm, isSubmitting, isValid }) => (
                    <Form>
                        <Container
                            component="main"
                            maxWidth="md"
                            sx={{
                                background: theme.palette.background.default,
                                p: 0,
                            }}
                        >
                            <TenantRegistrationForm
                                steps={steps}
                                activeStep={activeStep}
                                onBack={handleBack}
                                onNext={handleNext}
                                onReset={handleReset}
                                onSubmit={submitForm}
                                trialDays={trialDays}
                                isSubmitting={isSubmitting}
                                isValid={isValid}
                            />
                        </Container>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
}
