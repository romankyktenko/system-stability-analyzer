// App.tsx

import React, { useState } from 'react';
import Header from './components/Header';
import HelpModal from './components/HelpModal';
import TransferFunctionInput from './components/TransferFunctionInput';
import StabilityAnalysis from './components/StabilityAnalysis';
import Footer from './components/Footer';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
  Button,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton, Tooltip, Divider,
} from '@mui/material';
import useStabilityAnalysis from './hooks/useStabilityAnalysis';
import usePdfExport from './hooks/usePdfExport';
import { useExportToMatlab } from './hooks/useExportToMatlab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [numArray, setNumArray] = useState<number[]>([]);
  const [denArray, setDenArray] = useState<number[]>([]);

  // Стан для вибору аналізів для виконання
  const [selectedAnalyses, setSelectedAnalyses] = useState({
    step: true,
    impulse: true,
    pzmap: true,
    nonMinimumPhase: true,
  });

  // Стан для вибору аналізів для експорту в MATLAB
  const [exportAnalyses, setExportAnalyses] = useState({
    step: true,
    impulse: true,
    pzmap: true,
  });

  const { fullAnalysis } = useStabilityAnalysis();
  const { exportToPDF } = usePdfExport();
  const { exportToMatlab } = useExportToMatlab();

  const [expanded, setExpanded] = useState(true); // Результати відкриті за замовчуванням

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
      setError('Сталася помилка під час аналізу стійкості. Перевірте введені дані.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
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

  const handleExportAnalysisChange = (analysis: keyof typeof exportAnalyses) => {
    setExportAnalyses((prev) => ({ ...prev, [analysis]: !prev[analysis] }));
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onHelpClick={handleHelpOpen} />
      <HelpModal open={helpOpen} onClose={handleHelpClose} />
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <TransferFunctionInput onSubmit={handleAnalyze} />

        {/* Секція опцій аналізу */}
        <Card sx={{ mt: 4 }}>
          <CardHeader title="Оберіть типи аналізу для виконання" />
          <Divider/>
          <CardContent>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAnalyses.step}
                  onChange={() => handleAnalysisChange('step')}
                />
              }
              label="Перехідна характеристика"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAnalyses.impulse}
                  onChange={() => handleAnalysisChange('impulse')}
                />
              }
              label="Імпульсна характеристика"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAnalyses.pzmap}
                  onChange={() => handleAnalysisChange('pzmap')}
                />
              }
              label="Полюси та нулі (PZMap)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAnalyses.nonMinimumPhase}
                  onChange={() => handleAnalysisChange('nonMinimumPhase')}
                />
              }
              label="Аналіз не мінімально фазової системи"
            />
          </CardContent>
        </Card>

        {/* Індикатор прогресу */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {results && !loading && (
          <>
            {/* Секція результатів */}
            <Card sx={{ mt: 4 }}>
              <CardHeader
                title="Результати аналізу"
                action={
                  <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="показати більше"
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                      }}
                    />
                  </IconButton>
                }
              />
              <Divider/>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                  <StabilityAnalysis
                    stability={results.stability}
                    explanation={results.explanation}
                    stepResponse={results.stepResponse}
                    impulseResponse={results.impulseResponse}
                    pzMap={results.pzMap}
                    isNonMinimumPhase={results.isNonMinimumPhase}
                    selectedAnalyses={selectedAnalyses}
                  />
                </CardContent>
              </Collapse>
            </Card>

            {results && (
              <>
                {/* Секція експорту в MATLAB */}
                <Card sx={{ mt: 4 }}>
                  <CardHeader title="Експорт в MATLAB" />
                  <Divider/>
                  <CardContent>
                    <Typography variant="body1" mb={2}>
                      Ви можете згенерувати файл з розширенням .m для аналізу передавальної функції в MATLAB
                    </Typography>
                    <Typography variant="h6">Оберіть типи аналізу для експорту:</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={exportAnalyses.step}
                          onChange={() => handleExportAnalysisChange('step')}
                        />
                      }
                      label="Перехідна характеристика"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={exportAnalyses.impulse}
                          onChange={() => handleExportAnalysisChange('impulse')}
                        />
                      }
                      label="Імпульсна характеристика"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={exportAnalyses.pzmap}
                          onChange={() => handleExportAnalysisChange('pzmap')}
                        />
                      }
                      label="Полюси та нулі (PZMap)"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => exportToMatlab(numArray, denArray, exportAnalyses)}
                      >
                        Експортувати в MATLAB
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* Секція експорту в PDF */}
                <Card sx={{ mt: 4, mb: 4 }}>
                  <CardHeader title="Експорт в PDF" />
                  <Divider/>
                  <CardContent>
                    <Typography variant="body1">
                      Ви можете експортувати результати аналізу в PDF-документ.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          exportToPDF(
                            'analysis-results',
                            results.explanationText,
                            'formula-element',
                            results,
                            selectedAnalyses
                          )
                        }
                      >
                        Експортувати в PDF
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
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
