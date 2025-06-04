import {
    Avatar,
    Box,
    Button,
    CardContent,
    CardHeader,
    Grid, Link as MuiLink,
    Step,
    StepLabel,
    Stepper,
    Typography
} from "@mui/material";
import React from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {Link} from "@inertiajs/react";
import TextField from "@/components/ui/TextField";

interface RegistrationFormProps {
    steps: Array<string>;
    activeStep: number;
    onReset: () => void;
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;
};

export default function RegistrationForm({steps, activeStep, onReset, onBack, onNext, onSubmit}: RegistrationFormProps) {

    return (
        <>
            <CardHeader
                sx={{px: 0}}
                title={(
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => {
                            const stepProps: { completed?: boolean } = {};
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                )}
            />
            <CardContent>
                <Box sx={{width: '100%'}}>
                    {activeStep === steps.length ? (
                        <React.Fragment>
                            <Typography sx={{mt: 2, mb: 1}}>
                                All steps completed - you&apos;re finished
                            </Typography>
                            <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                                <Box sx={{flex: '1 1 auto'}}/>
                                <Button onClick={onReset}>Reset</Button>
                            </Box>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <Avatar sx={{m: 1, bgcolor: "secondary.main"}}>
                                    <LockOutlinedIcon/>
                                </Avatar>
                                <Typography component="h1" variant="h5">
                                    Registrati
                                </Typography>
                                <Box sx={{mt: 1}}>
                                    {activeStep === 0 && <UserStep/>}
                                    {activeStep === 1 && <CompanyStep/>}
                                    {activeStep === 2 && <StructureStep/>}
                                    <Grid container>
                                        <Grid sx={{mt: 4}}>
                                            <Typography variant="body2">
                                                Hai già un account?
                                                <MuiLink component={Link} href={"/login"} variant="body2">
                                                    {" Accedi"}
                                                </MuiLink>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                                <Button
                                    color="inherit"
                                    disabled={activeStep === 0}
                                    onClick={onBack}
                                    sx={{mr: 1}}
                                >
                                    Indietro
                                </Button>
                                <Box sx={{flex: '1 1 auto'}}/>
                                {activeStep === steps.length - 1
                                    ? (<Button onClick={onSubmit}>Registra</Button>)
                                    : (<Button onClick={onNext}>Prosegui</Button>)
                                }
                            </Box>
                        </React.Fragment>
                    )}
                </Box>
            </CardContent>
        </>
    )
};

const UserStep = () => {
    return (
        <Grid container spacing={2}>
            <Grid size={{xs: 12, md: 6}}>
                <TextField
                    label={"Nome"}
                    name={"user.first_name"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <TextField
                    label={"Cognome"}
                    name={"user.last_name"}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <TextField
                    label={"Indirizzo Email"}
                    name={"user.email"}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <TextField
                    type={"password"}
                    label={"Password"}
                    name={"user.password"}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <TextField
                    type={"password"}
                    label={"Conferma Password"}
                    name={"user.password_confirmation"}
                />
            </Grid>
        </Grid>
    )
}

const CompanyStep = () => {
    return (
        <Grid container spacing={2}>
            <Grid size={{xs: 12}}>
                <TextField
                    label={"Ragione sociale"}
                    name={"company.business_name"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <TextField
                    label={"Codice fiscale"}
                    name={"company.tax_code"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <TextField
                    label={"Partita IVA"}
                    name={"company.vat_number"}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <TextField
                    label={"Indirizzo"}
                    name={"company.street"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 2}}>
                <TextField
                    label={"Numero"}
                    name={"company.number"}
                />
            </Grid>
            <Grid size={{xs: 7}}>
                <TextField
                    label={"Città"}
                    name={"company.city"}
                />
            </Grid>
            <Grid size={{xs: 3}}>
                <TextField
                    label={"CAP"}
                    name={"company.zip_code"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <TextField
                    label={"Provincia"}
                    name={"company.province"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <TextField
                    label={"Nazione"}
                    name={"company.country"}
                />
            </Grid>
        </Grid>
    )
}

const StructureStep = () => {
    return (
        <Grid container spacing={2}>
            <Grid size={{xs: 12}}>
                <TextField
                    label={"Nome struttura"}
                    name={"structure.name"}
                />
            </Grid>
            <Grid size={{xs: 12}}>
                <TextField
                    label={"Indirizzo"}
                    name={"structure.street"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 2}}>
                <TextField
                    label={"Numero"}
                    name={"structure.number"}
                />
            </Grid>
            <Grid size={{xs: 7}}>
                <TextField
                    label={"Città"}
                    name={"structure.city"}
                />
            </Grid>
            <Grid size={{xs: 3}}>
                <TextField
                    label={"CAP"}
                    name={"structure.zip_code"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <TextField
                    label={"Provincia"}
                    name={"structure.province"}
                />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
                <TextField
                    label={"Nazione"}
                    name={"structure.country"}
                />
            </Grid>
        </Grid>
    )
}
