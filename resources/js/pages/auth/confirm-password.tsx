import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Stack
} from '@mui/material';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Conferma la tua password"
            description="Questa è un'area sicura dell'applicazione. Conferma la tua password per continuare."
        >
            <Head title="Conferma password" />

            <Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
                <Stack spacing={3}>
                    <TextField
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        value={data.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                        autoComplete="current-password"
                        autoFocus
                        fullWidth
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password}
                        placeholder="Inserisci la tua password"
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
                        {processing ? 'Verifica in corso...' : 'Conferma Password'}
                    </Button>
                </Stack>
            </Box>
        </AuthLayout>
    );
}
