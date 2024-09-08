import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

interface TransferFunctionInputProps {
  onSubmit: (numerator: string, denominator: string) => void;
}

interface SavedFunction {
  name: string;
  numerator: string;
  denominator: string;
}

const TransferFunctionInput: React.FC<TransferFunctionInputProps> = ({ onSubmit }) => {
  const [numerator, setNumerator] = useState('');
  const [denominator, setDenominator] = useState('');
  const [error, setError] = useState(false);
  const [savedFunctions, setSavedFunctions] = useState<SavedFunction[]>([]);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [functionToDelete, setFunctionToDelete] = useState<SavedFunction | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('savedTransferFunctions');
    if (saved) {
      setSavedFunctions(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    const name = renderTransferFunction();
    if (!name) return;

    const duplicate = savedFunctions.some(func => func.name === name);
    if (!duplicate) {
      const newFunction = { name, numerator, denominator };
      const updatedFunctions = [...savedFunctions, newFunction];
      setSavedFunctions(updatedFunctions);
      localStorage.setItem('savedTransferFunctions', JSON.stringify(updatedFunctions));
      setSnackbarOpen(true);  // Показуємо повідомлення про успішне збереження
    }
  };

  const handleLoad = (name: string) => {
    const selected = savedFunctions.find(func => func.name === name);
    if (selected) {
      setNumerator(selected.numerator);
      setDenominator(selected.denominator);
      setSelectedFunction(selected.name);
      onSubmit(selected.numerator, selected.denominator); // Автоматичний запуск аналізу
      setModalOpen(false); // Закрити модальне вікно після вибору функції
    }
  };

  const handleDelete = (name: string) => {
    const func = savedFunctions.find(f => f.name === name);
    if (func) {
      setFunctionToDelete(func);
      setDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = () => {
    if (functionToDelete) {
      const updatedFunctions = savedFunctions.filter(func => func.name !== functionToDelete.name);
      setSavedFunctions(updatedFunctions);
      localStorage.setItem('savedTransferFunctions', JSON.stringify(updatedFunctions));
      if (functionToDelete.name === selectedFunction) {
        setSelectedFunction('');
        setNumerator('');
        setDenominator('');
      }
      setFunctionToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleSubmit = () => {
    if (numerator && denominator) {
      setError(false);
      setSelectedFunction(''); // Скидає вибрану функцію, щоб уникнути дублювання формули
      onSubmit(numerator, denominator);
    } else {
      setError(true);
    }
  };

  const renderTransferFunction = (): string => {
    if (numerator && denominator) {
      const formatCoeffs = (coeffs: string[], isNumerator: boolean) => {
        return coeffs
          .map((coef, idx) => {
            const sign = Number(coef) >= 0 && idx !== 0 ? ' + ' : ' - ';
            const absCoef = Math.abs(Number(coef));
            const power = coeffs.length - 1 - idx;
            if (power === 0) return `${sign}${absCoef}`;
            if (power === 1) return `${sign}${absCoef} s`;
            return `${sign}${absCoef} s^{${power}}`;
          })
          .join('');
      };

      const numArray = numerator.split(',').map(coef => coef.trim());
      const denArray = denominator.split(',').map(coef => coef.trim());

      const numString = formatCoeffs(numArray, true);
      const denString = formatCoeffs(denArray, false);

      return `\\frac{${numString}}{${denString}}`;
    }
    return '';
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setFunctionToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <TextField
        label="Чисельник"
        variant="outlined"
        fullWidth
        margin="normal"
        value={numerator}
        onChange={(e) => setNumerator(e.target.value)}
        error={error && !numerator}
        helperText={error && !numerator ? 'Чисельник не може бути порожнім' : ''}
      />
      <TextField
        label="Знаменник"
        variant="outlined"
        fullWidth
        margin="normal"
        value={denominator}
        onChange={(e) => setDenominator(e.target.value)}
        error={error && !denominator}
        helperText={error && !denominator ? 'Знаменник не може бути порожнім' : ''}
      />
      <Box
         sx={{
           display: 'flex',
           flexDirection: {
             xs: 'column',
             sm: 'row',
           },
           alignItems: 'center',
           gap: 2,
           mt: 2
         }}
      >
        <Button sx={{ width: '100%' }} variant="contained" color="primary" onClick={handleSubmit}>
          Аналізувати
        </Button>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleSave}>
          Зберегти
        </Button>
        <Button sx={{ width: '100%' }} variant="outlined" color="info" onClick={handleOpenModal}>
          Збережені функції
        </Button>
      </Box>

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Збережені функції</DialogTitle>
        <DialogContent dividers>
          {savedFunctions.length > 0 ? (
            savedFunctions.map((func, index) => (
              <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box flexGrow={1}>
                  <BlockMath math={func.name} />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  style={{ marginLeft: '1rem' }}
                  onClick={() => handleLoad(func.name)}
                >
                  Вибрати
                </Button>
                <IconButton
                  size="small"
                  sx={{ color: 'primary.main', ml: '1rem' }} // Синій колір для кнопки видалення
                  onClick={() => handleDelete(func.name)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography>Наразі немає збережених функцій.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Закрити
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <Typography>Ви впевнені, що хочете видалити цю функцію?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary">
            Скасувати
          </Button>
          <Button onClick={confirmDelete} color="secondary" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Функцію успішно збережено!
        </Alert>
      </Snackbar>

      {!error && (
        <Box mt={4} id={'formula-element'}>
          <BlockMath math={renderTransferFunction()} />
        </Box>
      )}
    </Box>
  );
};

export default TransferFunctionInput;
