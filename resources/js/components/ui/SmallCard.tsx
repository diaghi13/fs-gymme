import React from "react";
import {
  Typography,
  styled,
  CardContent,
  Skeleton,
  Box,
  CardHeader,
  IconButton,
  useTheme,
  Chip,
} from "@mui/material";
import Paper, {PaperProps} from "@mui/material/Paper";
import {
  default as MuiCard,
  CardProps as MuiCardProps,
} from "@mui/material/Card";
import {MoreVert, SvgIconComponent} from "@mui/icons-material";

const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "color",
})<PaperProps>(({color, theme}) => ({
  overflow: "hidden",
  position: "relative",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  background: color ? color : theme.palette.background.paper,
  "&::before": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: "50%",
    top: -145,
    right: -100,
    opacity: 0.5,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: "50%",
    top: 30,
    right: -100,
  },
}));

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== "color",
})<MuiCardProps>((/*{ color, theme }*/) => ({
  background: "transparent",
}));

interface CardProps {
  title: string;
  content: string | number;
  secondary?: string;
  color?: string;
  loading?: boolean;
  Icon?: SvgIconComponent;
  hasAction?: boolean;
  ActionIcon?: SvgIconComponent;
  iconSize?: "small";
  onHeaderActionClick?: () => void;
  chip?: boolean;
  chipProps?: {
    label: string;
    color: "success" | "warning" | "secondary" | "default" | "primary" | "error" | "info";
  }
}

const SmallCard = (
  {
    title,
    content,
    secondary,
    Icon,
    color,
    loading,
    iconSize,
    hasAction,
    ActionIcon,
    onHeaderActionClick,
    chip = false,
    chipProps
  }: CardProps) => {
  const skeletonAnimation = "wave";
  const iconFontSize = iconSize && iconSize === "small" ? 30 : 60;
  const theme = useTheme();
  const textContentColor = color
    ? theme.palette.getContrastText(color)
    : theme.palette.text.primary;

  return (
    <StyledPaper color={color}>
      <StyledCard color={color} sx={{zIndex: 1}}>
        <CardHeader
          action={
            hasAction && (
              <IconButton aria-label="settings" onClick={onHeaderActionClick}>
                {ActionIcon ? <ActionIcon/> : <MoreVert/>}
              </IconButton>
            )}
          title={title}
          sx={{pb: 0, color: textContentColor}}
        />
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography sx={{color: textContentColor}}>
                {loading ? <Skeleton animation={skeletonAnimation}/> : content}
              </Typography>
              {secondary && (
                <Typography sx={{color: textContentColor}}>
                  {loading ? (
                    <Skeleton animation={skeletonAnimation}/>
                  ) : (
                    secondary
                  )}
                </Typography>
              )}
            </Box>
            {Icon && (
              <Box sx={{verticalAlign: "center"}}>
                <Icon sx={{fontSize: iconFontSize}}/>
              </Box>
            )}
            {chip && <Chip label={chipProps?.label} color={chipProps?.color}/>}
          </Box>
        </CardContent>
      </StyledCard>
    </StyledPaper>
  );
};

export default SmallCard;
