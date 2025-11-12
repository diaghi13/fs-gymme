import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Stack,
    Link as MuiLink
} from '@mui/material';
import { Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout title="Password dimenticata" description="Inserisci la tua email per ricevere il link di reset">
            <Head title="Password dimenticata" />

            {status && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {status}
                </Alert>
            )}

            <Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
                <Stack spacing={3}>
                    <TextField
                        id="email"
                        name="email"
                        label="Indirizzo Email"
                        type="email"
                        value={data.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                        autoComplete="off"
                        autoFocus
                        fullWidth
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email}
                        placeholder="email@esempio.com"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={16} /> : null}
                        sx={{ mt: 3 }}
                    >
                        {processing ? 'Invio in corso...' : 'Invia Link di Reset'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Oppure{' '}
                            <Link href={route('login')}>
                                <MuiLink component="span" sx={{ cursor: 'pointer' }}>
                                    torna al login
                                </MuiLink>
                            </Link>
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </AuthLayout>
    );
}
