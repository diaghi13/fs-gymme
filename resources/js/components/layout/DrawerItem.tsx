import React, { useState } from "react";
import { SvgIconComponent } from "@mui/icons-material";
import {
    Collapse,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";

import IconExpandMore from "@mui/icons-material/ExpandMore";
import IconExpandLess from "@mui/icons-material/ExpandLess";
import {useTheme} from "@mui/material/styles";
import {Link} from "@inertiajs/react";

interface DrawerCollapsableProps {
    open: boolean;
    items?: any[];
}

const DrawerCollapsable = ({ open, items }: DrawerCollapsableProps) => {
    return (
        <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider />
            <List component="div" disablePadding>
                {items &&
                    items.map((item: any, key: any) => (
                        <DrawerItem {...item} key={key} sub />
                    ))}
            </List>
        </Collapse>
    );
};

interface DrawerItemProps {
    name: string;
    Icon?: SvgIconComponent;
    href?: string;
    items?: any[];
    sub?: boolean;
}

const DrawerItem = ({ name, Icon, href, items, sub }: DrawerItemProps) => {
    //const { url } = usePage();
    const url = window.location.href;
    //const [open, setOpen] = useState(!!items?.some(item => url.startsWith(item.href)));
    const [open, setOpen] =
        useState(items ? items.some(item => url.includes(item.href!)) : false);
    const isExpandable = items && items.length > 0;
    const theme = useTheme();
    const active = url.includes(href!);

    const handleExpand = () => {
        setOpen(!open);
    };

    return href && !isExpandable ? (
        <ListItemButton
            //button
            component={Link}
            href={href}
            //selected={href === location.pathname}
            //selected={url.startsWith(href)}
            selected={active}
            sx={sub ? { borderLeft: `5px solid ${theme.palette.primary.main}` } : {}}
        >
            <ListItemIcon>{Icon && <Icon />}</ListItemIcon>
            <ListItemText
                disableTypography
                primary={
                    <Typography sx={{ wordWrap: "break-word" }}>{name}</Typography>
                }
            />
        </ListItemButton>
    ) : (
        <>
            <ListItemButton onClick={handleExpand}>
                <ListItemIcon>{Icon && <Icon />}</ListItemIcon>
                <ListItemText primary={<Typography>{name}</Typography>} />
                {isExpandable && !open && <IconExpandMore />}
                {isExpandable && open && <IconExpandLess />}
            </ListItemButton>
            <DrawerCollapsable open={open} items={items} />
        </>
    );
};

export default DrawerItem;
