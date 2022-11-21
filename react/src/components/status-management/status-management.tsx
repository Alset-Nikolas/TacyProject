import { addComponentItem, handleComponentInputChange, removeComponentItem } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './status-management.module.scss';

type TStatusManagementProps = {
  edit?: boolean;
};

export default function StatusManagement({ edit }: TStatusManagementProps) {
  const dispatch = useAppDispatch();
  const components = useAppSelector((store) => store.components.value);

  if (!components) return null;

  const { settings } = components;

  if (!settings) {
    return (
      <div>No settings</div>
    )
  }

  if (edit) return (
    <section className={`${styles.wrapper} ${styles.edit}`}>
      <SectionHeader
       className={`${styles.header}`}
       edit
      >
        Статусы инициативы
      </SectionHeader>
      <div>
        <div className={`${styles.addfieldsHeader}`}>
          Дополнительные поля
        </div>
        <div
          className={`${styles.addfieldsWrapper}`}
        >
          {(settings.initiative_status.length < 3) && (
            <CustomizedButton
              value="Добавить"
              onClick={() => addComponentItem(settings.initiative_status, 'initiative_status', dispatch)}
            />
          )}
          {settings.initiative_status.map((status, index) => {
            if (status.value < 0) return null;
            return(
              <div
                key={status.id !== -1 ? status.id : `new_item_${index}`}
                className={`${styles.addfieldInputWrapper}`}
              >
                <input
                  value={status.name}
                  onChange={(e) => handleComponentInputChange(
                    index,
                    e.target.value,
                    settings.initiative_status,
                    'initiative_status',
                    dispatch
                  )}
                />
                <Pictogram
                  type="delete"
                  cursor="pointer"
                  onClick={() => removeComponentItem(index, settings.initiative_status, 'initiative_status', dispatch)}
                />
                {index === settings.initiative_status.length - 1 && (
                  <Pictogram
                    type="add"
                    cursor="pointer"
                    onClick={() => addComponentItem(settings.initiative_status, 'initiative_status', dispatch)}
                  />
                )}
              </div>
            );
            
          })}
        </div>
      </div>
    </section>
  );

  return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        Статусы инициативы
      </SectionHeader>
      <SectionContent>
        <ul>
          {settings.initiative_status.map((status) => (
            <li key={status.id}>
              {status.name}
            </li>
          ))}
        </ul>
      </SectionContent>
    </section>
  );
}
