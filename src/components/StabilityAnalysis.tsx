import React, { useState, useEffect } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import {Typography, Box, IconButton, Tooltip as MuiTooltip, Divider} from '@mui/material';
import { Chart as ChartJS, ChartOptions, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Complex } from 'mathjs';
import DownloadIcon from '@mui/icons-material/Download';

ChartJS.register(...registerables, zoomPlugin);

interface StepResponseData {
  time: number[];
  response: number[];
}

interface ImpulseResponseData {
  time: number[];
  response: number[];
}

interface PZMapData {
  poles: Complex[];
  zeros: Complex[];
}

interface StabilityAnalysisProps {
  stability: string;
  explanation: JSX.Element;
  stepResponse: StepResponseData;
  impulseResponse: ImpulseResponseData;
  pzMap: PZMapData;
  isNonMinimumPhase: boolean;
  selectedAnalyses: {
    step: boolean;
    impulse: boolean;
    pzmap: boolean;
    nonMinimumPhase: boolean;
  };
}

const StabilityAnalysis: React.FC<StabilityAnalysisProps> = ({
  stability,
  explanation,
  stepResponse,
  impulseResponse,
  pzMap,
  isNonMinimumPhase,
  selectedAnalyses,
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

  const chartContainerStyle = {
    width: '100%',
    height: '400px',
    '@media (max-width:600px)': {
      height: '300px',
    },
  };

  // Обчислюємо межі для осей
  const allRe = [...pzMap.poles, ...pzMap.zeros].map(point => point.re);
  const allIm = [...pzMap.poles, ...pzMap.zeros].map(point => point.im);

  const xMin = Math.min(...allRe, -1) - 1;
  const xMax = Math.max(...allRe, 1) + 1;
  const yMin = Math.min(...allIm, -1) - 1;
  const yMax = Math.max(...allIm, 1) + 1;

  const stepResponseData = {
    labels: stepResponse.time,
    datasets: [
      {
        label: 'Перехідна характеристика',
        data: stepResponse.response,
        borderColor: 'blue', // Синій колір, як у MATLAB
        borderWidth: 2, // Товстіша лінія
        backgroundColor: 'transparent',
        fill: false,
        showLine: true,
      },
    ],
  };

  // **Оновлені дані для імпульсної характеристики**
  const impulseResponseData = {
    labels: impulseResponse.time,
    datasets: [
      {
        label: 'Імпульсна характеристика',
        data: impulseResponse.response,
        borderColor: 'red', // Червоний колір, як у MATLAB
        borderWidth: 2, // Товстіша лінія
        backgroundColor: 'transparent',
        fill: false,
        showLine: true,
      },
    ],
  };

  const pzMapData = {
    datasets: [
      // Додаємо осі
      {
        label: '',
        data: [{ x: xMin, y: 0 }, { x: xMax, y: 0 }],
        borderColor: 'black',
        borderWidth: 1,
        showLine: true,
        fill: false,
        pointRadius: 0,
      },
      {
        label: '',
        data: [{ x: 0, y: yMin }, { x: 0, y: yMax }],
        borderColor: 'black',
        borderWidth: 1,
        showLine: true,
        fill: false,
        pointRadius: 0,
      },
      // Полюси
      {
        label: 'Полюси',
        data: pzMap.poles.map(pole => ({ x: pole.re, y: pole.im })),
        borderColor: 'red',
        borderWidth: 2,
        pointStyle: 'cross',
        pointRadius: 8,
        backgroundColor: 'transparent',
      },
      // Нулі
      {
        label: 'Нулі',
        data: pzMap.zeros.map(zero => ({ x: zero.re, y: zero.im })),
        backgroundColor: 'blue',
        pointStyle: 'circle',
        pointRadius: 6,
      },
    ],
  };


  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // MATLAB зазвичай не відображає легенду на цих графіках
      },
      zoom: {
        pan: {
          enabled: zoomEnabled,
          mode: 'xy',
        },
        zoom: {
          wheel: {
            enabled: zoomEnabled,
          },
          pinch: {
            enabled: zoomEnabled,
          },
          mode: 'xy',
        },
      },
    },
    animation: {
      duration: 0, // Відключаємо анімацію для схожості з MATLAB
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Час (с)',
        },
        grid: {
          color: '#e0e0e0',
          drawOnChartArea: true,
          drawTicks: true,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Амплітуда',
        },
        grid: {
          color: '#e0e0e0',
          drawOnChartArea: true,
          drawTicks: true,
        },
      },
    },
    elements: {
      line: {
        tension: 0, // Без інтерполяції, пряма лінія між точками
      },
      point: {
        radius: 0, // Прибираємо точки даних
      },
    },
  };

  const scatterChartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
      },
      zoom: {
        pan: {
          enabled: zoomEnabled,
          mode: 'xy',
        },
        zoom: {
          wheel: {
            enabled: zoomEnabled,
          },
          pinch: {
            enabled: zoomEnabled,
          },
          mode: 'xy',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutBounce',
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Дійсна частина',
        },
        grid: {
          color: '#e0e0e0',
        },
        min: xMin,
        max: xMax,
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Уявна частина',
        },
        grid: {
          color: '#e0e0e0',
        },
        min: yMin,
        max: yMax,
      },
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

  const formatComplexNumber = (complex: Complex) => {
    const re = complex.re !== undefined ? complex.re.toFixed(5) : '0';
    let im = '';
    if (complex.im !== undefined && complex.im !== 0) {
      const sign = complex.im >= 0 ? ' + ' : ' - ';
      im = `${sign}${Math.abs(complex.im).toFixed(5)}i`;
    }
    return `s = ${re}${im}`;
  };

  const summary = <>
    Система визначена як <strong>{stability.toLowerCase()}</strong>. Аналіз полюсів і нулів вказує на те, що система є  <strong>{isNonMinimumPhase ? 'не мінімально фазовою' : 'мінімально фазовою'}</strong>.
  </>;

  const conclusion = (
    <Box mt={4}>
      <Typography variant="h6" fontWeight={700}>
        Висновок:
      </Typography>
      <Typography variant="body1" paragraph>
        Система демонструє {stability.toLowerCase()} поведінку на основі аналізу полюсів і нулів. Полюси розташовані {pzMap.poles.length > 0 ? 'в лівій частині комплексної площини' : 'не знайдені'}, що вказує на її {stability.toLowerCase()}. {isNonMinimumPhase ? 'Однак система є не мінімально фазовою, що може впливати на її динамічну поведінку.' : 'Система також є мінімально фазовою, що сприяє покращеній динамічній поведінці.'}
      </Typography>
    </Box>
  );


  return (
    <Box id="analysis-results">
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Аналіз стійкості:
      </Typography>

      <Typography variant="body1" paragraph mt={2}>
        {summary}
      </Typography>

      {selectedAnalyses.pzmap && (
        <>
          <Box mt={4}>
            <Typography variant="h6">Нулі передавальної функції</Typography>
            {pzMap.zeros.length > 0 ? (
              pzMap.zeros.map((zero, index) => (
                <Typography key={index}>{formatComplexNumber(zero)}</Typography>
              ))
            ) : (
              <Typography>Нулі не знайдені</Typography>
            )}

            <Typography variant="h6" mt={2}>
              Полюси передавальної функції
            </Typography>
            {pzMap.poles.length > 0 ? (
              pzMap.poles.map((pole, index) => (
                <Typography key={index}>{formatComplexNumber(pole)}</Typography>
              ))
            ) : (
              <Typography>Полюси не знайдені</Typography>
            )}
          </Box>

          <div className="chart-container">
            <Box display="flex" justifyContent="space-between" mt={4} alignItems="center">
              <Typography variant="h6">Розташування полюсів і нулів на комплексній площині</Typography>
              <MuiTooltip title="Завантажити графік" placement="top">
                <IconButton onClick={() => downloadChart('pzmap-chart')} color="primary">
                  <DownloadIcon />
                </IconButton>
              </MuiTooltip>
            </Box>
            <MuiTooltip
              title="Для зуму/панорамування використовуйте Ctrl (або Cmd) + Прокрутка/Перетягування"
              placement="top"
            >
              <Box sx={chartContainerStyle}>
                <Scatter id="pzmap-chart" data={pzMapData} options={scatterChartOptions} />
              </Box>
            </MuiTooltip>
          </div>
        </>
      )}

      {selectedAnalyses.nonMinimumPhase && (
        <>
          <Typography variant="h6" mt={4}>
            Аналіз не мінімально фазових систем
          </Typography>
          <Typography variant="body1" paragraph mt={2}>
            {isNonMinimumPhase ? 'Система є не мінімально фазовою.' : 'Система є мінімально фазовою.'}
          </Typography>
        </>
      )}

      {(selectedAnalyses.step || selectedAnalyses.impulse) && (
        <>
          <Divider/>
          <Typography variant="h5" mt={4} fontWeight={700}>Динамічна поведінка системи:</Typography>
        </>
      )}

      {selectedAnalyses.step && (
        <div className="chart-container">
          <Box display="flex" justifyContent="space-between" mt={4} mb={4} alignItems="center">
            <Typography variant="h6">Перехідна характеристика</Typography>
            <MuiTooltip title="Завантажити графік" placement="top">
              <IconButton onClick={() => downloadChart('step-response-chart')} color="primary">
                <DownloadIcon />
              </IconButton>
            </MuiTooltip>
          </Box>
          <MuiTooltip
            title="Для зуму/панорамування використовуйте Ctrl (або Cmd) + Прокрутка/Перетягування"
            placement="top"
          >
            <Box sx={chartContainerStyle}>
              <Line id="step-response-chart" data={stepResponseData} options={chartOptions} />
            </Box>
          </MuiTooltip>
        </div>
      )}

      {selectedAnalyses.impulse && (
        <div className="chart-container">
          <Box display="flex" justifyContent="space-between" mt={4} mb={4} alignItems="center">
            <Typography variant="h6">Імпульсна характеристика</Typography>
            <MuiTooltip title="Завантажити графік" placement="top">
              <IconButton onClick={() => downloadChart('impulse-response-chart')} color="primary">
                <DownloadIcon />
              </IconButton>
            </MuiTooltip>
          </Box>
          <MuiTooltip
            title="Для зуму/панорамування використовуйте Ctrl (або Cmd) + Прокрутка/Перетягування"
            placement="top"
          >
            <Box sx={chartContainerStyle} mb={4}>
              <Line id="impulse-response-chart" data={impulseResponseData} options={chartOptions} />
            </Box>
          </MuiTooltip>
        </div>
      )}

      <Divider/>

      <Box mt={4}>
        <Typography variant="h6" fontWeight={700}>
          Висновок:
        </Typography>
        <Typography variant="body1" paragraph mt={2}>
          Система демонструє <strong>{stability === 'Стійка' ? 'стійку' : 'нестійку'}</strong> поведінку на основі аналізу полюсів і нулів.
          Полюси розташовані <strong>
          {pzMap.poles.length === 0
            ? 'не знайдені'
            : pzMap.poles.every(pole => pole.re < 0)
              ? 'в лівій частині комплексної площини'
              : 'в правій частині комплексної площини'}
          </strong>, що вказує на її <strong>{stability === 'Стійка' ? 'стійкість' : 'нестійкість'}</strong>.
          {isNonMinimumPhase
            ? ' Однак система є не мінімально фазовою, що може впливати на її динамічну поведінку.'
            : ' Система також є мінімально фазовою, що сприяє покращеній динамічній поведінці.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default StabilityAnalysis;
