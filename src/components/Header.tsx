import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HeaderBackground from '../images/header-background.jpg';

interface HeaderProps {
  onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick }) => {
  return (
    <AppBar
      position="static"
      sx={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${HeaderBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.15)',
          animation: 'moveBackground 60s linear infinite',
        }}
      />
      <Toolbar
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }}>
            Stability Analyzer
          </Typography>
          <IconButton color="inherit" onClick={onHelpClick} sx={{ marginLeft: 2 }}>
            <HelpOutlineIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <style>
        {`
          @keyframes moveBackground {
            0% { background-position: 0 0; }
            50% { background-position: 20% 100%; }
            100% { background-position: 0 0; }
          }
        `}
      </style>
    </AppBar>
  );
};

export default Header;
