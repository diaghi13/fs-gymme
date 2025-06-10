import useLocalStorage from '@/hooks/useLocalStorage';
import {
  Avatar, Box, Card, CardContent, CardHeader, IconButton, List, ListItem, ListItemAvatar,
  ListItemText, Typography, useTheme
} from '@mui/material';
import * as React from 'react';
import { usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';

import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import CakeIcon from '@mui/icons-material/Cake';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PlaceIcon from '@mui/icons-material/Place';
import format from '@/support/format';
import { Str } from '@/support/Str';

const DetailsCard = () => {
  const { customer } = usePage<CustomerShowProps>().props;
  const theme = useTheme();
  const [blurRegistry] = useLocalStorage('blur_customer', false);

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.primary.main,
        transition: 'filter 0.25s ease-in',
        filter: blurRegistry ? 'blur(5px)' : 'blur(0px)'
      }}
    >
      <CardHeader
        title={
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <IconButton onClick={() => {
              }}>
                <AddAPhotoIcon />
              </IconButton>
              <IconButton onClick={() => {}}>
                <FilterNoneIcon />
              </IconButton>
            </Box>
            <Box sx={{ paddingLeft: 10, paddingRight: 10 }}>
              <img
                src={`/assets/img/user.png`}
                alt="user"
                style={{ width: '100%', height: 'auto' }}
              />
            </Box>
            <Typography align="center" variant="h5" color="white">
              {`${customer.first_name} ${customer.last_name}`}
            </Typography>
          </Box>
        }
      />
      <CardContent sx={{ paddingX: 0 }}>
        <List>
          <ListItem
            sx={{
              color: 'white',
              background: theme.palette.primary.dark
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ background: 'white' }}>
                <CakeIcon sx={{ color: 'black' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box>
                  {customer.birth_date && (
                    <Typography variant="body2">
                      {format(new Date(customer.birth_date), 'dd/MM/yyyy')}
                    </Typography>
                  )}
                  {customer.birthplace && (
                    <Typography variant="body2">
                      {customer.birthplace}
                    </Typography>
                  )}
                  {customer.birth_date && (
                    <Typography variant="body2">
                      {`Età: ${Str.age(new Date(customer.birth_date))} anni`}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
          <ListItem
            sx={{
              color: 'white',
              background: theme.palette.primary.main
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ background: 'white' }}>
                <CreditCardIcon sx={{ color: 'black' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box>
                  <Typography variant="body2">
                    {customer.tax_id_code || 'N.a.'}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          <ListItem
            sx={{
              color: 'white',
              background: theme.palette.primary.dark
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ background: 'white' }}>
                <PhoneIphoneIcon sx={{ color: 'black' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box>
                  <Typography variant="body2">
                    {customer.phone || 'N.a.'}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          <ListItem
            sx={{
              color: 'white',
              background: theme.palette.primary.main
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ background: 'white' }}>
                <AlternateEmailIcon sx={{ color: 'black' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box>
                  <Typography variant="body2">
                    {customer.email || 'N.a.'}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          <ListItem
            sx={{
              color: 'white',
              background: theme.palette.primary.dark
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ background: 'white' }}>
                <PlaceIcon sx={{ color: 'black' }} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box>
                  <Typography variant="body2">
                    {`${customer.street || 'N.a.'}, ${customer.number || ''}`}
                  </Typography>
                  <Typography variant="body2">{`${customer.zip || ''}`}</Typography>
                  <Typography variant="body2">{`${customer.city || 'N.a.'} (${customer.province || ''})`}</Typography>
                  <Typography variant="body2">
                    {customer.country || 'N.a.'}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default DetailsCard;
