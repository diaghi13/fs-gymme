import React, {PropsWithChildren} from "react";
import {Box, CssBaseline} from "@mui/material";
import {useTheme} from "@mui/material/styles";

export default function AuthLayout({children}: PropsWithChildren){
    const theme = useTheme();

    return (
        <Box
            sx={{
                minWidth: "100%",
                minHeight: "100vh",
                background: theme.palette.primary.dark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: 0,
            }}
        >
            <CssBaseline/>
            {children}
        </Box>
    )
};
