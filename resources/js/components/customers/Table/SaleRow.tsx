import * as React from 'react';
import currency from 'currency.js';
import { Box, Button, Collapse, Divider, IconButton, List,
  ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Tab, TableCell, TableRow,
  useTheme} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Sale } from '@/types';
import format from '@/support/format';
import { Str } from '@/support/Str';
import PaymentRow from '@/components/customers/Table/PaymentRow';
import PaymentDialog from '@/components/customers/dialogs/PaymentDialog';

interface SaleRowProps {
  sale: Sale;
}

const SaleRow : React.FC<SaleRowProps> = ({sale}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const [value, setValue] = React.useState('1');
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const toggleCollapsed = () => {
    setCollapsed(prevState => !prevState);
  }

  const handleDelete = () => {
    router.delete(route('app.sales.destroy', {sale: sale.id}));
  }

  return (
    <React.Fragment>
      <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
        <TableCell sx={{borderBottom: 'unset', fontWeight: 500}}>
          <IconButton onClick={toggleCollapsed}>
            {collapsed ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{borderBottom: 'unset', fontWeight: 500}}
        >
          {sale.progressive_number}
        </TableCell>
        <TableCell sx={{borderBottom: 'unset', fontWeight: 500}}>
          {format(sale.date, "dd/MM/yyyy HH:mm:ss")}
        </TableCell>
        <TableCell sx={{borderBottom: 'unset'}}>{Str.EURO(sale.summary.total_gross).format()}</TableCell>
        <TableCell sx={{borderBottom: 'unset'}}>{Str.EURO(sale.discount_absolute).format()}</TableCell>
        <TableCell sx={{borderBottom: 'unset'}}>{currency(sale.discount_percentage, {
          symbol: '%',
          decimal: ',',
          separator: '.'
        }).format()}</TableCell>
        <TableCell sx={{borderBottom: 'unset'}}>{Str.EURO(sale.summary.total).format()}</TableCell>
        <TableCell sx={{borderBottom: 'unset'}}>{Str.EURO(sale.summary.payed).format()}</TableCell>
        <TableCell sx={{borderBottom: 'unset'}}>{Str.EURO(sale.summary.due).format()}</TableCell>
        <TableCell sx={{borderBottom: 'unset'}}>
          <>
            <IconButton onClick={handleClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}}
            >
              <MenuItem onClick={() => router.get(route('sales.show', {sale: sale.id}))}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                Modifica
              </MenuItem>
              <MenuItem onClick={handleClose} disabled>
                <ListItemIcon>
                  <ContentCopyIcon fontSize="small" />
                </ListItemIcon>
                Duplica
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDelete} sx={{color: theme.palette.error.main}}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Elimina
              </MenuItem>
            </Menu>
          </>
        </TableCell>
      </TableRow>
      <TableRow sx={{bgcolor: theme.palette.grey["50"]}}>
        <TableCell colSpan={10} style={{paddingBottom: 0, paddingTop: 0}}>
          <Collapse in={!collapsed}>
            <TabContext value={value}>
              <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                  <Tab label="Pagamenti" value="1"/>
                  <Tab label="Prodotti contenuti" value="2"/>
                </TabList>
              </Box>
              <TabPanel value="1" sx={{px:0}}>
                <Box sx={{width: "100%", textAlign:"start"}}>
                  <Button onClick={() => setOpenPaymentDialog(true)}>Inserisci pagamento</Button>
                </Box>
                <List disablePadding>
                  {sale.payments.map((payment: any, index: number) => (
                    <PaymentRow payment={payment} index={index} sale={sale} key={index}/>
                  ))}
                </List>
              </TabPanel>
              <TabPanel value="2" sx={{px:0}}>
                <List>
                  {sale.rows.map((row, index: number) => (
                    <ListItem key={index}>
                      <ListItemText>{row.description}</ListItemText>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            </TabContext>
          </Collapse>
        </TableCell>
      </TableRow>
      {openPaymentDialog && (
        <PaymentDialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} sale={sale}/>
      )}
    </React.Fragment>
  )
};

export default SaleRow
