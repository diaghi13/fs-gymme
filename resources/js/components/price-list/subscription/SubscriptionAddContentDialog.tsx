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
  Tab
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ShutterSpeedIcon from "@mui/icons-material/ShutterSpeed";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CategoryIcon from "@mui/icons-material/Category";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import StyleIcon from "@mui/icons-material/Style";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import {
  PriceListArticle,
  PriceListMembershipFee,
  PriceListDayPass,
  PriceListToken,
  PriceListGiftCard,
  Product,
  BookableService
} from '@/types';

interface SubscriptionAddContentDialogProps {
  open: boolean;
  onClose: () => void;
  baseProducts: Product[];
  courseProducts: Product[];
  membershipFees: PriceListMembershipFee[];
  articles: PriceListArticle[];
  bookableServices?: BookableService[];
  dayPasses?: PriceListDayPass[];
  tokens?: PriceListToken[];
  giftCards?: PriceListGiftCard[];
  onAdd: (entity: Product | BookableService | PriceListMembershipFee | PriceListArticle | PriceListDayPass | PriceListToken | PriceListGiftCard) => void;
}

export default function SubscriptionAddContentDialog(props: SubscriptionAddContentDialogProps) {
  const [tabValue, setTabValue] = React.useState('1');
  const {
    onClose,
    open,
    baseProducts,
    courseProducts,
    bookableServices = [],
    membershipFees,
    articles,
    dayPasses = [],
    tokens = [],
    giftCards = [],
    onAdd
  } = props;

  const handleClose = () => {
    onClose();
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleClick = (entity: Product | BookableService | PriceListMembershipFee | PriceListArticle | PriceListDayPass | PriceListToken | PriceListGiftCard) => {
    onAdd(entity);
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth={"md"}>
      <DialogTitle>Aggiungi prodotto</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label="lab API tabs example" variant={"scrollable"} scrollButtons="auto">
                <Tab icon={<FitnessCenterIcon />} label="PRODOTTI BASE" value="1" />
                <Tab icon={<ShutterSpeedIcon />} label="CORSI" value="2" />
                <Tab icon={<EventAvailableIcon />} label="SERVIZI PRENOTABILI" value="3" />
                <Tab icon={<CardMembershipIcon />} label="QUOTE ASSOCIATIVE" value="4" />
                <Tab icon={<CategoryIcon />} label="ARTICOLI" value="5" />
                <Tab icon={<ConfirmationNumberIcon />} label="DAY PASS" value="6" />
                <Tab icon={<StyleIcon />} label="TOKEN/CARNET" value="7" />
                <Tab icon={<CardGiftcardIcon />} label="GIFT CARD" value="8" />
              </TabList>
            </Box>

            <TabPanel value="1" sx={{ p: 0 }}>
              <Box sx={{ position: "relative", height: "50vh" }}>
                <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
                  <List disablePadding>
                    {baseProducts.map((item, index) => (
                      <ListItemButton
                        key={index}
                        autoFocus
                        onClick={() => handleClick(item)}
                      >
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value="2" sx={{ p: 0 }}>
              <Box sx={{ position: "relative", height: "50vh" }}>
                <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
                  <List disablePadding>
                    {courseProducts.map((item, index) => (
                      <ListItemButton
                        key={index}
                        autoFocus
                        onClick={() => handleClick(item)}
                      >
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value="3" sx={{ p: 0 }}>
              <Box sx={{ position: "relative", height: "50vh" }}>
                <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
                  <List disablePadding>
                    {bookableServices.map((item, index) => (
                      <ListItemButton
                        key={index}
                        autoFocus
                        onClick={() => handleClick(item)}
                      >
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value="4" sx={{ p: 0 }}>
              <Box sx={{ position: "relative", height: "50vh" }}>
                <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
                  <List disablePadding>
                    {membershipFees.map((item, index) => (
                      <ListItemButton
                        key={index}
                        autoFocus
                        onClick={() => handleClick(item)}
                      >
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value="5" sx={{ p: 0 }}>
              <Box sx={{ position: "relative", height: "50vh" }}>
                <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
                  <List disablePadding>
                    {articles.map((item, index) => (
                      <ListItemButton
                        key={index}
                        autoFocus
                        onClick={() => handleClick(item)}
                      >
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value="6" sx={{ p: 0 }}>
              <Box sx={{ position: "relative", height: "50vh" }}>
                <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
                  <List disablePadding>
                    {dayPasses.map((item, index) => (
                      <ListItemButton
                        key={index}
                        autoFocus
                        onClick={() => handleClick(item)}
                      >
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value="7" sx={{ p: 0 }}>
              <Box sx={{ position: "relative", height: "50vh" }}>
                <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
                  <List disablePadding>
                    {tokens.map((item, index) => (
                      <ListItemButton
                        key={index}
                        autoFocus
                        onClick={() => handleClick(item)}
                      >
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value="8" sx={{ p: 0 }}>
              <Box sx={{ position: "relative", height: "50vh" }}>
                <Box sx={{ maxHeight: "100%", overflow: "auto" }}>
                  <List disablePadding>
                    {giftCards.map((item, index) => (
                      <ListItemButton
                        key={index}
                        autoFocus
                        onClick={() => handleClick(item)}
                      >
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Box>
            </TabPanel>
          </TabContext>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annulla</Button>
      </DialogActions>
    </Dialog>
  );
}
