import React from "react";
import {
  Typography,
  styled,
  CardHeader,
  IconButton,
  CardContent,
  Skeleton,
  Avatar,
  Grid, Box,
} from "@mui/material";
import Paper, { PaperProps } from "@mui/material/Paper";
import {
  default as MuiCard,
  CardProps as MuiCardProps,
} from "@mui/material/Card";
//import {Sparklines, SparklinesBars, SparklinesLine, SparklinesNormalBand} from "react-sparklines";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import {useTheme} from "@mui/material/styles";
import { Color } from '@/support/Color';
import { SparkLineChart } from '@mui/x-charts';

const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "color",
})<PaperProps>(({ color, theme }) => ({
  overflow: "hidden",
  position: "relative",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  background: color ? theme.palette[color].main : theme.palette.primary.main,
  "&::before": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    background:
      color && color === "secondary"
        ? //? theme.palette.secondary.dark
        `linear-gradient(45deg, rgba(2,0,36,0) 0%, ${Color.hexToRgbA(
          theme.palette.secondary.dark
        )} 30%)`
        : `linear-gradient(45deg, rgba(2,0,36,0) 0%, ${Color.hexToRgbA(
          theme.palette.primary.dark
        )} 30%)`,
    //: theme.palette.primary.dark,
    borderRadius: "50%",
    top: -125,
    right: -15,
    opacity: 0.5,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    //background: "rgb(69, 39, 160)",
    background:
      color && color === "secondary"
        ? //? theme.palette.secondary.dark
          //: theme.palette.primary.dark,
        `linear-gradient(45deg, rgba(2,0,36,0) 0%, ${Color.hexToRgbA(
          theme.palette.secondary.dark
        )} 40%)`
        : `linear-gradient(45deg, rgba(2,0,36,0) 0%, ${Color.hexToRgbA(
          theme.palette.primary.dark
        )} 40%)`,
    borderRadius: "50%",
    top: -85,
    right: -95,
  },
}));

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== "color",
})<MuiCardProps>((/*{ color, theme }*/) => ({
  background: "transparent",
  //background: color ? theme.palette[color].main : theme.palette.primary.main,
  //position: "relative",
  /*"&::before": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    background:
      color && color === "secondary"
        ? theme.palette.secondary.dark
        : theme.palette.primary.dark,
    borderRadius: "50%",
    top: -125,
    right: -15,
    opacity: 0.5,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    //background: "rgb(69, 39, 160)",
    background:
      color && color === "secondary"
        ? theme.palette.secondary.dark
        : theme.palette.primary.dark,
    borderRadius: "50%",
    top: -85,
    right: -95,
  },*/
}));

interface CardProps {
  title?: string;
  content: string | number;
  description?: string;
  link?: {
    href: string;
    name: string;
  };
  details?: number[];
  color?: string;
  loading?: boolean;
}

const Card = ({content, description, link, details, color = "primary", loading,}: CardProps) => {
  const theme = useTheme();
  return (
    <StyledPaper color={color}>
      <StyledCard color={color} sx={{ zIndex: 1 }}>
        <CardHeader
          sx={{ pb: 0 }}
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={
            loading ? (
              <Skeleton animation={"wave"} />
            ) : (
              //<Title background={color}>{title}</Title>
              <Avatar
                variant="rounded"
                sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <FitnessCenterIcon />
              </Avatar>
            )
          }
        />
        <CardContent>
          <Grid container>
            <Grid size={8}>
              <Typography component="p" variant="h4" color="white">
                {loading ? <Skeleton animation={"wave"} /> : content}
              </Typography>
              {description && (
                <Typography color="white" sx={{ flex: 1 }}>
                  {loading ? (
                    <Skeleton animation={"wave"} />
                  ) : (
                    description
                  )}
                </Typography>
              )}
              {link && (
                <div>
                  {loading ? (
                    <Skeleton animation={"wave"} />
                  ) : (
                    /*<Link color="white" to={link.href} onClick={preventDefault}>
                      link.name
                    </Link>*/
                    null
                  )}
                </div>
              )}
            </Grid>
            <Grid size={4} sx={{p: 0}}>
              {!loading && details && (
                <Box sx={{ flexGrow: 1 }}>
                  <SparkLineChart
                    plotType="bar"
                    data={Object.values(details) as number[]}
                    height={60}
                    showTooltip
                    //colors={[color === "primary" ? theme.palette.secondary.main : theme.palette.primary.main]}
                    xAxis={{
                      scaleType: 'band',
                      data: Object.keys(details),
                    }}
                  />
                </Box>
                /*<Sparklines data={details} >
                  <SparklinesBars
                    //color="white"
                    style={{ fill: "white" }}
                  />
                </Sparklines>*/
              )}
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>
    </StyledPaper>
  );
};

export default Card;
