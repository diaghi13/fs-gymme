import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Form, Formik } from 'formik';
import { Container, Alert } from '@mui/material';
import AuthLayout from '@/layouts/auth/AuthLayout';
import { useTheme } from '@mui/material/styles';
import TenantRegistrationForm from '@/components/auth/TenantRegistrationForm';
import * as Yup from 'yup';

const steps = ['Utente', 'Azienda', 'Struttura'];

interface TenantRegistrationProps {
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
        phone: Yup.string()
            .required('Il telefono è obbligatorio')
            .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Numero di telefono non valido'),
        email: Yup.string()
            .required('L\'email è obbligatoria')
            .email('Inserisci un\'email valida'),
        pec_email: Yup.string()
            .required('La PEC è obbligatoria')
            .email('Inserisci una PEC valida'),
        sdi_code: Yup.string()
            .nullable()
            .max(7, 'Il codice SDI non può superare 7 caratteri'),
    }),
    structure: Yup.object().shape({
        same_as_company: Yup.boolean(),
        name: Yup.string().when('same_as_company', {
            is: false,
            then: (schema) => schema.required('Il nome della struttura è obbligatorio').max(255),
            otherwise: (schema) => schema.nullable(),
        }),
        street: Yup.string().when('same_as_company', {
            is: false,
            then: (schema) => schema.required('La via è obbligatoria').max(255),
            otherwise: (schema) => schema.nullable(),
        }),
        city: Yup.string().when('same_as_company', {
            is: false,
            then: (schema) => schema.required('La città è obbligatoria').max(100),
            otherwise: (schema) => schema.nullable(),
        }),
        zip_code: Yup.string().when('same_as_company', {
            is: false,
            then: (schema) => schema.required('Il CAP è obbligatorio').max(20),
            otherwise: (schema) => schema.nullable(),
        }),
    }),
    terms_accepted: Yup.boolean()
        .oneOf([true], 'Devi accettare i termini e condizioni'),
});

export default function TenantRegistration({ trialDays }: TenantRegistrationProps) {
    const [activeStep, setActiveStep] = React.useState(0);
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
                        phone: '',
                        email: '',
                        pec_email: '',
                        sdi_code: '',
                    },
                    structure: {
                        same_as_company: false,
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
                                serverError={serverError}
                                onClearError={() => setServerError(null)}
                            />
                        </Container>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
}
