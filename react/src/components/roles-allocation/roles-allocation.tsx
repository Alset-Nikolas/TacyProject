import { useState } from "react";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
import CustomizedSelect from "../select/Select";

// Styles
import styles from './role-allocation.module.scss';
import sectionStyles from '../../styles/sections.module.scss';

const membersList = [
  'user1',
  'user2',
  'user3',
];

export default function RolesAlloction() {
  const [isOpen, setIsOpen] = useState(false);
  const notAllocated = 'Не выбрано';
  const roles = [
    {
      id: 1,
      name: 'Наблюдатель',
      values: [
        {
          id: 11,
          value: 'user2',
        },
        {
          id: 12,
          value: 'user1',
        },
        {
          id: 13,
          value: '',
        },
        {
          id: 15,
          value: '',
        },
      ]
    },
    {
      id: 2,
      name: 'Руководитель',
      values: [
        {
          id: 14,
          value: 'user3',
        },
      ]
    },
    {
      id: 3,
      name: 'Роль',
      values: [],
    },
  ];
  return (
    <div
      className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}
    >
      <SectionHeader>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setIsOpen((prevState) => !prevState)}
        >
          Распределение ролей
          <Pictogram
            type={isOpen ? 'close' : 'show'}
            cursor="pointer"
          />
        </div>
      </SectionHeader>
      {isOpen && (
        <SectionContent>
          <div
            className={`${styles.contentWrapper}`}
          >
          <div
            className={`${styles.titlesColumn}`}
          >
            {roles.map((role) => (
              <div
                key={`title_${role.id}`}
                className={`${styles.cell}`}
              >
                  {role.name}
              </div>
            ))}
          </div>
          <div
            className={`${styles.valuesColumn}`}
          >
            {
              roles.map((role) => (
                <div
                  key={role.id}
                  className={`${styles.cell}`}
                >
                  {!role.values.length && (
                    <Pictogram
                      type="add-filled"
                      cursor="pointer"
                    />
                  )}
                  {role.values.map((value, index) => (
                      <div
                        key={value.id}
                        className={`${styles.selectorWrapper}`}
                      >
                        <CustomizedSelect
                          items={[...membersList, notAllocated]}
                          value={value.value ? value.value : notAllocated}
                        />
                        <Pictogram
                          type="delete"
                          cursor="pointer"
                        />
                        {(index === role.values.length - 1) && (
                          <Pictogram
                          type="add"
                          cursor="pointer"
                        />
                        )}
                      </div>
                    ))
                  }
                </div>
              ))
            }
          </div>
          </div>
        </SectionContent>
      )}
    </div>
  );
}
