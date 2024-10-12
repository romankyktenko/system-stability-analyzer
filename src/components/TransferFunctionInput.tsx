// TransferFunctionInput.tsx

import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton, Snackbar, Alert, Tooltip } from '@mui/material';
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
  const [hasPlaceholders, setHasPlaceholders] = useState(false);
  const [numeratorError, setNumeratorError] = useState('');
  const [denominatorError, setDenominatorError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('savedTransferFunctions');
    if (saved) {
      setSavedFunctions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Логіка перевірки на наявність плейсхолдерів при зміні чисельника або знаменника
    const numArray = numerator.split(',').map(coef => coef.trim());
    const denArray = denominator.split(',').map(coef => coef.trim());

    const hasInvalidCoeffs = [...numArray, ...denArray].some(coef => isNaN(Number(coef)) || coef === '');
    setHasPlaceholders(hasInvalidCoeffs);
  }, [numerator, denominator]);

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
    let hasError = false;
    setNumeratorError('');
    setDenominatorError('');

    if (!numerator) {
      setNumeratorError('Чисельник не може бути порожнім');
      hasError = true;
    } else if (!validateCoefficients(numerator)) {
      setNumeratorError('Некоректні коефіцієнти чисельника');
      hasError = true;
    }

    if (!denominator) {
      setDenominatorError('Знаменник не може бути порожнім');
      hasError = true;
    } else if (!validateCoefficients(denominator)) {
      setDenominatorError('Некоректні коефіцієнти знаменника');
      hasError = true;
    }

    if (hasError) {
      setError(true);
    } else {
      setError(false);
      setSelectedFunction('');
      onSubmit(numerator, denominator);
    }
  };

  const validateCoefficients = (input: string): boolean => {
    const coeffs = input.split(',').map((coef) => coef.trim());
    return coeffs.every((coef) => !isNaN(Number(coef)) && coef !== '');
  };

  const renderTransferFunction = (): string => {
    if (numerator && denominator) {
      const formatCoeffs = (coeffs: string[]) => {
        return coeffs
          .map((coef, idx) => {
            if (isNaN(Number(coef)) || coef === '') {
              return '...';
            }
            const sign = idx === 0 ? (Number(coef) < 0 ? '-' : '') : (Number(coef) >= 0 ? ' + ' : ' - ');
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

      const numString = formatCoeffs(numArray);
      const denString = formatCoeffs(denArray);

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
      <Typography variant="h5" gutterBottom>
        Введіть передавальну функцію для аналізу стійкості системи:
      </Typography>

      <Typography variant="body1" color="textSecondary" gutterBottom>
        Введіть коефіцієнти чисельника та знаменника у вигляді чисел, розділених комами. Наприклад, для функції:
        <br />
        <BlockMath math="\frac{5s^2 + 2s + 3}{s^2 + 3s + 1}" />
        Введіть чисельник як "5,2,3", а знаменник як "1,3,1".
      </Typography>

      <TextField
        label="Чисельник"
        variant="outlined"
        fullWidth
        margin="normal"
        value={numerator}
        onChange={(e) => setNumerator(e.target.value)}
        error={!!numeratorError}
        helperText={numeratorError}
      />
      <TextField
        label="Знаменник"
        variant="outlined"
        fullWidth
        margin="normal"
        value={denominator}
        onChange={(e) => setDenominator(e.target.value)}
        error={!!denominatorError}
        helperText={denominatorError}
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
        <Tooltip disableHoverListener={!hasPlaceholders} title={"Передавальна функція введена некоректно"}>
          <Box sx={{width: '100%'}}>
            <Button
              sx={{width: '100%'}}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={hasPlaceholders}
            >
              Аналізувати
            </Button>
          </Box>
        </Tooltip>
        <Tooltip title="Зберегти введену передавальну функцію">
          <Button sx={{ width: '100%' }} variant="outlined" onClick={handleSave}>
            Зберегти
          </Button>
        </Tooltip>
        <Tooltip title="Відкрити список збережених передавальних функцій">
          <Button sx={{ width: '100%' }} variant="outlined" color="info" onClick={handleOpenModal}>
            Збережені функції
          </Button>
        </Tooltip>
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
                  sx={{ color: 'primary.main', ml: '1rem' }}
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
