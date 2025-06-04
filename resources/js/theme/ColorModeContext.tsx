import * as React from 'react';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import useLocalStorage from "@/hooks/useLocalStorage";
import {itIT} from "@mui/x-data-grid/locales";
import { itIT as pickersItIT } from '@mui/x-date-pickers/locales';
import { itIT as coreItIT } from '@mui/material/locale';

export const ColorModeContext = React.createContext({
    toggleColorMode: () => {}
});

interface ToggleColorModeProps {
    children: React.ReactNode;
}

export default function ToggleColorMode({children}: ToggleColorModeProps) {
    //const [mode, setMode] = React.useState('light');
    const [mode, setMode] = useLocalStorage('ui.mode', 'light');
    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode: 'light' | 'dark') => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [setMode],
    );

    const theme = React.useMemo(
        () =>
            createTheme(
                {
                    palette: {
                        mode,
                    },
                },
                itIT,
                pickersItIT,
                coreItIT
            ),
        [mode],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}
