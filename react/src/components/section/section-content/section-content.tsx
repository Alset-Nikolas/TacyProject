// Styles
import styles from './section-content.module.scss';

type TSectionContentProps = {
  children: any;
  edit?: boolean;
  className?: string;
};

export default function SectionContent({ edit, children, className }: TSectionContentProps) {
  let containerClass = styles.content;
  if (className) containerClass += ` ${className}`;
  if (edit) containerClass += ` ${styles.edit}`;
  return (
    <div className={`${containerClass}`}>
      {children}
    </div>
  );
}
