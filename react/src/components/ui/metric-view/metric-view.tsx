import { Tooltip } from '@mui/material';
import styles from './metric-view.module.scss';

type TMetricProps = {
  value: number;
  title: string;
  units: string;
  is_percent?: boolean;
  description: string;
}

export default function MetricView({ value, title, units, is_percent, description }: TMetricProps) {
  return (
    <Tooltip title={`${title}, ${(!is_percent && units !== 'бм') ? units : ''}${is_percent ? '%' : ''}, Описание: ${description}`}>
      <div
        className={`${styles.singleMetricWrapper}`}
      >
        <div className={`${styles.value}`}>
          {value}
        </div>
          <span className={`${styles.title}`}>
            {title},
            <br />
            {(!is_percent && units !== 'бм') ? units : ''}
            {is_percent && '%'}
          </span>
      </div>
    </Tooltip>
  );
}