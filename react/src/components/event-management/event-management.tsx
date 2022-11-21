import { addComponentItem, handleComponentInputChange, removeComponentItem } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './event-management.module.scss';

type TEventManagementProps = {
  edit?: boolean;
}

export default function EventManagement({ edit }: TEventManagementProps) {
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
        Управление мероприятием
      </SectionHeader>
      <div className={`${styles.content}`}>
        <div>
          <div className={`${styles.addfieldsHeader}`}>
            Постоянные поля
          </div>
          <SectionContent
            edit
          >
            <ol>
              <li>
                Дата начала
              </li>
              <li>
                Дата окончания
              </li>
            </ol>
          </SectionContent>
        </div>
        <div>
          <div className={`${styles.addfieldsHeader}`}>
            Дополнительные поля
          </div>
          {!settings.event_addfields.length && (
            <CustomizedButton
              value="Добавить"
              onClick={() => addComponentItem(settings.event_addfields, 'event_addfields', dispatch)}
            />
          )}
          {settings.event_addfields.map((addfield, index) => (
            <div
              key={addfield.id !== -1 ? addfield.id : `new_item_${index}`}
              className={`${styles.addfieldInputWrapper}`}
            >
              <input
                value={addfield.title}
                onChange={(e) => handleComponentInputChange(
                  index,
                  e.target.value,
                  settings.event_addfields,
                  'event_addfields',
                  dispatch
                )}
              />
              <Pictogram
                type="delete"
                cursor="pointer"
                onClick={() => removeComponentItem(index, settings.event_addfields, 'event_addfields', dispatch)}
              />
              {index === settings.event_addfields.length - 1 && (
                <Pictogram
                  type="add"
                  cursor="pointer"
                  onClick={() => addComponentItem(settings.event_addfields, 'event_addfields', dispatch)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        Управление мероприятием
      </SectionHeader>
      <SectionContent>
        <ol>
          <li>
            Дата начала
          </li>
          <li>
            Дата окончания
          </li>
          {settings.event_addfields.map((addfield) => (
            <li key={addfield.id}>
              {addfield.title}
            </li>
          ))}
        </ol>
      </SectionContent>
    </section>
  );
}
