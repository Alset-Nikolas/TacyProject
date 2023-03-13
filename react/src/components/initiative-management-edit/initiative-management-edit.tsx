import { useAppDispatch } from "../../utils/hooks";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
// Styles
import styles from './initiative-management-edit.module.scss';
import CustomizedButton from "../button/button";
import {
  TInitiative,
  TAdditionalField,
  TSettings,
  TStatusField,
} from "../../types";
import { AppDispatch } from "../../redux/store";

type TInitiativeManagementEditProps = {
  currentInitiative: TInitiative;
  initiativeAddfields: Array<TAdditionalField>;
  addComponentItem: any;
  removeComponentItem: (
    index: number,
    itemsArray: Array<TAdditionalField | {
      id: number;
      value: number;
      name: string;
      settings_project: number;
    }>,
    key: keyof TSettings,
    dispatch: AppDispatch,
  ) => void;
  handleComponentInputChange: (
    index: number,
    value: string,
    itemsArray: Array<TAdditionalField | TStatusField>,
    key: keyof TSettings,
    dispatch: AppDispatch,
  ) => void;
}

export default function InitiativeManagementEdit({
  currentInitiative,
  initiativeAddfields,
  addComponentItem,
  removeComponentItem,
  handleComponentInputChange,
}: TInitiativeManagementEditProps) {
  const dispatch = useAppDispatch();
  
  return (
    <section className={`${styles.wrapper} ${styles.edit}`}>
      <SectionHeader
        className={`${styles.header}`}
        edit
      >
        Управление инициативой
      </SectionHeader>
      <div className={`${styles.content}`}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={`${styles.addfieldsHeader}`}>
            Постоянные поля
          </div>
          <SectionContent
            edit
          >
            <div>
              <div className={`${styles.initiativeName}`}>
                {currentInitiative.initiative.name}
                {/* Название инициативы */}
              </div>
              {/* <div className={`${styles.initiativeNumber}`}>
                Номер инициативы
              </div> */}
            </div>
            <ol className={`${styles.paramsList}`}>
              <li>
                Автор
              </li>
              <li>
                Дата реистрации
              </li>
              {/* <li>
                Текущее состояние
              </li> */}
              {/* <li>
                Предпосылки инициативы
              </li> */}
              {/* <li>
                Описание инициативы
              </li> */}
              <li>
                Дата начала
              </li>
              <li>
                Дата окончания
              </li>
              {/* <li>
                Длителность инициативы
              </li> */}
              
            </ol>
          </SectionContent>
        </div>
        <div>
          <div className={`${styles.addfieldsHeader}`}>
            Дополнительные поля
          </div>
          <div>
            {initiativeAddfields.length && (
              <CustomizedButton
                value="Добавить"
                onClick={() => addComponentItem(initiativeAddfields, 'initiative_addfields', dispatch)}
              />
            )}
            {initiativeAddfields.map((addfield, index) => (
              <div
                key={addfield.id !== -1 ? addfield.id : `new_item_${index}`}
                className={`${styles.addfieldInputWrapper}`}

              >
                <input
                  value={addfield.title}
                  onChange={(e) => handleComponentInputChange(
                    index,
                    e.target.value,
                    initiativeAddfields,
                    'initiative_addfields',
                    dispatch
                  )}
                />
                <Pictogram
                  type="delete"
                  cursor="pointer"
                  onClick={() => removeComponentItem(index, initiativeAddfields, 'initiative_addfields', dispatch)}
                />
                {index === initiativeAddfields.length - 1 && (
                  <Pictogram
                    type="add"
                    cursor='pointer'
                    onClick={() => addComponentItem(initiativeAddfields, 'initiative_addfields', dispatch)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
