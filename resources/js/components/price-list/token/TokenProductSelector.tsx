import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Tab,
  Chip
} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ShutterSpeedIcon from "@mui/icons-material/ShutterSpeed";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import {
  Product,
  BookableService
} from "@/types";

interface TokenProductSelectorProps {
  open: boolean;
  onClose: () => void;
  baseProducts: Product[];
  courseProducts: Product[];
  bookableServices: BookableService[];
  selectedProducts: number[];
  onSelect: (productId: number) => void;
  onToggleAll: () => void;
  allProductsSelected: boolean;
}

export default function TokenProductSelector(props: TokenProductSelectorProps) {
  const [tabValue, setTabValue] = React.useState('1');
  const {
    onClose,
    open,
    baseProducts,
    courseProducts,
    bookableServices,
    selectedProducts,
    onSelect,
    onToggleAll,
    allProductsSelected
  } = props;

  const handleClose = () => {
    onClose();
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const isSelected = (productId: number) => {
    return selectedProducts.includes(productId);
  };

  const handleClick = (productId: number) => {
    onSelect(productId);
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth={"md"}>
      <DialogTitle>
        Seleziona prodotti applicabili
        {allProductsSelected && (
          <Chip
            label="Tutti i prodotti"
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button
            variant={allProductsSelected ? "contained" : "outlined"}
            onClick={onToggleAll}
            fullWidth
          >
            {allProductsSelected ? "✓ Tutti i prodotti selezionati" : "Seleziona tutti i prodotti"}
          </Button>
        </Box>

        {!allProductsSelected && (
          <Box sx={{width: '100%', typography: 'body1'}}>
            <TabContext value={tabValue}>
              <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <TabList onChange={handleChange} aria-label="product tabs">
                  <Tab icon={<FitnessCenterIcon/>} label="PRODOTTI BASE" value="1"/>
                  <Tab icon={<ShutterSpeedIcon/>} label="CORSI" value="2"/>
                  <Tab icon={<EventAvailableIcon/>} label="SERVIZI PRENOTABILI" value="3"/>
                </TabList>
              </Box>
              <Box sx={{border: "1px solid rgba(0,0,0,0.2)"}}>
                <TabPanel value="1" sx={{p: 0}}>
                  <Box sx={{position: "relative", height: "50vh"}}>
                    <Box sx={{maxHeight: "100%", overflow: "auto"}}>
                      <List disablePadding>
                        {baseProducts.map((item) => (
                          <ListItemButton
                            key={item.id}
                            selected={isSelected(item.id!)}
                            onClick={() => handleClick(item.id!)}
                          >
                            <ListItemText
                              primary={item.name}
                              secondary={isSelected(item.id!) ? "✓ Selezionato" : ""}
                            />
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
                        {courseProducts.map((item) => (
                          <ListItemButton
                            key={item.id}
                            selected={isSelected(item.id!)}
                            onClick={() => handleClick(item.id!)}
                          >
                            <ListItemText
                              primary={item.name}
                              secondary={isSelected(item.id!) ? "✓ Selezionato" : ""}
                            />
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
                        {bookableServices.map((item) => (
                          <ListItemButton
                            key={item.id}
                            selected={isSelected(item.id!)}
                            onClick={() => handleClick(item.id!)}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {item.name}
                                  <Chip
                                    icon={<EventAvailableIcon />}
                                    label="Prenotabile"
                                    size="small"
                                    color="secondary"
                                  />
                                </Box>
                              }
                              secondary={isSelected(item.id!) ? "✓ Selezionato" : "Richiede prenotazione"}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </TabPanel>
              </Box>
            </TabContext>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
}

