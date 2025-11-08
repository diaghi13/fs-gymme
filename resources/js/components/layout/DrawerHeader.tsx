import React from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Dumbbell } from "lucide-react";

interface StyledDrawerHeaderProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    dark?: boolean;
}

const StyledDrawerHeader = styled("div", {
    shouldForwardProp: (prop) => prop !== "dark"
})<StyledDrawerHeaderProps>(({ theme  }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0, 2),
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

    const handleDrawerClose = () => {
        if (open && setOpen) {
            setOpen(false);
        }
    };

    return (
        <StyledDrawerHeader>
            {open && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Dumbbell size={28} color="white" />
                    <Typography variant="h6" color="white" fontWeight={700} letterSpacing={0.5}>
                        GymMe
                    </Typography>
                </Box>
            )}
            <IconButton onClick={handleDrawerClose} sx={{ color: 'white', ml: open ? 0 : 'auto' }}>
                {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
        </StyledDrawerHeader>
    );
};

export default DrawerHeader;
