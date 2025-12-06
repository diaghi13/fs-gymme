import { Head, router } from '@inertiajs/react';
import { Alert, Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

interface Props {
    tenant: {
        id: string;
        name: string;
    };
}

interface ProvisioningStatus {
    is_ready: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    tenant_id: string;
    tenant_name: string;
    error?: string | null;
}

export default function TenantProvisioning({ tenant }: Props) {
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollCountRef = useRef(0);
    const maxPolls = 60; // Maximum 2 minutes (60 * 2 seconds)
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Start polling for tenant status
        const checkStatus = async () => {
            try {
                const response = await fetch(route('central.tenant.status', { tenant: tenant.id }));
                const data: ProvisioningStatus = await response.json();

                pollCountRef.current += 1;

                if (data.is_ready && data.status === 'completed') {
                    // Tenant is ready, redirect to app
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                    }
                    router.visit(route('central.app.redirect', { tenant: tenant.id }));
                } else if (data.status === 'failed') {
                    // Provisioning failed
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                    }
                    setError(data.error || 'Errore durante la creazione del tenant.');
                } else if (pollCountRef.current >= maxPolls) {
                    // Timeout - show error
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                    }
                    setError('Timeout durante la creazione del tenant. Riprova più tardi.');
                }
            } catch (error) {
                console.error('Error checking tenant status:', error);
                setError('Errore durante il controllo dello stato del tenant.');
            }
        };

        // Initial check
        checkStatus();

        // Poll every 2 seconds
        pollIntervalRef.current = setInterval(checkStatus, 2000);

        // Cleanup on unmount
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [tenant.id]);

    return (
        <>
            <Head title="Preparazione ambiente..." />

            <Container maxWidth="sm">
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Stack spacing={4} alignItems="center" textAlign="center">
                        {error ? (
                            <>
                                <Alert severity="error" sx={{ width: '100%' }}>
                                    {error}
                                </Alert>

                                <Stack spacing={2}>
                                    <Typography variant="h4" component="h1" fontWeight={600}>
                                        Errore durante la creazione
                                    </Typography>

                                    <Typography variant="body1" color="text.secondary">
                                        Si è verificato un errore durante la preparazione del tuo ambiente.
                                    </Typography>

                                    <Typography variant="body2" color="text.disabled">
                                        Contatta il supporto per assistenza.
                                    </Typography>
                                </Stack>
                            </>
                        ) : (
                            <>
                                <CircularProgress size={64} thickness={4} />

                                <Stack spacing={2}>
                                    <Typography variant="h4" component="h1" fontWeight={600}>
                                        Stiamo preparando il tuo ambiente
                                    </Typography>

                                    <Typography variant="h6" color="text.secondary">
                                        {tenant.name}
                                    </Typography>

                                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                        Attendere qualche istante mentre configuriamo il tuo spazio di lavoro...
                                    </Typography>

                                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                                        Verrai reindirizzato automaticamente quando tutto sarà pronto.
                                    </Typography>
                                </Stack>
                            </>
                        )}
                    </Stack>
                </Box>
            </Container>
        </>
    );
}
