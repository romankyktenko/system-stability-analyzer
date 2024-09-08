import React, { useState } from 'react';
import Header from './components/Header';
import HelpModal from './components/HelpModal';
import TransferFunctionInput from './components/TransferFunctionInput';
import StabilityAnalysis from './components/StabilityAnalysis';
import Footer from './components/Footer';
import { Container, Typography, CircularProgress, Box, Snackbar, Alert, Button, FormControlLabel, Checkbox } from '@mui/material';
import useStabilityAnalysis from './hooks/useStabilityAnalysis';
import usePdfExport from './hooks/usePdfExport';
import { useExportToMatlab } from './hooks/useExportToMatlab';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [numArray, setNumArray] = useState<number[]>([]);
  const [denArray, setDenArray] = useState<number[]>([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState({
    bode: true,
    nyquist: true,
    step: false,
    impulse: false,
  });

  const { fullAnalysis } = useStabilityAnalysis();
  const { exportToPDF } = usePdfExport();
  const { exportToMatlab } = useExportToMatlab();

  const handleAnalyze = (numerator: string, denominator: string) => {
    setLoading(true);
    setError(null);
    try {
      const numCoeffs = numerator.split(',').map(Number);
      const denCoeffs = denominator.split(',').map(Number);

      setNumArray(numCoeffs);
      setDenArray(denCoeffs);

      const analysisResult = fullAnalysis(numCoeffs, denCoeffs);

      setResults(analysisResult);
    } catch (error) {
      console.error('Error analyzing stability:', error);
      setError('Сталася помилка під час аналізу стабільності. Перевірте введені дані.');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpOpen = () => {
    setHelpOpen(true);
  };

  const handleHelpClose = () => {
    setHelpOpen(false);
  };

  const handleSnackbarClose = () => {
    setError(null);
  };

  const handleAnalysisChange = (analysis: keyof typeof selectedAnalyses) => {
    setSelectedAnalyses((prev) => ({ ...prev, [analysis]: !prev[analysis] }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onHelpClick={handleHelpOpen} />
      <HelpModal open={helpOpen} onClose={handleHelpClose} />
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <Typography variant="h5" gutterBottom>
          Введіть передавальну функцію для аналізу стабільності системи:
        </Typography>

        <TransferFunctionInput onSubmit={handleAnalyze} />

        {loading && <CircularProgress />}

        {results && (
          <>
            <StabilityAnalysis
              stability={results.stability}
              explanation={results.explanation}
              nyquist={results.nyquist}
              bode={results.bode}
              roots={results.roots}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mt: 2,
                mb: 4,
              }}
            >
              <Box>
                <Typography variant="h6">Оберіть типи аналізу для експорту в MATLAB:</Typography>
                <FormControlLabel
                  control={<Checkbox checked={selectedAnalyses.bode} onChange={() => handleAnalysisChange('bode')} />}
                  label="Bode Plot"
                />
                <FormControlLabel
                  control={<Checkbox checked={selectedAnalyses.nyquist} onChange={() => handleAnalysisChange('nyquist')} />}
                  label="Nyquist Plot"
                />
                <FormControlLabel
                  control={<Checkbox checked={selectedAnalyses.step} onChange={() => handleAnalysisChange('step')} />}
                  label="Step Response"
                />
                <FormControlLabel
                  control={<Checkbox checked={selectedAnalyses.impulse} onChange={() => handleAnalysisChange('impulse')} />}
                  label="Impulse Response"
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: {
                    xs: 'column',
                    sm: 'row',
                  },
                  alignItems: 'center',
                  gap: 2,
                  mt: 2,
                  mb: 4,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => exportToMatlab(numArray, denArray, selectedAnalyses)}
                  sx={{ width: {
                      xs: '100%',
                      sm: 'auto',
                    }
                  }}
                >
                  Експортувати в MATLAB
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => exportToPDF('analysis-results', results.explanationText, 'formula-element')}
                  sx={{ width: {
                      xs: '100%',
                      sm: 'auto',
                    }
                  }}
                >
                  Експортувати в PDF
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Container>
      <Footer />
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;
