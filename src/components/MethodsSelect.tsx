import React from 'react';
import {
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    CardHeader,
    Divider,
  } from '@mui/material';

interface MethodsSelectProps {
    selectedAnalyses: Record<string, boolean>;
    handleAnalysisChange: (analysis: string) => void;
}

const MethodsSelect: React.FC<MethodsSelectProps> = ({ selectedAnalyses, handleAnalysisChange }) => {
  return (
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
  );
};

export default MethodsSelect;
