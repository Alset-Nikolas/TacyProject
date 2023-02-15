import { TMetrica } from '../../types';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import CustomizedSelect from '../select/Select';

// Styles
import styles from './target-effect.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import sectionStyles from '../../styles/sections.module.scss';

import { handlePropertieInutChange } from '../../utils';
import { ChangeEvent } from 'react';
import MetricView from '../ui/metric-view/metric-view';
import { Tooltip } from '@mui/material';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';

type TTargetEffectProps = {
  edit?: boolean;
};

export default function TargetEffect({ edit }: TTargetEffectProps) {
  const { textInput } = inputStyles;
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);

  const title = 'Целевой эффект'

  if (!project) return null;

  const { metrics } = project;
  let isActive = false;

  metrics.forEach((metric) => {
    if (metric.active) isActive = true;
  });

  if (edit) {
    // const selectItemsValues = metrics.map((el) => el.value);
    if (!projectForEdit) return null;

    return (
      <div className={`${styles.wrapper} ${styles.edit}`}>
        <SectionHeader
          edit
        >
          {title}
        </SectionHeader>
        <div className={`${styles.content} ${styles.edit}`}>
          {/* <div>
            Метрики проета
          </div> */}
          {projectForEdit.metrics.map((el:any, index: number) => (
            <div key={`${index}_${el.title}`}>
              {/* <CustomizedSelect
                items={selectItemsNames}
              /> */}
              <input
                className={`${textInput}`}
                value={el.target_value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(index, projectForEdit, 'metrics', 'target_value', e.target.value, dispatch)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        {title}
      </SectionHeader>
      <SectionContent
        className={`${styles.section}`}
      >
        <div className={`${styles.metricsWrapper}`}>
          {(!metrics.length || !isActive) && (
            <div>
              Метрики отсутствуют
            </div>
          )}
          {metrics?.map((el) => {
            if (!el.active) return null;
            return (
              <MetricView
                key={el.id}
                title={el.title}
                value={el.target_value}
                units={el.units}
                is_percent={el.is_percent}
                description={el.description}
              />
            );
          })}
        </div>
      </SectionContent>
    </div>
  );
}
