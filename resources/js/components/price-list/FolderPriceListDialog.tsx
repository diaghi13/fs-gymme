import {
  Box,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button,
  Typography,
  Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ClearIcon from "@mui/icons-material/Clear";
import {useState} from "react";
import {PriceListFolderTree} from "@/types";

interface FolderPriceListItemProps {
  folder: any;
  pl?: number;
  onClick: (folder: any) => void;
}

const FolderPriceListItem = ({folder, onClick, pl = 0}: FolderPriceListItemProps) => {
  const [expand, setExpand] = useState(false);
  const isExpandable = folder.children.length > 0;

  const handleExpand = () => {
    setExpand(!expand);
  }

  const handleClick = () => {
    onClick(folder)
  }

  return (
    <>
      <ListItem
        sx={{
          pl: pl + 2,
          pr: 0,
          '&:hover': {
            bgcolor: 'action.hover',
          }
        }}
        secondaryAction={
          <IconButton
            edge="end"
            onClick={handleClick}
            color="primary"
            sx={{ mr: 1 }}
          >
            <CheckCircleIcon />
          </IconButton>
        }
      >
        {isExpandable && (
          <IconButton size="small" onClick={handleExpand} sx={{ mr: 1 }}>
            {!expand ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
          </IconButton>
        )}
        <ListItemIcon sx={{ minWidth: 36 }}>
          {expand ? <FolderOpenIcon color="primary" /> : <FolderIcon />}
        </ListItemIcon>
        <ListItemText
          primary={folder.name}
          primaryTypographyProps={{
            fontWeight: isExpandable ? 500 : 400
          }}
        />
      </ListItem>
      {isExpandable && (
        <Collapse in={expand}>
          {folder.children.map((item: any, index: number) => (
            <FolderPriceListItem folder={item} onClick={onClick} pl={pl + 2} key={index}/>
          ))}
        </Collapse>
      )}
    </>
  )
}

interface FolderPriceListDialogProps {
  priceListOptionsTree: Array<PriceListFolderTree>;
  open: boolean;
  onClose: () => void;
  onSelect: (folder: any) => void;
}

export default function FolderPriceListDialog({priceListOptionsTree, open, onSelect, onClose}: FolderPriceListDialogProps) {
  return (
    <Dialog open={open} fullWidth maxWidth={"md"} onClose={onClose}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon />
          Seleziona cartella genitore
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Scegli una cartella per organizzare gerarchicamente i listini
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{
          height: "50vh",
          overflow: "auto",
          bgcolor: 'background.paper'
        }}>
          <List disablePadding>
            <ListItemButton
              onClick={() => onSelect({id: ""})}
              sx={{
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.selected'
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ClearIcon />
              </ListItemIcon>
              <ListItemText
                primary="Nessuna cartella (radice)"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
            {priceListOptionsTree.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="Nessuna cartella disponibile"
                  secondary="Crea prima una cartella genitore"
                  sx={{ textAlign: 'center', py: 4 }}
                />
              </ListItem>
            ) : (
              priceListOptionsTree.map((item, index: number) => (
                <FolderPriceListItem key={index} folder={item} onClick={onSelect}/>
              ))
            )}
          </List>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Annulla
        </Button>
      </DialogActions>
    </Dialog>
  )
};
