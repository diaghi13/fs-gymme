import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Stack,
    Paper,
    Container
} from '@mui/material';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Impostazioni Password',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('app.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <Head title="Impostazioni Password" />

                <Container maxWidth="md">
                    <Paper elevation={1} sx={{ p: 4 }}>
                        <Typography variant="h5" component="h1" gutterBottom>
                            Aggiorna Password
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Assicurati che il tuo account utilizzi una password lunga e casuale per rimanere sicuro.
                        </Typography>

                        {recentlySuccessful && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                Password aggiornata con successo!
                            </Alert>
                        )}

                        <Box component="form" onSubmit={updatePassword}>
                            <Stack spacing={3}>
                                <TextField
                                    inputRef={currentPasswordInput}
                                    id="current_password"
                                    name="current_password"
                                    label="Password Attuale"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.current_password}
                                    helperText={errors.current_password}
                                    required
                                />

                                <TextField
                                    inputRef={passwordInput}
                                    id="password"
                                    name="password"
                                    label="Nuova Password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    required
                                />

                                <TextField
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    label="Conferma Nuova Password"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.password_confirmation}
                                    helperText={errors.password_confirmation}
                                    required
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={processing}
                                        startIcon={processing ? <CircularProgress size={16} /> : null}
                                    >
                                        {processing ? 'Aggiornamento...' : 'Aggiorna Password'}
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>
                    </Paper>
                </Container>
            </SettingsLayout>
        </AppLayout>
    );
}
