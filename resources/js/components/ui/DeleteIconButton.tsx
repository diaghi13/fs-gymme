import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import DeleteDialog from '@/components/ui/DeleteDialog';

interface DeleteIconProps {
  url?: string;
  routeName?: string;
  urlParams?: { key: string, value: number | string }[];
  preserveState?: boolean;
  preserveScroll?: boolean;
}

const DeleteIconButton: React.FC<DeleteIconProps> = (
  {
    url,
    routeName,
    urlParams,
    preserveState = true,
    preserveScroll = true
  }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClickOpen = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleConfirm = () => {
    const params = urlParams!.reduce((acc, { value, key }) => {
      acc[key] = value; // Manteniamo il valore originale, sia esso un numero o una stringa
      return acc;
    }, {} as { [key: string]: number | string });

    if (routeName && !url) {
      url = route(routeName, params);
    }

    if (url) {
      router.delete(url,
        {
          preserveState,
          preserveScroll
        }
      );
    }

    handleClose();
  };


  return (
    <React.Fragment>
      <Tooltip title={'Elimina'}>
        <IconButton onClick={handleClickOpen}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <DeleteDialog open={modalOpen} onClose={handleClose} onConfirm={handleConfirm} />
    </React.Fragment>
  );
};

export default DeleteIconButton;
