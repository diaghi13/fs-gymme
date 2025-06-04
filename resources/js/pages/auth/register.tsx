import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Form, Formik } from 'formik';
import {
    Container
} from '@mui/material';
import AuthLayout from '@/layouts/auth/AuthLayout';
import { useTheme } from '@mui/material/styles';
import RegistrationForm from '@/components/auth/RegistrationForm';

const steps = ['Utente', 'Azienda', 'Struttura'];

export default function Register() {
    const [activeStep, setActiveStep] = React.useState(0);
    const theme = useTheme();

    useEffect(() => {
        return () => {
            //reset('password', 'password_confirmation');
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
            <Head title="Register" />

            <Formik
                initialValues={{
                    plan_id: null,
                    user: {
                        first_name: '',
                        last_name: '',
                        email: '',
                        password: '',
                        password_confirmation: ''
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
                        country: ''
                    },
                    structure: {
                        name: '',
                        street: '',
                        number: '',
                        city: '',
                        zip_code: '',
                        province: '',
                        country: ''
                    }
                }}
                onSubmit={(values) => {
                    console.log('submitting...');
                    console.log(values);
                    router.post(route('register', values));
                }}
            >
                {({ submitForm }) => (
                    <Form>
                        <Container
                            component="main"
                            maxWidth={'xs'}
                            sx={{
                                //background: theme.palette.background.default,
                                background: theme.palette.background.default,
                                p: 0
                            }}
                        >
                            <RegistrationForm
                                steps={steps}
                                activeStep={activeStep}
                                onBack={handleBack}
                                onNext={handleNext}
                                onReset={handleReset}
                                onSubmit={submitForm}
                            />
                        </Container>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
}
