import React from 'react';
import { Typography } from '@mui/material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={{ textAlign: 'center', marginTop: 'auto', padding: '1rem', backgroundColor: '#f1f1f1' }}>
      <Typography variant="body2" color="textSecondary">
        ©{currentYear} Roman Kyktenko
      </Typography>
    </footer>
  );
};

export default Footer;
