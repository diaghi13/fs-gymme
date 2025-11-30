import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Stack,
    Link as MuiLink
} from '@mui/material';
import { Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Verifica email"
            description="Verifica il tuo indirizzo email cliccando sul link che ti abbiamo appena inviato."
        >
            <Head title="Verifica email" />

            {status === 'verification-link-sent' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Un nuovo link di verifica è stato inviato all'indirizzo email fornito durante la registrazione.
                </Alert>
            )}

            <Box component="form" onSubmit={submit} sx={{ width: '100%', textAlign: 'center' }}>
                <Stack spacing={3} alignItems="center">
                    <Button
                        type="submit"
                        variant="outlined"
                        size="large"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={16} /> : null}
                    >
                        {processing ? 'Invio in corso...' : 'Reinvia email di verifica'}
                    </Button>

                    <Link href={route('logout')} method="post">
                        <MuiLink component="span" sx={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                            Logout
                        </MuiLink>
                    </Link>
                </Stack>
            </Box>
        </AuthLayout>
    );
}
