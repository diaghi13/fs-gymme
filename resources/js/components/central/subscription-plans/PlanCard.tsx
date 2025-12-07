import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Str } from '@/support/Str';
import PricingCard from '@/components/subscription-plans/PricingCard';

interface PlanFeature {
  id: number;
  name: string;
  display_name: string;
  feature_type: string;
  is_included: boolean;
  quota_limit: number | null;
  price: number | null;
}

interface PlanCardProps {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  trial_days: number;
  tier?: string;
  is_active: boolean;
  features?: PlanFeature[];
  highlighted?: boolean;
  onSelect?: () => void;
  selectButtonText?: string;
  showSelectButton?: boolean;
  variant?: 'purchase' | 'marketing';
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  description,
  price,
  currency,
  interval,
  trial_days,
  tier,
  is_active,
  features = [],
  highlighted = false,
  onSelect,
  selectButtonText = 'Scegli questo piano',
  showSelectButton = false,
  variant = 'purchase',
}) => {
  const theme = useTheme();

  const tierColors: Record<string, string> = {
    demo: theme.palette.grey[500],
    base: theme.palette.info.main,
    gold: theme.palette.warning.main,
    platinum: theme.palette.success.main,
  };

  const tierLabels: Record<string, string> = {
    demo: 'Demo',
    base: 'Base',
    gold: 'Gold',
    platinum: 'Platinum',
  };

  // Marketing variant (Tailwind-based, reusable component)
  if (variant === 'marketing') {
    return (
      <PricingCard
        name={name}
        description={description}
        price={price}
        interval={interval}
        trial_days={trial_days}
        features={features}
        highlighted={highlighted}
        ctaText={selectButtonText}
        onCtaClick={showSelectButton ? onSelect : undefined}
        disabled={!is_active}
      />
    );
  }

  // Purchase variant (Material-UI based)
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: highlighted ? `3px solid ${theme.palette.primary.main}` : undefined,
        boxShadow: highlighted ? 6 : 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 8,
          transform: 'translateY(-4px)',
        },
      }}
    >
      {highlighted && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: theme.palette.primary.main,
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          CONSIGLIATO
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: highlighted ? 4 : 2 }}>
        {/* Header */}
        <Stack spacing={1} alignItems="center" mb={2}>
          <Typography variant="h5" component="h2" fontWeight="bold" textAlign="center">
            {name}
          </Typography>

          {tier && (
            <Chip
              label={tierLabels[tier] || tier}
              size="small"
              sx={{
                bgcolor: tierColors[tier] || theme.palette.grey[500],
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          )}

          {!is_active && (
            <Chip label="Non Attivo" size="small" color="error" variant="outlined" />
          )}
        </Stack>

        {/* Description */}
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mb={2}
            sx={{ whiteSpace: 'pre-line' }}
          >
            {description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Pricing */}
        <Stack alignItems="center" spacing={0.5} mb={2}>
          <Box display="flex" alignItems="baseline" gap={0.5}>
            <Typography variant="h3" component="span" fontWeight="bold" color="primary">
              {Str.EURO(price).format()}
            </Typography>
            <Typography variant="h6" component="span" color="text.secondary">
              {currency}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            per {interval === 'month' ? 'mese' : interval === 'year' ? 'anno' : interval}
          </Typography>

          {trial_days > 0 && (
            <Chip
              label={`${trial_days} giorni di prova gratuita`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Features */}
        {features.length > 0 && (
          <Box flexGrow={1}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Caratteristiche:
            </Typography>
            <List dense disablePadding>
              {features.map((feature) => (
                <ListItem key={feature.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {feature.is_included ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <CancelIcon color="disabled" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {feature.display_name}
                        {feature.quota_limit && ` (${feature.quota_limit})`}
                      </Typography>
                    }
                    secondary={
                      !feature.is_included && feature.price ? (
                        <Typography variant="caption" color="text.secondary">
                          Addon: {Str.EURO(feature.price).format()}
                        </Typography>
                      ) : undefined
                    }
                    sx={{
                      textDecoration: !feature.is_included ? 'line-through' : undefined,
                      opacity: !feature.is_included ? 0.6 : 1,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Select Button */}
        {showSelectButton && (
          <Box mt={3}>
            <Button
              variant={highlighted ? 'contained' : 'outlined'}
              fullWidth
              size="large"
              onClick={onSelect}
              disabled={!is_active}
            >
              {selectButtonText}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanCard;
