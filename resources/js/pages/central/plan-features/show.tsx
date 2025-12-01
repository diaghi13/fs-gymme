import * as React from 'react';
import { PageProps } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { router } from '@inertiajs/react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface PlanFeature {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  feature_type: 'boolean' | 'quota' | 'metered';
  is_active: boolean;
  is_addon_purchasable: boolean;
  default_addon_price_cents: number | null;
  default_addon_quota: number | null;
  sort_order: number | null;
}

interface PlanWithFeature {
  id: number;
  name: string;
  tier: string | null;
  is_included: boolean;
  quota_limit: number | null;
  price_cents: number | null;
}

interface ShowProps extends PageProps {
  feature: PlanFeature;
  plans: PlanWithFeature[];
}

const Show: React.FC<ShowProps> = ({ auth, feature, plans }) => {
  const typeLabels: Record<string, string> = {
    boolean: 'Sì/No',
    quota: 'Con Quota',
    metered: 'A Consumo'
  };

  const tierLabels: Record<string, string> = {
    base: 'Base',
    gold: 'Gold',
    platinum: 'Platinum'
  };

  const columns: GridColDef<PlanWithFeature>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'name',
      headerName: 'Piano',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'tier',
      headerName: 'Livello',
      width: 100,
      valueGetter: (value, row) => row.tier ? tierLabels[row.tier] : '-'
    },
    {
      field: 'is_included',
      headerName: 'Incluso',
      width: 100,
      renderCell: (params) => params.value ? (
        <CheckCircleIcon color="success" />
      ) : (
        <CancelIcon color="disabled" />
      )
    },
    {
      field: 'quota_limit',
      headerName: 'Limite Quota',
      type: 'number',
      width: 120,
      valueGetter: (value, row) => row.quota_limit || '-'
    },
    {
      field: 'price_cents',
      headerName: 'Prezzo Addon',
      width: 130,
      valueFormatter: (value, row) => {
        if (!row.price_cents) return '-';
        return `€${(row.price_cents / 100).toFixed(2)}`;
      }
    }
  ];

  return (
    <CentralLayout user={auth.user}>
      <Box m={2}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <MyCard title={feature.display_name}>
              <Grid container spacing={2}>
                {/* Feature Details */}
                <Grid size={12}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Codice:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {feature.name}
                    </Typography>
                  </Stack>
                </Grid>

                {feature.description && (
                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary">
                      Descrizione:
                    </Typography>
                    <Typography variant="body1">
                      {feature.description}
                    </Typography>
                  </Grid>
                )}

                <Grid size={12}>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip
                      label={`Tipo: ${typeLabels[feature.feature_type]}`}
                      color="primary"
                    />
                    <Chip
                      label={feature.is_active ? 'Attivo' : 'Non Attivo'}
                      color={feature.is_active ? 'success' : 'default'}
                    />
                    {feature.is_addon_purchasable && (
                      <Chip
                        label="Acquistabile come Addon"
                        color="secondary"
                      />
                    )}
                  </Stack>
                </Grid>

                {feature.is_addon_purchasable && (
                  <>
                    {feature.default_addon_price_cents && (
                      <Grid size={6}>
                        <Typography variant="body2" color="text.secondary">
                          Prezzo Addon Default:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          €{(feature.default_addon_price_cents / 100).toFixed(2)}
                        </Typography>
                      </Grid>
                    )}
                    {feature.default_addon_quota && (
                      <Grid size={6}>
                        <Typography variant="body2" color="text.secondary">
                          Quota Addon Default:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {feature.default_addon_quota}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}

                <Grid size={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button onClick={() => router.get(route("central.plan-features.index"))}>
                      Indietro
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => router.get(route("central.plan-features.edit", feature.id))}
                    >
                      Modifica
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </MyCard>
          </Grid>

          {/* Associated Plans */}
          <Grid size={12}>
            <MyCard title="Piani Associati">
              <DataGrid
                rows={plans}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10
                    }
                  }
                }}
                density="standard"
                pageSizeOptions={[10, 20, 30]}
                disableRowSelectionOnClick
              />
            </MyCard>
          </Grid>
        </Grid>
      </Box>
    </CentralLayout>
  );
};

export default Show;
