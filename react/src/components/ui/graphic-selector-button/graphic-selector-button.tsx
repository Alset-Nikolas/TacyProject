import { Tooltip } from '@mui/material';
import styles from './graphic-selector-button.module.scss';

type TGraphicSelectorButtonProps = {
  title: string;
  active?: boolean;
  onClick?: () => void
};

export default function GraphicSelectorButton({ title, active, onClick }: TGraphicSelectorButtonProps) {
  return (
    <Tooltip
      title={title}
    >
      <div
        className={`${styles.propertieGraphic} ${active ? styles.active : ''}`}
        style={{cursor: 'pointer'}}
        onClick={onClick}
      >
        {title}
      </div>
    </Tooltip>
    
  );
}
