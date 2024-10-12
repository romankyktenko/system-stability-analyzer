import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Довідка</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          <strong>Основні терміни теорії управління:</strong>
          <ul>
            <li>
              <strong>Передавальна функція:</strong> Математичний опис системи управління, який представляє залежність виходу системи від входу у формі відношення поліномів.
            </li>
            <li>
              <strong>Стійкість:</strong> Властивість системи, за якої її вихід залишається обмеженим при обмежених вхідних сигналах.
            </li>
            <li>
              <strong>Перехідна характеристика:</strong> Відгук системи на одиничний стрибок вхідного сигналу. Дозволяє оцінити динамічні властивості системи, такі як час перехідного процесу та перерегулювання.
            </li>
            <li>
              <strong>Імпульсна характеристика:</strong> Відгук системи на дельта-імпульс вхідного сигналу. Відображає внутрішні властивості системи та використовується для аналізу стійкості та динаміки.
            </li>
            <li>
              <strong>Полюси та нулі (PZMap):</strong> Графічне представлення коренів чисельника (нулі) та знаменника (полюси) передавальної функції в комплексній площині. Використовується для аналізу стійкості та динамічних характеристик системи.
            </li>
            <li>
              <strong>Не мінімально фазові системи:</strong> Системи, які мають нулі в правій півплощині комплексної площини. Такі системи можуть мати особливі динамічні властивості, наприклад, нестабільність чи перевищення.
            </li>
          </ul>
        </Typography>
        <Typography gutterBottom>
          <strong>Як використовувати сервіс:</strong>
          <ul>
            <li>
              <strong>Введення даних:</strong> Введіть чисельник і знаменник передавальної функції у відповідні поля. Використовуйте формат, де коефіцієнти розділені комами. Наприклад, для функції:
              <br />
              <code>G(s) = (5s² + 2s + 3) / (s² + 3s + 1)</code>
              <br />
              Введіть чисельник як "5,2,3", а знаменник як "1,3,1".
            </li>
            <li>
              <strong>Вибір аналізів:</strong> Оберіть типи аналізу, які ви бажаєте виконати: перехідна характеристика, імпульсна характеристика, полюси та нулі (PZMap), аналіз не мінімально фазових систем.
            </li>
            <li>
              <strong>Запуск аналізу:</strong> Після введення даних та вибору аналізів натисніть кнопку "Аналізувати". Система обробить введені дані та покаже результати відповідно до обраних методів аналізу.
            </li>
            <li>
              <strong>Експорт результатів:</strong> Ви можете експортувати результати аналізу в PDF-файл або згенерувати код для MATLAB, натиснувши відповідні кнопки.
            </li>
            <li>
              <strong>Довідка:</strong> Для отримання додаткової інформації про терміни та використання сервісу скористайтеся цією довідкою.
            </li>
          </ul>
        </Typography>
      </DialogContent>
      <Button onClick={onClose} style={{ padding: '16px 0' }} color="primary">
        Закрити
      </Button>
    </Dialog>
  );
};

export default HelpModal;
