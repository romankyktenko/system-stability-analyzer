import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Typography, Box, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { Chart as ChartJS, ChartOptions, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Complex } from 'mathjs';
import DownloadIcon from '@mui/icons-material/Download';

ChartJS.register(...registerables, zoomPlugin);

interface NyquistDataPoint {
  real: number;
  imag: number;
}

interface BodeData {
  frequencies: number[];
  magnitude: number[];
  phase: number[];
}

interface StabilityAnalysisProps {
  stability: string;
  explanation: JSX.Element;
  nyquist: NyquistDataPoint[];
  bode: BodeData;
  roots: Complex[];
}

const StabilityAnalysis: React.FC<StabilityAnalysisProps> = ({
  stability,
  explanation,
  nyquist,
  bode,
  roots,
}) => {
  const [zoomEnabled, setZoomEnabled] = useState(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setZoomEnabled(true);
    }
  };

  const handleKeyUp = () => {
    setZoomEnabled(false);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const nyquistData = {
    labels: nyquist.map((_, index) => index.toString()),
    datasets: [
      {
        label: 'Найквіст',
        data: nyquist.map((point) => ({ x: point.real, y: point.imag })),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        showLine: true,
      },
    ],
  };

  const bodeMagnitudeData = {
    labels: bode.frequencies.map((freq) => freq.toFixed(2)),
    datasets: [
      {
        label: 'Магнітуда (дБ)',
        data: bode.magnitude,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        showLine: true,
      },
    ],
  };

  const bodePhaseData = {
    labels: bode.frequencies.map((freq) => freq.toFixed(2)),
    datasets: [
      {
        label: 'Фаза (градуси)',
        data: bode.phase,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
        showLine: true,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        pan: {
          enabled: zoomEnabled,
          mode: 'xy' as const,
        },
        zoom: {
          wheel: {
            enabled: zoomEnabled,
          },
          pinch: {
            enabled: zoomEnabled,
          },
          mode: 'xy' as const,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutBounce',
    },
  };

  const downloadChart = (chartId: string) => {
    const chartElement = document.getElementById(chartId) as HTMLCanvasElement;
    if (chartElement) {
      const link = document.createElement('a');
      link.href = chartElement.toDataURL('image/png');
      link.download = `${chartId}.png`;
      link.click();
    }
  };

  return (
    <Box mt={4} id="analysis-results">
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Система {stability.toLowerCase()}
      </Typography>

      <Typography variant="body1" paragraph style={{ marginTop: '1rem' }}>
        {explanation}
      </Typography>

      <div className="chart-container">
        <Box display="flex" justifyContent="space-between" mt={4} alignItems="center">
          <Typography variant="h6">Графік Найквіста</Typography>
          <MuiTooltip title="Завантажити графік" placement="top">
            <IconButton onClick={() => downloadChart('nyquist-chart')} color="primary">
              <DownloadIcon />
            </IconButton>
          </MuiTooltip>
        </Box>
        <MuiTooltip
          title="Для зуму/панорамування використовуйте Ctrl (або Cmd) + Прокрутка/Перетягування"
          placement="top"
        >
          <Box height="400px">
            <Line id="nyquist-chart" data={nyquistData} options={chartOptions} />
          </Box>
        </MuiTooltip>
      </div>

      <div className="chart-container">
        <Box display="flex" justifyContent="space-between" mt={4} alignItems="center">
          <Typography variant="h6">Графік Боде (Магнітуда)</Typography>
          <MuiTooltip title="Завантажити графік" placement="top">
            <IconButton onClick={() => downloadChart('bode-magnitude-chart')} color="primary">
              <DownloadIcon />
            </IconButton>
          </MuiTooltip>
        </Box>
        <MuiTooltip
          title="Для зуму/панорамування використовуйте Ctrl (або Cmd) + Прокрутка/Перетягування"
          placement="top"
        >
          <Box height="400px">
            <Line id="bode-magnitude-chart" data={bodeMagnitudeData} options={chartOptions} />
          </Box>
        </MuiTooltip>
      </div>

      <div className="chart-container">
        <Box display="flex" justifyContent="space-between" mt={4} alignItems="center">
          <Typography variant="h6">Графік Боде (Фаза)</Typography>
          <MuiTooltip title="Завантажити графік" placement="top">
            <IconButton onClick={() => downloadChart('bode-phase-chart')} color="primary">
              <DownloadIcon />
            </IconButton>
          </MuiTooltip>
        </Box>
        <MuiTooltip
          title="Для зуму/панорамування використовуйте Ctrl (або Cmd) + Прокрутка/Перетягування"
          placement="top"
        >
          <Box height="400px">
            <Line id="bode-phase-chart" data={bodePhaseData} options={chartOptions} />
          </Box>
        </MuiTooltip>
      </div>

      {roots.length ? (
        <>
          <Typography variant="h6" mt={4}>
            Корені характеристичного рівняння:
          </Typography>
          <Box mt={2}>
            {roots.map((root, index) => (
              <Typography key={index}>
                Корінь {index + 1}: {root.re?.toFixed(2)} + {root.im?.toFixed(2)}i
              </Typography>
            ))}
          </Box>
        </>
      ) : null}
    </Box>
  );
};

export default StabilityAnalysis;
