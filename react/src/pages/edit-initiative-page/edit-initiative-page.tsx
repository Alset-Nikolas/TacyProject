import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddRisk from "../../components/add-risk/add-risk";
import CustomizedButton from "../../components/button/button";
import EditInitiative from "../../components/edit-initiative/edit-initiative";
import InitiativeManagement from "../../components/initiative-management/initiative-management";
import RiskManagement from "../../components/risk-management/risk-management";
import { paths } from "../../consts";
import { useGetComponentsQuery } from "../../redux/state/state-api";
import { useAppSelector } from "../../utils/hooks";

// Styles
import styles from './edit-initiative-page.module.scss';

export default function EditInitiativePage() {
  const navigate = useNavigate();
  const { initiativeEdit } = useAppSelector((store) => store.state.app);
  const risksList = useAppSelector((store) => store.risks.list);
  const [addRisk, setAddRisk] = useState(false);
  const {
    currentId,
  } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });

  return (
    <div className={`${styles.wrapper}`}>
      {initiativeEdit.initiative ? (
        <EditInitiative />
      ) : (
        <div>
          <InitiativeManagement
            editButton
          />
        </div>
      )}
      <div className={`${styles.riskWrapper}`}>
        {!initiativeEdit.risks ? (
          <RiskManagement
            editButton
            components={components!}
          />
        ) : (
          <>
            {!risksList.length && (
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                }}
              >
                <CustomizedButton
                  value="Отменить"
                  onClick={() => navigate(`/${paths.registry}`)}
                />
                <CustomizedButton
                  value="Добавить"
                  onClick={() => setAddRisk(true)}
                />
              </div>
            )}
            {!!risksList.length && (
              <>
                <RiskManagement
                  components={components!}
                />
                {!addRisk && (
                  <div
                    className={`${styles.buttonWrapper}`}
                  >
                    <CustomizedButton 
                      value="Добавить"
                      onClick={() => setAddRisk(true)}
                    />
                    <CustomizedButton 
                      value="Готово"
                      onClick={() => navigate(`/${paths.registry}`)}
                    />
                  </div>
                )}
                
              </>
            )}
            {addRisk && (
              <AddRisk
                setAddRisk={setAddRisk}
              />
            )}
          </>
        )}        
      </div>
    </div>
  );
}
