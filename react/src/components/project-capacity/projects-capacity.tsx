import { useAppSelector } from '../../utils/hooks';
import Pictogram from '../pictogram/pictogram';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import styles from './project-capacity.module.scss';

type TProjectCapacityProps = {
  edit?: boolean;
};

export default function ProjectCapacity({ edit }: TProjectCapacityProps) {
  const project = useAppSelector((store) => store.state.project.value);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);

  if (!project || !projectForEdit) return null;
  
  if (edit) {
    return (
      <section className={`${styles.wrapperEdit}`}>
        <div>
          Метрики проекта
        </div>
        <div>
          {projectForEdit.properties.map((el: any, index:number) => (
            <div key={index}>
              <input
                value={el.title}
              />
              <Pictogram type={`${index === projectForEdit.properties.length - 1 ? 'delete' : 'add'}`} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className={`${styles.wrapper}`}>
      <SectionHeader>
        Емкости проекта
      </SectionHeader>
      <div className={`${styles.contentWrapper}`}>
        {project.properties.map((propertie) => (
          <SectionContent key={propertie.id}>
            <div>
              {propertie.title}
            </div>
            {propertie.items.map((item) => <div key={item.id}>{item.value}</div>)}
          </SectionContent>
        ))}
      </div>
    </div>
  );
}
