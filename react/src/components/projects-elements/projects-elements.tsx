import { TRight, TRole } from '../../types';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';

// Styles
import styles from './projects-elements.module.scss';

type TProjectsElementsProps = {
  // units: Array<any>;
  roles: Array<TRole>;
  rights: Array<TRight>;
  // properties: Array<any>;
  edit?: boolean;
};

export default function ProjectsElements({ roles, rights, edit }: TProjectsElementsProps) {

  if (edit) {
    return (
      <div className={`${styles.wrapper} ${styles.edit}`}>
      <SectionHeader
        edit
      >
        Элементы проекта
      </SectionHeader>
      <div className={`${styles.contentWrapper} ${styles.edit}`}>
        {/* <SectionContent>
          {units.map((el) => el)}
        </SectionContent> */}
        <SectionContent
          edit
        >
          {roles.map((el) => (
            <div key={el.id}>
              {el.name}
            </div>
          ))}
        </SectionContent>
        <SectionContent
          edit
        >
          {rights.map((el) => (
            <div key={el.id}>
              {el.name}
            </div>
          ))}
        </SectionContent>
      </div>
    </div>
    );
  }
  return (
    <div className={`${styles.wrapper}`}>
      <SectionHeader>
        Элементы проекта
      </SectionHeader>
      <div className={`${styles.contentWrapper}`}>
        {/* <SectionContent>
          {units.map((el) => el)}
        </SectionContent> */}
        <SectionContent>
          <div className={`${styles.sectionName}`}>
            Права
          </div>
          <div className={`${styles.valuesContainer}`}>
            {rights?.map((el, index) => (
              <div key={index}>
                {el.name}
              </div>
            ))}
          </div>
        </SectionContent>
        <SectionContent>
          <div className={`${styles.sectionName}`}>
            Роли
          </div>
          <div className={`${styles.valuesContainer}`}>
            {roles?.map((el, index) => (
              <div key={index}>
                {el.name}
              </div>
            ))}
          </div>
        </SectionContent>
      </div>
    </div>
  );
}
