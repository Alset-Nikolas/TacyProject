import Graphics from '../../components/graphics/graphics';

// Styles
import styles from './graphics-settings-page.module.scss';

export default function GraphicsSettingsPage() {
  return (
    <div className={`${styles.wrapper}`}>
      <Graphics />
    </div>
  );
}
