import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddRisk from "../../components/add-risk/add-risk";
import CustomizedButton from "../../components/button/button";
import EditInitiative from "../../components/edit-initiative/edit-initiative";
import EditRisk from "../../components/edit-risk/edit-risk";
import EditRisks from "../../components/edit-risks/edit-risks";
import InitiativeManagement from "../../components/initiative-management/initiative-management";
import RiskManagement from "../../components/risk-management/risk-management";
import CustomizedSelect from "../../components/select/Select";
import { paths } from "../../consts";
import { addInitiativeThunk, setInitiativesState } from "../../redux/initiatives-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

// Styles
import styles from './edit-risk-page.module.scss';

export default function EditRiskPage() {
  const navigate = useNavigate();
  const { initiativeEdit } = useAppSelector((store) => store.state.app);
  const risksList = useAppSelector((store) => store.risks.list);
  const [addRisk, setAddRisk] = useState(false);

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
        {initiativeEdit.risks && (
          <EditRisk />
        )}        
      </div>
    </div>
  );
}
