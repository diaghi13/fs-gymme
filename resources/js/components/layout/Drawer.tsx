import {useRef, useState} from "react";
import {
    Box,
    Divider,
    Drawer as MuiDrawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Theme
} from "@mui/material";
import {CSSObject} from "@mui/material/styles";
import DrawerHeader from "./DrawerHeader";
import DrawerItem from "./DrawerItem";

import SettingsIcon from "@mui/icons-material/Settings";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import {drawerWidth} from "@/layouts/AppLayout";

import {menuList, subMenuList} from '@/layouts';

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
});

const StyledDrawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

interface DrawerProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    menuList: typeof menuList;
}

export default function Drawer({open, setOpen, menuList}: DrawerProps){
    const [subMenu, setSubMenu] = useState(false);
    const containerRef = useRef(null);

    const toggleSubMenu = () => {
        setSubMenu((prevState) => !prevState);
    };

    return (
        <StyledDrawer variant="permanent" open={open} ref={containerRef}>
            <DrawerHeader open={open} setOpen={setOpen} />
            <Divider />
            <Box sx={{ width: drawerWidth * 2 }}>
                <Box
                    component="div"
                    sx={
                        !subMenu
                            ? {
                                transform: `translateX(0px)`,
                                transition: "transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
                                display: "inline-block",
                            }
                            : {
                                transform: `translateX(${-drawerWidth}px)`,
                                transition: "transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
                                display: "inline-block",
                            }
                    }
                >
                    <List sx={{ width: drawerWidth }}>
                        {menuList.map((item, index) => (
                            <DrawerItem {...item} key={index} />
                        ))}
                        <ListItemButton onClick={toggleSubMenu}>
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Configurazioni" />
                            <ArrowForwardIcon />
                        </ListItemButton>
                    </List>
                </Box>

                <Box
                    component="div"
                    sx={
                        subMenu
                            ? {
                                transform: `translateX(${-drawerWidth}px)`,
                                transition: "transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
                                display: "inline-block",
                                verticalAlign: "top",
                            }
                            : {
                                transform: `translateX(${drawerWidth}px)`,
                                transition: "transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
                                display: "inline-block",
                                verticalAlign: "top",
                            }
                    }
                >
                    <List sx={{ width: drawerWidth }}>
                        <ListItemButton onClick={toggleSubMenu}>
                            <ListItemIcon>
                                <ArrowBackIosIcon />
                            </ListItemIcon>
                            <ListItemText primary="Esci" />
                        </ListItemButton>
                        {subMenuList.map((item, index) => (
                            <DrawerItem {...item} key={index} />
                        ))}
                    </List>
                </Box>
            </Box>
        </StyledDrawer>
    )
};
