import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface OnboardingWizardProps {
    open: boolean;
    tenantName: string;
    trialEndsAt: string;
}

const steps = [
    'Benvenuto',
    'Setup Iniziale',
    'Prossimi Passi',
];

export default function OnboardingWizard({ open, tenantName, trialEndsAt }: OnboardingWizardProps) {
    const [activeStep, setActiveStep] = useState(0);
    const page = usePage<PageProps>();
    const tenantId = page.props.currentTenantId;

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            // Complete onboarding
            router.post(route('app.onboarding.complete', { tenant: tenantId }), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Onboarding completed');
                },
            });
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSkip = () => {
        router.post(route('app.onboarding.complete', { tenant: tenantId }), {}, {
            preserveScroll: true,
        });
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Benvenuto su {tenantName}! 🎉
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Siamo felici di averti con noi! Questo wizard ti guiderà attraverso i primi passi
                            per configurare la tua palestra.
                        </Typography>
                        <Alert severity="success" sx={{ mt: 2 }}>
                            La tua prova gratuita scade il {new Date(trialEndsAt).toLocaleDateString('it-IT')}
                        </Alert>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Cosa faremo insieme:
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon color="primary" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Configura le impostazioni base" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon color="primary" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Aggiungi membri del team" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon color="primary" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Inizia a gestire clienti" />
                                </ListItem>
                            </List>
                        </Box>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Setup Iniziale
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Ecco cosa puoi fare per iniziare:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <SettingsIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Configura le impostazioni"
                                    secondary="Personalizza le impostazioni della tua palestra"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <PersonAddIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Invita il team"
                                    secondary="Aggiungi istruttori e staff alla piattaforma"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <FitnessCenterIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Crea prodotti e abbonamenti"
                                    secondary="Configura i tuoi servizi e piani tariffari"
                                />
                            </ListItem>
                        </List>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Sei Pronto! 🚀
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Hai completato l'introduzione. Ora puoi iniziare ad esplorare tutte le funzionalità
                            della piattaforma.
                        </Typography>
                        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                            Puoi sempre accedere alla documentazione e al supporto dal menu principale.
                        </Alert>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <DashboardIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Dashboard"
                                    secondary="Monitora le statistiche principali"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <PersonAddIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Clienti"
                                    secondary="Gestisci i tuoi clienti e abbonamenti"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <SettingsIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Impostazioni"
                                    secondary="Personalizza la piattaforma"
                                />
                            </ListItem>
                        </List>
                    </Box>
                );
            default:
                return null;
        }
    };

    const handleClose = (_event?: object, reason?: string) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="onboarding-dialog-title"
            aria-describedby="onboarding-dialog-description"
        >
            <DialogTitle id="onboarding-dialog-title">
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            </DialogTitle>
            <DialogContent id="onboarding-dialog-description">
                <Box sx={{ mb: 3, mt: 1 }}>
                    <Box
                        sx={{
                            height: 4,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                width: `${((activeStep + 1) / steps.length) * 100}%`,
                                bgcolor: 'primary.main',
                                transition: 'width 0.3s ease-in-out',
                            }}
                        />
                    </Box>
                </Box>
                {renderStepContent(activeStep)}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleSkip} color="inherit">
                    Salta
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep > 0 && (
                    <Button onClick={handleBack}>
                        Indietro
                    </Button>
                )}
                <Button onClick={handleNext} variant="contained">
                    {activeStep === steps.length - 1 ? 'Inizia' : 'Avanti'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
