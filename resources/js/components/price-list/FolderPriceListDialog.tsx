import {
  Box, Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
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
      <ListItem sx={{pl, pr:0}}>
        {isExpandable && (
          <IconButton  onClick={handleExpand}>
            {!expand ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
          </IconButton>
        )}
        <ListItemText primary={folder.name}/>
        <IconButton sx={{mr: 2}} onClick={handleClick}>
          <AddIcon/>
        </IconButton>
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
  const theme = useTheme();

  return (
    <Dialog open={open} fullWidth maxWidth={"md"} onClose={onClose}>
      <DialogTitle>
        Listino
      </DialogTitle>
      <DialogContent>
        <Box sx={{border: "1px solid " + theme.palette.grey["300"], height: "50vh"}}>
          <List disablePadding>
            <ListItemButton onClick={() => onSelect({id: ""})}>
              Nessun listino
            </ListItemButton>
            {priceListOptionsTree.map((item, index: number) => (
              <FolderPriceListItem key={index} folder={item} onClick={onSelect}/>
            ))}
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  )
};
