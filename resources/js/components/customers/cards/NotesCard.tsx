import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  TextField,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import { usePage, router } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { route } from 'ziggy-js';

const NotesCard = () => {
  const { customer, currentTenantId } = usePage<CustomerShowProps>().props;
  const [isEditing, setIsEditing] = React.useState(false);
  const [notes, setNotes] = React.useState(customer.notes || '');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);

    router.put(
      route('app.customers.update', {
        customer: customer.id,
        tenant: currentTenantId,
      }),
      {
        notes,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsEditing(false);
        },
        onFinish: () => {
          setIsSaving(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setNotes(customer.notes || '');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader
        title={<Typography variant="h6">Note</Typography>}
        action={
          <Stack direction="row" spacing={1}>
            {!isEditing ? (
              <IconButton onClick={() => setIsEditing(true)} title="Modifica note">
                <EditIcon />
              </IconButton>
            ) : (
              <>
                <IconButton onClick={handleCancel} disabled={isSaving} title="Annulla">
                  <CloseIcon />
                </IconButton>
                <IconButton
                  onClick={handleSave}
                  disabled={isSaving}
                  color="primary"
                  title="Salva"
                >
                  <SaveIcon />
                </IconButton>
              </>
            )}
          </Stack>
        }
      />
      <CardContent>
        {!isEditing ? (
          <Box sx={{ minHeight: 100 }}>
            {notes ? (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {notes}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                Nessuna nota inserita. Clicca sull'icona modifica per aggiungere note.
              </Typography>
            )}
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Inserisci note sul cliente..."
            disabled={isSaving}
            autoFocus
          />
        )}
      </CardContent>
    </Card>
  );
};

export default NotesCard;
