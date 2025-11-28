import * as React from 'react';
import { Box } from '@mui/material';

interface TemplatePreviewProps {
  template: 'classic' | 'modern' | 'minimal';
  size?: 'small' | 'large';
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, size = 'small' }) => {
  const scale = size === 'small' ? 1 : 2;
  const baseHeight = size === 'small' ? 120 : 300;

  const renderClassicPreview = () => (
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        p: size === 'small' ? 1 : 2,
        height: baseHeight,
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '2px solid #1976d2',
          pb: 0.5,
          mb: size === 'small' ? 0.5 : 1,
        }}
      >
        <Box sx={{ width: '40%', height: size === 'small' ? 12 : 24, bgcolor: '#1976d2', borderRadius: 0.5 }} />
        <Box sx={{ width: '35%', height: size === 'small' ? 12 : 24, bgcolor: '#e0e0e0', borderRadius: 0.5 }} />
      </Box>

      {/* Two columns */}
      <Box sx={{ display: 'flex', gap: size === 'small' ? 0.5 : 1, mb: size === 'small' ? 0.5 : 1 }}>
        <Box sx={{ flex: 1, height: size === 'small' ? 16 : 40, bgcolor: '#f5f5f5', borderRadius: 0.5 }} />
        <Box sx={{ flex: 1, height: size === 'small' ? 16 : 40, bgcolor: '#f5f5f5', borderRadius: 0.5 }} />
      </Box>

      {/* Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: size === 'small' ? 0.25 : 0.5 }}>
        <Box sx={{ height: size === 'small' ? 6 : 12, bgcolor: '#1976d2', borderRadius: 0.5 }} />
        <Box sx={{ height: size === 'small' ? 4 : 8, bgcolor: '#f0f0f0', borderRadius: 0.5 }} />
        <Box sx={{ height: size === 'small' ? 4 : 8, bgcolor: '#f0f0f0', borderRadius: 0.5 }} />
        <Box sx={{ height: size === 'small' ? 4 : 8, bgcolor: '#f0f0f0', borderRadius: 0.5 }} />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: size === 'small' ? 8 : 16,
          left: size === 'small' ? 8 : 16,
          right: size === 'small' ? 8 : 16,
          height: size === 'small' ? 6 : 12,
          bgcolor: '#e0e0e0',
          borderRadius: 0.5,
        }}
      />
    </Box>
  );

  const renderModernPreview = () => (
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        p: size === 'small' ? 1 : 2,
        height: baseHeight,
        position: 'relative',
      }}
    >
      {/* Centered header */}
      <Box
        sx={{
          textAlign: 'center',
          borderBottom: '3px solid #3498db',
          pb: 0.5,
          mb: size === 'small' ? 0.5 : 1,
        }}
      >
        <Box
          sx={{
            margin: '0 auto',
            width: '50%',
            height: size === 'small' ? 12 : 24,
            bgcolor: '#3498db',
            borderRadius: 0.5,
            mb: 0.5,
          }}
        />
        <Box sx={{ margin: '0 auto', width: '35%', height: size === 'small' ? 6 : 12, bgcolor: '#e0e0e0', borderRadius: 0.5 }} />
      </Box>

      {/* Cards */}
      <Box sx={{ display: 'flex', gap: size === 'small' ? 0.5 : 1, mb: size === 'small' ? 0.5 : 1 }}>
        <Box sx={{ flex: 1, height: size === 'small' ? 16 : 40, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #ecf0f1' }} />
        <Box sx={{ flex: 1, height: size === 'small' ? 16 : 40, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #ecf0f1' }} />
      </Box>

      {/* Modern table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: size === 'small' ? 0.25 : 0.5 }}>
        <Box sx={{ height: size === 'small' ? 6 : 12, bgcolor: '#3498db', borderRadius: '4px 4px 0 0' }} />
        <Box sx={{ height: size === 'small' ? 4 : 8, bgcolor: '#f8f9fa', borderRadius: 0.5 }} />
        <Box sx={{ height: size === 'small' ? 4 : 8, bgcolor: '#f8f9fa', borderRadius: 0.5 }} />
      </Box>

      {/* Blue totals box */}
      <Box
        sx={{
          position: 'absolute',
          bottom: size === 'small' ? 8 : 16,
          right: size === 'small' ? 8 : 16,
          width: '45%',
          height: size === 'small' ? 16 : 40,
          bgcolor: '#3498db',
          borderRadius: 1,
        }}
      />
    </Box>
  );

  const renderMinimalPreview = () => (
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        p: size === 'small' ? 1 : 2,
        height: baseHeight,
        position: 'relative',
      }}
    >
      {/* Minimal header */}
      <Box
        sx={{
          borderBottom: '1px solid #000',
          pb: 0.5,
          mb: size === 'small' ? 0.5 : 1,
        }}
      >
        <Box sx={{ width: '50%', height: size === 'small' ? 8 : 16, bgcolor: '#000', borderRadius: 0 }} />
      </Box>

      {/* Info blocks */}
      <Box sx={{ display: 'flex', gap: size === 'small' ? 0.5 : 1, mb: size === 'small' ? 0.5 : 1 }}>
        <Box sx={{ flex: 1, height: size === 'small' ? 16 : 40, border: '1px solid #ddd', borderRadius: 0 }} />
        <Box sx={{ flex: 1, height: size === 'small' ? 16 : 40, border: '1px solid #ddd', borderRadius: 0 }} />
      </Box>

      {/* Minimal table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: size === 'small' ? 0.25 : 0.5 }}>
        <Box sx={{ height: size === 'small' ? 4 : 8, borderBottom: '2px solid #000' }} />
        <Box sx={{ height: size === 'small' ? 3 : 6, borderBottom: '1px solid #ddd' }} />
        <Box sx={{ height: size === 'small' ? 3 : 6, borderBottom: '1px solid #ddd' }} />
        <Box sx={{ height: size === 'small' ? 3 : 6, borderBottom: '1px solid #ddd' }} />
      </Box>

      {/* Footer line */}
      <Box
        sx={{
          position: 'absolute',
          bottom: size === 'small' ? 8 : 16,
          left: size === 'small' ? 8 : 16,
          right: size === 'small' ? 8 : 16,
          height: 1,
          bgcolor: '#000',
        }}
      />
    </Box>
  );

  switch (template) {
    case 'classic':
      return renderClassicPreview();
    case 'modern':
      return renderModernPreview();
    case 'minimal':
      return renderMinimalPreview();
    default:
      return renderClassicPreview();
  }
};
