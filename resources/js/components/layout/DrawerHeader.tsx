import React from "react";
import { styled, useTheme } from "@mui/material/styles";

import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface StyledDrawerHeaderProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    dark?: boolean;
}

const StyledDrawerHeader = styled("div", {
    shouldForwardProp: (prop) => prop !== "dark"
})<StyledDrawerHeaderProps>(({ theme  }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    //background: dark ? theme.palette.background.default : theme.palette.primary.dark,
    background: theme.palette.mode === 'dark' ? theme.palette.grey["900"] : theme.palette.primary.dark,
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface DrawerHeaderProps {
    open?: boolean;
    setOpen?: (open: boolean) => void;
    dark?: boolean
}

const DrawerHeader = ({ open, setOpen }: DrawerHeaderProps) => {
    const theme = useTheme();
    //const background = dark ? theme.palette.background.default : theme.palette.primary.main;

    const handleDrawerClose = () => {
        if (open && setOpen) {
            setOpen(false);
        }
    };

    return (
        <StyledDrawerHeader>
            <IconButton onClick={handleDrawerClose}>
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
        </StyledDrawerHeader>
    );
};

export default DrawerHeader;
