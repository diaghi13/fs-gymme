import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import SearchIcon from '@mui/icons-material/Search';
import TagIcon from '@mui/icons-material/Tag';
import HistoryIcon from '@mui/icons-material/History';
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  Typography
} from '@mui/material';
import format from 'date-fns/format';
import axios from 'axios';
import { router } from '@inertiajs/react';

let TYPING_TIMER: number | undefined; //timer identifier
const DONE_TYPING_INTERVAL = 500; //time in ms, 5 seconds for example
export const RECENT_CUSTOMERS_SEARCH_KEY = 'RECENT_CUSTOMERS_SEARCH';

const SET_CUSTOMERS = 'SET_CUSTOMERS';
const FROM_LOCAL_STORAGE = 'FROM_LOCAL_STORAGE';
const HANDLE_FIRST_RENDER = 'HANDLE_FIRST_RENDER';
const HANDLE_CHANGE = 'HANDLE_CHANGE';
const INIT_STATE = 'INIT_STATE';
const HANDLE_SELECT = 'HANDLE_SELECT';
const CLOSE = 'CLOSE';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto'
  }
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2, 0, 0),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(3, 3, 3, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '1.5em',
    [theme.breakpoints.up('sm')]: {
      width: '78%',
      '&:focus': {
        width: '78%'
      }
    }
  }
}));

const storageCustomers = () => {
  const items = localStorage.getItem(RECENT_CUSTOMERS_SEARCH_KEY);
  return items ? JSON.parse(items) : [];
  //return [];
};

const initialState = {
  customers: storageCustomers(),
  isFromLocalStorage: true,
  isFirstRender: true,
  query: '',
  selected: storageCustomers()[0] ?? null
};

const reducer = (state: any, action: { type: string; payload?: any }) => {
  switch (action.type) {
    case SET_CUSTOMERS: {
      const isFromLocalStorage = state.query.length > 0 ? false : true;
      const customers = isFromLocalStorage
        ? storageCustomers()
        : action.payload;
      const selected = customers[0] ?? null;

      return {
        ...state,
        customers,
        isFromLocalStorage,
        selected
      };
    }
    case FROM_LOCAL_STORAGE:
      return {
        ...state,
        isFromLocalStorage: action.payload
      };
    case HANDLE_FIRST_RENDER:
      return {
        ...state,
        isFirstRender: false
      };
    case HANDLE_CHANGE: {
      const query = action.payload;
      return {
        ...state,
        query
      };
    }
    case INIT_STATE:
      return {
        customers: storageCustomers() ?? [],
        isFromLocalStorage: true,
        isFirstRender: true,
        query: '',
        selected: storageCustomers()[0] ?? null
      };
    case HANDLE_SELECT:
      return {
        ...state,
        selected: action.payload
      };
    case CLOSE:
      return {
        ...state,
        isFirstRender: true
      };
    default:
      return state;
  }
};

interface SearchDialogProps {
  open: boolean;
  setOpen: () => void;
}

const SearchDialog = ({ open, setOpen }: SearchDialogProps) => {
  const theme = useTheme();
  const [state, dispatch] = React.useReducer(reducer, initialState, () => initialState);
  const [isLoading, setIsLoading] = React.useState(false);

  const getData = React.useCallback(async () => {
    const response = await axios.get(route('customers.search', { q: state.query }));
    const resData = response.data;

    dispatch({ type: SET_CUSTOMERS, payload: resData });
    setIsLoading(false);
  }, [state.query]);

  React.useEffect(() => {
    clearTimeout(TYPING_TIMER);

    if (!state.isFirstRender) {
      if (state.query.length > 0) {
        setIsLoading(true);
        TYPING_TIMER = setTimeout(getData, DONE_TYPING_INTERVAL);
      } else {
        setIsLoading(false);
        dispatch({ type: INIT_STATE });
        dispatch({ type: SET_CUSTOMERS });
      }
    }

    dispatch({ type: HANDLE_FIRST_RENDER });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getData, state.query]);

  React.useEffect(() => {
    if (open && state.isFirstRender) {
      dispatch({ type: INIT_STATE });
    }
  }, [open, state.isFirstRender]);

  React.useEffect(() => {
    if (!open) {
      dispatch({ type: CLOSE });
    }
  }, [open]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    dispatch({ type: HANDLE_CHANGE, payload: value });
  };

  const handleClick = React.useCallback(
    (customer: any) => () => {
      handleLocalStorageUpdate(customer);
      //handleToggle();
      router.get(route('customers.show', { customer: customer.id }));
    },
    []
  );

  const handleLocalStorageUpdate = (customer: any) => {
    const data: any[] = storageCustomers();
    const newData = data.filter((item) => item.id !== customer.id);
    newData.reverse();
    newData.push(customer);
    if (data.length > 7) {
      newData.shift();
    }
    newData.reverse();

    localStorage.setItem(RECENT_CUSTOMERS_SEARCH_KEY, JSON.stringify(newData));

    return newData;
  };

  const onKeyPressed = React.useCallback(
    (e: any) => {
      let index;
      switch (e.keyCode) {
        case 38:
          index = state.customers.findIndex(
            (customer: any) => customer.id === state.selected?.id
          );
          if (index >= 0) {
            index--;
            if (index < 0) {
              index = state.customers.length - 1;
            }
          }
          dispatch({
            type: HANDLE_SELECT,
            payload: state.customers[index]
          });
          break;
        case 40:
          index = state.customers.findIndex(
            (customer: any) => customer.id === state.selected?.id
          );
          if (index >= 0) {
            index++;
            if (index > state.customers?.length - 1) {
              index = 0;
            }
          }
          dispatch({
            type: HANDLE_SELECT,
            payload: state.customers[index]
          });
          break;
        case 13:
          handleClick(state.selected)();
          break;
      }
    },
    [handleClick, state]
  );

  React.useEffect(() => {
    if (open) {
      window.addEventListener('keydown', onKeyPressed);
      return () => {
        window.removeEventListener('keydown', onKeyPressed);
      };
    }
  }, [open, onKeyPressed]);

  return (
    <Dialog open={open} onClose={setOpen} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ padding: 0, margin: 0 }}>
        <Search sx={{ flexGrow: 1 }}>
          <SearchIconWrapper>
            <SearchIcon sx={{ fontSize: '2em' }} color="primary" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Cerca..."
            inputProps={{ 'aria-label': 'search' }}
            sx={{ width: '100%' }}
            autoFocus
            endAdornment={isLoading && <CircularProgress size={30} />}
            onChange={handleChange}
            value={state.query}
          />
        </Search>
        <Divider />
      </DialogTitle>
      <DialogContent
        sx={{
          height: '70vh',
          minHeight: '384px',
          maxHeight: '488px',
          padding: 0
        }}
      >
        {state.isFromLocalStorage && (
          <>
            <Typography
              marginTop={1}
              marginX={2}
              color="GrayText"
              fontWeight={500}
            >
              Recenti
            </Typography>
          </>
        )}
        {state.customers.length === 0 && (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography m={2} variant="h6" color="GrayText">
              Nessun risultato trovato
            </Typography>
          </Box>
        )}
        <List>
          {state.customers?.map((customer: any, index: number) => {
            const mode = theme.palette.mode;
            const iconDefault =
              mode === 'dark'
                ? theme.palette.common.white
                : theme.palette.grey[800];
            const textDefault =
              mode === 'dark'
                ? theme.palette.common.white
                : theme.palette.common.black;
            const backgroundDefault =
              mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.background.default;
            const backgroundOverDefault =
              mode === 'dark'
                ? theme.palette.grey[700]
                : theme.palette.grey[100];

            const isSelected = customer.id === state.selected?.id;
            const iconColor = isSelected
              ? theme.palette.primary.main
              : iconDefault;
            const color = isSelected ? theme.palette.primary.main : textDefault;
            const background = isSelected
              ? alpha(theme.palette.primary.dark, 0.1)
              : backgroundDefault;
            const backgroundOver = isSelected
              ? alpha(theme.palette.primary.dark, 0.2)
              : backgroundOverDefault;

            return (
              <ListItemButton
                key={index}
                onClick={handleClick(customer)}
                sx={{ background, '&:hover': { background: backgroundOver } }}
              >
                <ListItemIcon>
                  {state.isFromLocalStorage ? (
                    <HistoryIcon sx={{ color: iconColor }} />
                  ) : (
                    <TagIcon sx={{ color: iconColor }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={`${customer?.first_name} ${customer?.last_name}`}
                  secondary={
                    customer?.date_of_birth &&
                    `Data di nascita: ${format(
                      new Date(Date.parse(customer.date_of_birth.replace(/-/g, '/'))).valueOf(),
                      'dd/MM/yyyy'
                    )}`
                  }
                  sx={{ color }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={setOpen}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialog;
