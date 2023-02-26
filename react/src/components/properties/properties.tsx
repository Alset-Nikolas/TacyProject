import { ChangeEvent, ChangeEventHandler } from 'react';
import Pictogram from '../pictogram/pictogram';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { setProjectValidationErrors, updateProjectState } from '../../redux/state/state-slice';
import {
  addPropertie,
  addPropertieValue,
  handlePropertieInutChange,
  removePropertie,
  removePropertieValue,
} from '../../utils';

// Styles
import styles from './properties.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import CustomizedButton from '../button/button';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { TProjectForEdit, TProjectValidationErrors, TPropertyValidationError } from '../../types';

type TPropertiesProps = {
  edit?: boolean;
  onChange?: ChangeEventHandler;
  error?: TProjectValidationErrors;
};

export default function Properties({
  edit,
  error,
}: TPropertiesProps) {
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const dispatch = useAppDispatch();

  const clearMetrics = () => {
    dispatch(updateProjectState({
      metrics: []
    }));
  };

  const handleInputChange = (
    index: number,
    propType: keyof TProjectForEdit,
    key: string, 
    value: string,
    validationError: TPropertyValidationError | undefined,
    propertieIndex?: number,
  ) => {
    if (error && validationError) {
      const errorPropKey = propType as keyof typeof error;
      const tempErrorProp = error[errorPropKey];

      if (typeof tempErrorProp !== 'boolean') {
        const projectPropertyErrors = [ ...tempErrorProp ];
        const currentErrorPropIndex = tempErrorProp.findIndex((item) => item.index === validationError.index);
        if (projectPropertyErrors instanceof Array) {
          const propertyErrors = { ...validationError };
          type Tkey = keyof TPropertyValidationError;
          const curKey = key as Tkey
          let isRemoveError = false;
          let isValuesHasError = false;
          if ('values' in propertyErrors) {
            if (curKey === 'title') {
              propertyErrors[curKey] = false;
            }
            if (curKey === 'values' && currentErrorPropIndex > -1) {
              const values = [ ...propertyErrors[curKey] ];
              const currentValue = { ...values[currentErrorPropIndex] };
              currentValue.value = false;
              values[currentErrorPropIndex] = currentValue;
              propertyErrors[curKey] = values;
            }
            propertyErrors.values.forEach((el) => {
              if (el.value) isValuesHasError = true;
            });
            if (!propertyErrors.title && !isValuesHasError) {
              isRemoveError = true;
            }
          }
          if (isRemoveError) {
            projectPropertyErrors.splice(currentErrorPropIndex, 1);
          } else {
            projectPropertyErrors[currentErrorPropIndex] = propertyErrors;
          }
        }
        dispatch(setProjectValidationErrors({
          ...error,
          [propType]: projectPropertyErrors,
        }));
      }
    }
    handlePropertieInutChange(index, projectForEdit, propType, key, value, dispatch, propertieIndex);
  }

  if (!project) return null;

  if (edit) {
    if (!projectForEdit) return null;
    // if (!isPropertieEdit(projectForEdit.properties)) return null;
    return (
      <section className={`${styles.wrapper} ${styles.edit}`}>
        <SectionHeader
          className={`${sectionStyles.editHeaderWithButton}`}
          edit
        >
          Атрибуты инициатив
          <CustomizedButton
            value="Добавить"
            onClick={() => addPropertie(projectForEdit, 'properties', dispatch)}
          />
        </SectionHeader>
        <div className={`${styles.content}`}>
          {/* <div  className={`${styles.closeButton}`}>
            <Pictogram
              type="delete"
              cursor="pointer"
              onClick={clearMetrics}
            />
          </div> */}
          {projectForEdit.properties.map((el: any, index:number) => {
            const currentError = error?.properties.find((error) => el.id !== -1 ? error.id === el.id : error.index === index);
            
            return (
              <div
                className={`${styles.propertieWrapper} ${styles.edit}`}
                key={`prop_${index}`}
              >
                <div
                  className={`${styles.closeButton}`}
                >
                  <Pictogram
                    type="delete-filled"
                    cursor="pointer"
                    onClick={() => removePropertie(index, projectForEdit, 'properties', dispatch)}
                  />
                </div>
                <label>

                </label>
                <input
                  className={`${inputStyles.textInput} ${styles.input} ${styles.titleInput} ${currentError?.title ? inputStyles.error : ''}`}
                  value={el.title}
                  placeholder="Название"
                  name='title'
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(
                    index,
                    'properties',
                    'title',
                    e.target.value,
                    currentError
                  )}
                />
                {/* {!el.values.length && (
                  <div>
                  <CustomizedButton
                    value="Добавить"
                    onClick={() => addPropertieValue(projectForEdit, index, dispatch)}

                  />
                  </div>
                )} */}
                {el.values.map((itemProp: { id: number, value: string, value_short: string }, itemIndex: number) => (
                  <div
                    key={`prop_${itemProp.id}_${itemIndex}`}
                    className={`${styles.propertieValueWrapper}`}
                  >
                    <div
                      className={`${styles.value}`}
                    >
                    <input
                      className={`${inputStyles.textInput} ${styles.input}  ${currentError?.values[itemIndex].value ? inputStyles.error : ''}`}
                      value={itemProp.value}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(
                        index,
                        'properties',
                        'values',
                        e.target.value,
                        currentError,
                        itemIndex,
                      )}
                    />
                    </div>
                    <div
                      className={`${styles.short}`}
                    >
                    <input
                      className={`${inputStyles.textInput} ${styles.input}`}
                      value={itemProp.value_short}
                      placeholder="Cокращение"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(
                        index,
                        projectForEdit,
                        'properties',
                        'values_short',
                        e.target.value,
                        dispatch,
                        itemIndex,
                      )}
                    />
                    </div>
                    <div
                      className={`${styles.control}`}
                    >
                      {(itemIndex !== 0 || el.values.length > 1) && (
                        <div style={{ marginRight: '15px' }}>
                          <Pictogram
                            type="delete"
                            cursor="pointer"
                            onClick={() => removePropertieValue(projectForEdit, el.title, itemIndex, index, el.values, dispatch)}
                          />
                        </div>
                      )}
                      {(itemIndex === el.values.length - 1) && (

                      <div>
                        <Pictogram
                          type="add"
                          cursor="pointer"
                          onClick={() => addPropertieValue(projectForEdit, index, dispatch)}
                        />
                      </div>
                      )}
                  </div>
                  </div>
                ))}
                
              </div>
            );
          })}
        </div>
      </section>
    );
  }
  return (
    <section className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        Атрибуты инициатив
      </SectionHeader>
      <div className={`${styles.contentWrapper}`}>
        {!project.properties.length && (
          <SectionContent>Атрибуты инициатив отсутствуют</SectionContent>
        )}
        {project.properties.map((propertie) => (
          <div
            className={`${styles.propertieWrapper}`}
            key={propertie.id}
          >
            <div
              className={`${styles.propertieTitle}`}
            >
              <div>
              {propertie.title}
              </div>
            </div>
            {propertie.items.map((item) => (
              <div
                key={item.id}
                className={`${styles.propertyWrapper}`}
              >
                <span>
                  {item.value}
                </span>
                <span
                  style={{
                    color: '#504F4F',
                  }}
                >
                  {item.value_short}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
