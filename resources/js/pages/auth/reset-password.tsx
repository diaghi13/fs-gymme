import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
                <Stack spacing={3}>
                    <TextField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={data.email}
                        autoComplete="email"
                        InputProps={{ readOnly: true }}
                        fullWidth
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        id="password"
                        name="password"
                        label="Nuova Password"
                        type="password"
                        value={data.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        autoFocus
                        fullWidth
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password}
                        placeholder="Inserisci la nuova password"
                    />

                    <TextField
                        id="password_confirmation"
                        name="password_confirmation"
                        label="Conferma Password"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        fullWidth
                        variant="outlined"
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation}
                        placeholder="Conferma la nuova password"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={16} /> : null}
                        sx={{ mt: 2 }}
                    >
                        {processing ? 'Aggiornamento...' : 'Aggiorna Password'}
                    </Button>
                </Stack>
            </Box>
        </AuthLayout>
    );
}
