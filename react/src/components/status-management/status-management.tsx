import { useGetComponentsQuery } from "../../redux/state/state-api";
import { TComponentsSettings } from "../../types";
import { addComponentItem, handleComponentInputChange, removeComponentItem } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './status-management.module.scss';
import sectionStyles from '../../styles/sections.module.scss';

type TStatusManagementProps = {
  edit?: boolean;
  components: TComponentsSettings;
};

export default function StatusManagement({ edit, components }: TStatusManagementProps) {
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  // const { value: components } = useAppSelector((store) => store.components);
  // const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);

  // if (!components) return null;

  const { settings } = components;

  if (!settings) {
    return (
      <div>No settings</div>
    )
  }

  if (edit) return (
    <section className={`${sectionStyles.wrapper} ${sectionStyles.edit}`}>
      <SectionHeader
        className={`${styles.header}`}
        edit
      >
        Статусы инициативы
      </SectionHeader>
      <div
        className={`${sectionStyles.fieldsContent}`}
      >
        <div>
          <div className={`${sectionStyles.addfieldsHeader}`}>
            Постоянные поля
          </div>
          <div>
            <ol className={`${sectionStyles.sectionList}`}>
              <li>
                Согласовано
              </li>
              <li>
                Отозвано
              </li>
            </ol>
          </div>
        </div>
        <div>
          <div className={`${sectionStyles.addfieldsHeader}`}>
            Дополнительные поля
            {/* {(settings.initiative_status.length < 3) && ( */}
              <CustomizedButton
                value="Добавить"
                onClick={() => addComponentItem(settings.initiative_status, 'initiative_status', dispatch)}
              />
            {/* )} */}
          </div>
          <div
            className={`${styles.addfieldsWrapper}`}
          >
            
            {settings.initiative_status.map((status, index) => {
              if (status.value < 0) return null;
              return (
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
                  {/* {index === settings.initiative_status.length - 1 && (
                    <Pictogram
                      type="add"
                      cursor="pointer"
                      onClick={() => addComponentItem(settings.initiative_status, 'initiative_status', dispatch)}
                    />
                  )} */}
                </div>
              );

            })}
          </div>
          </div>
      </div>
    </section>
  );

  return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        Статусы инициативы
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
      >
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
