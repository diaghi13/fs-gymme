import React from "react";
import {
  Box, Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Tab
} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ShutterSpeedIcon from "@mui/icons-material/ShutterSpeed";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CategoryIcon from "@mui/icons-material/Category";
import {PriceListArticle, PriceListMembershipFee, Product} from "@/types";

interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  baseProducts: Product[];
  courseProducts: Product[];
  membershipFees: PriceListMembershipFee[];
  articles: PriceListArticle[];
  onSelect: (entity: Product | PriceListMembershipFee | PriceListArticle) => void;
}

export default function (props: SimpleDialogProps) {
  const [tabValue, setTabValue] = React.useState('1');
  const {onClose, open, baseProducts, courseProducts, membershipFees, articles, onSelect} = props;

  const handleClose = () => {
    onClose();
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleClick = (entity: Product | PriceListMembershipFee | PriceListArticle) => {
    onSelect(entity);
    onClose();
  }

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth={"md"}>
      <DialogTitle>Aggiungi prodotto</DialogTitle>
      <DialogContent>
        <Box sx={{width: '100%', typography: 'body1'}}>
          <TabContext value={tabValue}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
              <TabList onChange={handleChange} aria-label="lab API tabs example" variant={"fullWidth"}>
                <Tab icon={<FitnessCenterIcon/>} label="PRODOTTI BASE" value="1"/>
                <Tab icon={<ShutterSpeedIcon/>} label="CORSI" value="2"/>
                <Tab icon={<CardMembershipIcon/>} label="QUOTE ASSOCIATIVE" value="3"/>
                <Tab icon={<CategoryIcon/>} label="ARTICOLI" value="4"/>
              </TabList>
            </Box>
            <Box sx={{border: "1px solid rgba(0,0,0,0.2)"}}>
              <TabPanel value="1" sx={{p: 0}}>
                <Box sx={{position: "relative", height: "50vh"}}>
                  <Box sx={{maxHeight: "100%", overflow: "auto"}}>
                    <List disablePadding>
                      {baseProducts.map((item, index) => (
                        <ListItemButton
                          key={index}
                          autoFocus
                          onClick={() => handleClick(item)}
                        >
                          <ListItemText primary={item.name}/>
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                </Box>
              </TabPanel>
              <TabPanel value="2" sx={{p: 0}}>
                <Box sx={{position: "relative", height: "50vh"}}>
                  <Box sx={{maxHeight: "100%", overflow: "auto"}}>
                    <List disablePadding>
                      {courseProducts.map((item, index) => (
                        <ListItemButton
                          key={index}
                          autoFocus
                          onClick={() => handleClick(item)}
                        >
                          <ListItemText primary={item.name}/>
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                </Box>
              </TabPanel>
              <TabPanel value="3" sx={{p: 0}}>
                <Box sx={{position: "relative", height: "50vh"}}>
                  <Box sx={{maxHeight: "100%", overflow: "auto"}}>
                    <List disablePadding>
                      {membershipFees.map((item, index) => (
                        <ListItemButton
                          key={index}
                          autoFocus
                          onClick={() => handleClick(item)}
                        >
                          <ListItemText primary={item.name}/>
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                </Box>
              </TabPanel>
              <TabPanel value="4" sx={{p: 0}}>
                <Box sx={{position: "relative", height: "50vh"}}>
                  <Box sx={{maxHeight: "100%", overflow: "auto"}}>
                    <List disablePadding>
                      {articles.map((item, index) => (
                        <ListItemButton
                          key={index}
                          autoFocus
                          onClick={() => handleClick(item)}
                        >
                          <ListItemText primary={item.name}/>
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                </Box>
              </TabPanel>
            </Box>
          </TabContext>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
