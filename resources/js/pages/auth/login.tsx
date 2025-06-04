import React from 'react';
import Checkbox from '@/components/ui/Checkbox';
import {Head, Link, router} from '@inertiajs/react';
import {Formik, Form} from "formik";
import TextField from "@/components/ui/TextField";
import {Avatar, Box, Container, CssBaseline, Grid, Typography, Link as MuiLink} from "@mui/material";
import {useTheme} from "@mui/material/styles";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {LoadingButton} from "@mui/lab";

function Copyright(props: {sx?: object}) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Gymme
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export default function Login({status}: { status?: string, canResetPassword: boolean }) {

    const theme = useTheme();

    return (
        <React.Fragment>
            <Head title="Log in"/>
            <CssBaseline/>

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <Formik
                initialValues={{email: '', password: '', remember: false}}
                onSubmit={(values) => {
                    router.post(route('login'), values);
                }}>
                <Form>
                    <Box
                        sx={{
                            minWidth: "100%",
                            minHeight: "100vh",
                            background: theme.palette.primary.dark,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Container
                            component="main"
                            maxWidth="xs"
                            sx={{
                                background: theme.palette.background.default,
                            }}
                        >
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
                                    Log In
                                </Typography>
                                <Box sx={{mt: 1}}>
                                    <TextField
                                        label="Indirizzo Email"
                                        name="email"
                                        id={"email"}
                                    />
                                    <TextField
                                        type={"password"}
                                        name="password"
                                        label="Password"
                                        id={"password"}
                                        sx={{mt: 2, mb: 2}}
                                    />
                                    <Checkbox label={"Ricordami"} name={"remember"}/>
                                    <LoadingButton
                                        //loading={auth.loading === "pending" ? true : false}
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{mt: 3, mb: 2}}
                                    >
                                        Accedi
                                    </LoadingButton>
                                    <Grid container>
                                        <Grid size={12}>
                                            <MuiLink href="#" variant="body2">
                                                Password dimenticata?
                                            </MuiLink>
                                        </Grid>
                                        <Grid sx={{mt: 4}}>
                                            <Typography variant="body2">
                                                Non hai ancora un account?
                                                <MuiLink component={Link} href={"/register"} variant="body2">
                                                    {" Registrati adesso"}
                                                </MuiLink>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                            <Copyright sx={{mt: 8, mb: 4}}/>
                        </Container>
                    </Box>
                </Form>
            </Formik>
        </React.Fragment>
    );
}
