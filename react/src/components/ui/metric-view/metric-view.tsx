import { Tooltip } from '@mui/material';
import styles from './metric-view.module.scss';

type TMetricProps = {
  value: number;
  title: string;
}

export default function MetricView({ value, title }: TMetricProps) {
  return (
    <Tooltip title={title}>
      <div
        className={`${styles.singleMetricWrapper}`}
      >
        <div className={`${styles.value}`}>
          {value}
        </div>
          <span className={`${styles.title}`}>
            {title}
          </span>
      </div>
    </Tooltip>
  );
}