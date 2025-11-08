import React, { useState } from 'react';
import { IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box } from '@mui/material';
import { router } from '@inertiajs/react';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UndoIcon from '@mui/icons-material/Undo';

interface PriceListCardActionsProps {
  priceListId?: number | null;
  priceListType: string;
  tenantId: string;
  onUndo?: () => void;
}

export default function PriceListCardActions({ priceListId, priceListType, tenantId, onUndo }: PriceListCardActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
    }
  };

  const handleDelete = () => {
    if (!priceListId) return;

    const routeMap: Record<string, string> = {
      article: 'app.price-lists.articles.destroy',
      membership: 'app.price-lists.memberships.destroy',
      subscription: 'app.price-lists.subscriptions.destroy',
      day_pass: 'app.price-lists.day-passes.destroy',
      token: 'app.price-lists.tokens.destroy',
      gift_card: 'app.price-lists.gift-cards.destroy',
      folder: 'app.price-lists.folders.destroy',
    };

    const routeName = routeMap[priceListType];
    if (!routeName) return;

    const paramMap: Record<string, string> = {
      article: 'article',
      membership: 'membership',
      subscription: 'subscription',
      day_pass: 'day_pass',
      token: 'token',
      gift_card: 'gift_card',
      folder: 'folder',
    };

    router.delete(route(routeName, { [paramMap[priceListType]]: priceListId, tenant: tenantId }), {
      preserveState: false,
      onSuccess: () => {
        router.get(route('app.price-lists.index', { tenant: tenantId }));
      },
    });
  };

  const handleDuplicate = () => {
    if (!priceListId) return;

    const routeMap: Record<string, string> = {
      article: 'app.price-lists.articles.duplicate',
      membership: 'app.price-lists.memberships.duplicate',
      subscription: 'app.price-lists.subscriptions.duplicate',
      day_pass: 'app.price-lists.day-passes.duplicate',
      token: 'app.price-lists.tokens.duplicate',
      gift_card: 'app.price-lists.gift-cards.duplicate',
      folder: 'app.price-lists.folders.duplicate',
    };

    const routeName = routeMap[priceListType];
    if (!routeName) return;

    const paramMap: Record<string, string> = {
      article: 'article',
      membership: 'membership',
      subscription: 'subscription',
      day_pass: 'day_pass',
      token: 'token',
      gift_card: 'gift_card',
      folder: 'folder',
    };

    router.post(route(routeName, { [paramMap[priceListType]]: priceListId, tenant: tenantId }), {}, {
      preserveState: false,
    });
  };

  // Solo mostra i bottoni se esiste un priceListId (edit mode)
  const showActionButtons = !!priceListId;

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {showActionButtons && onUndo && (
        <Tooltip title="Annulla ultima modifica">
          <IconButton size="small" onClick={handleUndo}>
            <UndoIcon />
          </IconButton>
        </Tooltip>
      )}

      {showActionButtons && (
        <>
          <Tooltip title="Duplica">
            <IconButton size="small" onClick={() => setDuplicateDialogOpen(true)}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Elimina">
            <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(true)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare questo elemento? L'operazione utilizza il soft delete e può essere annullata ripristinando l'elemento dal cestino.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Confirmation Dialog */}
      <Dialog
        open={duplicateDialogOpen}
        onClose={() => setDuplicateDialogOpen(false)}
      >
        <DialogTitle>Conferma duplicazione</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vuoi creare una copia di questo elemento? Verrà creato un nuovo elemento con gli stessi dati e il nome "Copia di [nome originale]".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleDuplicate} color="primary" variant="contained" autoFocus>
            Duplica
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
