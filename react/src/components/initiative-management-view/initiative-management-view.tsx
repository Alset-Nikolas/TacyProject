import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
import { dateFormat } from "../../consts";
// Styles
import styles from './initiative-management-view.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
//
import { TInitiative } from "../../types";
import { formatDate, makeShortedName } from "../../utils";

type TInitiativeManagementViewProps = {
  currentInitiative: TInitiative;
  editButton?: boolean;
  isSuperuser: boolean;
  isAuthor: boolean;
  onEditButtonClick: () => void;
}

export default function InitiativeManagementView({
  currentInitiative,
  editButton,
  isSuperuser,
  isAuthor,
  onEditButtonClick,
}: TInitiativeManagementViewProps) {
  const {
    author,
    date_registration,
    date_start,
    date_end,
  } = currentInitiative.initiative;
  const shortedName = makeShortedName(author);
  const registrationDate = formatDate(date_registration, dateFormat);
  const startDate = formatDate(date_start, dateFormat);
  const endDate = formatDate(date_end, dateFormat);
  return (
    <section className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        Управление инициативой
      </SectionHeader>
      <SectionContent>
        <div>
          <div className={`${styles.initiativeName}`}>
            {currentInitiative.initiative.name}
            {/* {currentInitiative.initiative.name} */}
            {/* Название инициативы */}
          </div>
          {/* {currentInitiative && (
            <div className={`${styles.initiativeNumber}`}>
              Номер инициативы: {currentInitiative.initiative.id}
            </div>
          )} */}
        </div>
        {currentInitiative && (
          <ol className={`${styles.paramsList}`}>
            {currentInitiative.addfields.map((addfield, index) => (
              <li key={addfield.id}>
                <div>
                  <div>{addfield.title.title}</div>
                  <div
                    className={`${styles.fieldsContent}`}
                  >
                    {currentInitiative.addfields[index].value}
                  </div>
                </div>
                
              </li>
            ))}
            <li>
              <div>
                <div>
                  Автор:
                </div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {shortedName}
                </div>
              </div>
            </li>
            <li>
              <div>
                <div>
                  Дата регистрации:
                </div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {/* {currentInitiative.initiative.date_registration} */}
                  {registrationDate}
                </div>
              </div>
            </li>
            {/* <li>
              <div>
                <div>Текущее состояние:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {currentInitiative.initiative.current_state}
                </div>
              </div>
            </li> */}
            {/* <li>
              <div>
                <div>Предпосылки инициативы:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {currentInitiative.initiative.reasons}
                </div>
              </div>
            </li> */}
            {/* <li>
              <div>
                <div>Описание инициативы:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {currentInitiative.initiative.description}
                </div>
              </div>
            </li> */}
            <li>
              <div>
                <div>Дата начала:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {/* {currentInitiative.initiative.date_start} */}
                  {startDate}
                </div>
              </div>
            </li>
            <li>
              <div>
                <div>Дата окончания:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {/* {currentInitiative.initiative.date_end} */}
                  {endDate}
                </div>
              </div>
            </li>
            {/* <li>
              Длителность инициативы
            </li> */}
            {/* {settings.initiative_addfields.map((addfield, index) => ( */}
            
          </ol>
        )}
      </SectionContent>
      {editButton && (isSuperuser || isAuthor) && (
        <div className={styles.editButton}>
          <Pictogram
            type="edit"
            cursor="pointer"
            onClick={onEditButtonClick}
          />
        </div>
        
      )}
    </section>
  );
}
