import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Stack,
    Paper,
    Container,
    Link as MuiLink,
    Fade
} from '@mui/material';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Impostazioni Profilo',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('app.profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Impostazioni Profilo" />

            <SettingsLayout>
                <Container maxWidth="md">
                    <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
                        <Typography variant="h5" component="h1" gutterBottom>
                            Informazioni Profilo
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Aggiorna il tuo nome e indirizzo email.
                        </Typography>

                        <Box component="form" onSubmit={submit}>
                            <Stack spacing={3}>
                                <TextField
                                    id="name"
                                    name="name"
                                    label="Nome"
                                    value={data.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                    autoComplete="name"
                                    autoFocus
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    required
                                    placeholder="Inserisci il tuo nome"
                                />

                                <TextField
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                                    autoComplete="username"
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    required
                                    placeholder="indirizzo@email.com"
                                />

                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <Alert severity="warning">
                                        Il tuo indirizzo email non è verificato.{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                        >
                                            <MuiLink component="span" sx={{ cursor: 'pointer' }}>
                                                Clicca qui per rinviare l'email di verifica.
                                            </MuiLink>
                                        </Link>

                                        {status === 'verification-link-sent' && (
                                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                                                Un nuovo link di verifica è stato inviato al tuo indirizzo email.
                                            </Typography>
                                        )}
                                    </Alert>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={processing}
                                        startIcon={processing ? <CircularProgress size={16} /> : null}
                                    >
                                        {processing ? 'Salvataggio...' : 'Salva'}
                                    </Button>

                                    <Fade in={recentlySuccessful}>
                                        <Typography variant="body2" color="success.main">
                                            Salvato
                                        </Typography>
                                    </Fade>
                                </Box>
                            </Stack>
                        </Box>
                    </Paper>

                    {/* TODO: Convertire anche DeleteUser component quando necessario */}
                    {/* <DeleteUser /> */}
                </Container>
            </SettingsLayout>
        </AppLayout>
    );
}
