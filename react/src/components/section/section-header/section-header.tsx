import textStyles from '../../../styles/text.module.scss';
import sectionsStyles from '../../../styles/sections.module.scss';
import styles from './section-header.module.scss';
// import Pictogram from '../../pictogram/pictogram';

type TSectionHeaderProps = {
  className?: string;
  children: any;
  edit?: boolean;
};

export default function SectionHeader({ edit, children, className }: TSectionHeaderProps) {
  return (
    <div className={`${textStyles.sectionHeaderText} ${sectionsStyles.header} ${edit ? sectionsStyles.edit : ''} ${styles.header} ${className}`}>
      {children}
      {/* <Pictogram type='edit' /> */}
    </div>
  );
}
