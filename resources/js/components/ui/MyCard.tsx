import {ReactNode} from "react";
import {Card, CardContent, CardHeader, CardProps} from "@mui/material";

interface MyCardProps extends CardProps {
    title?: string & ReactNode;
    bgColor?: string;
    disableHeaderPadding?: boolean;
    disablePadding?: boolean;
}

export default function MyCard({title, bgColor, children, disableHeaderPadding, disablePadding, ...props}: MyCardProps) {
    //const theme = useTheme();
    //const color = bgColor ? theme.palette.getContrastText(bgColor) : theme.palette.text.primary;
    const headerPadding = disableHeaderPadding && {p: 0};
    const containerPadding = disablePadding ? {p: 0} : {p:2};

    return (
        <Card sx={{display: 'flex', flexDirection: 'column'}} {...props}>
            {/*{title && (<CardHeader title={title} sx={{color, backgroundColor: bgColor}}/>)}*/}
            {title && (<CardHeader title={title} sx={{borderLeft: `10px solid ${bgColor}`, headerPadding}}/>)}

            <CardContent sx={{...containerPadding}}>
                {children}
            </CardContent>
        </Card>
    )
};
