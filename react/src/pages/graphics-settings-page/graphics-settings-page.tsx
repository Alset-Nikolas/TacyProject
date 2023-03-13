import { Checkbox, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import CustomizedButton from '../../components/button/button';
import ModalInfo from '../../components/modal-info/modal-info';
import SectionHeader from '../../components/section/section-header/section-header';
import { getGraphicsSettingsThunk, updateGraphicsSettingsThunk } from '../../redux/graphics-slice';
import { useGetGraphicsSettingsQuery, useGetProjectInfoQuery, useUpdateGraphicsSettingsMutation } from '../../redux/state/state-api';
import { openErrorModal, openMessageModal } from '../../redux/state/state-slice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';

// Styles
import styles from './graphics-settings-page.module.scss';

export default function GraphicsSettingsPage() {
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const modal = useAppSelector((store) => store.state.app.modal);
  // const { settings: graphicsSettings, getGraphicsRequestFailed } = useAppSelector((store) => store.graphics);
  const { data: settingsQuery, isError: getGraphicsRequestFailed } = useGetGraphicsSettingsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const graphicsSettings = settingsQuery ? settingsQuery.grafics : [];
  const statusGraphicsSettings = settingsQuery ? settingsQuery.status_grafics : [];
  const [
    updateGraphicsSettings,
    {
      isSuccess: isUpdateSuccess,
      isError: isUpdateFailed,
      data: updateResponse,
    }
  ] = useUpdateGraphicsSettingsMutation();
  const [newSettingState, setNewSettingState] = useState({settings:[...graphicsSettings], status: [...statusGraphicsSettings]});
  const initialSelectorValue = ({ settings, status }: typeof newSettingState): Array<Array<string>> => {
    const returnSelectorValue = settings.map((propertie) => {
      const activeMetrics = propertie.metrics.filter((metric) => metric.activate)
      return activeMetrics.map((el) => JSON.stringify(el.metric));
    });
    const makeStaus = () => {
      const activeMetrics = status.filter((metric) => metric.activate);
      return activeMetrics.map((el) => JSON.stringify(el.metric));
    }
    returnSelectorValue.push(makeStaus());
    return returnSelectorValue;
  };
  const [selectorValue, setSelectorValue] = useState<Array<Array<string>>>(initialSelectorValue(newSettingState));

  const SelectStyle = {
    width: '223px',
    height: '32px',
    border: '1px solid #504F4F',
    borderRadius: 0,
    paddingBottom: 0,
  };

  const onSelectorChangeHandler = (e: SelectChangeEvent<Array<string>>, index?: number) => {
    const { value } = e.target;
    if (value instanceof Array) {
      if (index !== undefined) {
        const parsedValue = value instanceof Array ? value.map((el) => JSON.parse(el)) : [];
        const localState = {...newSettingState};
        const currentPropertie = {...localState.settings[index]};
        const currentMetrics = [...currentPropertie.metrics];
        const  handledMetrics = currentMetrics.map((el) => {
          const elCopy = { ...el };
          const selected = parsedValue.find((item) => item.id === elCopy.metric.id);
          if (selected) {
            elCopy.activate = true;
          } else {
            elCopy.activate = false;
          }
          return elCopy
        });
        currentPropertie.metrics = handledMetrics
        localState.settings[index] = currentPropertie;
        setNewSettingState(localState);
        setSelectorValue((prevState) => {
          const tempState = [...prevState];
          tempState[index] = value;
          return tempState;
        });
      } else {
        const parsedValue = value instanceof Array ? value.map((el) => JSON.parse(el)) : [];
        const localState = {...newSettingState};
        const metrics = [...localState.status];
        const  handledMetrics = metrics.map((el) => {
          const elCopy = { ...el };
          const selected = parsedValue.find((item) => item.id === elCopy.metric.id);
          if (selected) {
            elCopy.activate = true;
          } else {
            elCopy.activate = false;
          }
          return elCopy
        });
        localState.status = handledMetrics
        // localState.settings[index] = currentPropertie;
        setNewSettingState(localState);
        setSelectorValue((prevState) => {
          const tempState = [...prevState];
          tempState[tempState.length-1] = value;
          return tempState;
        });
      }
    }
  };

  const handleRenderValue = (selected: Array<string>) => {
    const parsedSelected = selected.map((el) => JSON.parse(el));
    const titles = parsedSelected.map((el) => el.title);
    return titles.join(', ');
  }

  const saveButtonClickHandler = () => {
    if (currentId) {

      updateGraphicsSettings({
        projectId: currentId,
        settings: newSettingState.settings,
        statusSettings: newSettingState.status,
      })
    }
  }

  useEffect(() => {
    if (project) dispatch(getGraphicsSettingsThunk(project.id));
  }, [project]);

  useEffect(() => {
    if(settingsQuery) {
      setNewSettingState({settings:[...settingsQuery.grafics], status: [...settingsQuery.status_grafics]});
      setSelectorValue(initialSelectorValue({settings:[...settingsQuery.grafics], status: [...settingsQuery.status_grafics]}));
    }
  }, [settingsQuery])

  useEffect(() => {
    if (getGraphicsRequestFailed) {
      dispatch(openErrorModal('Произошла ошибка'));
    }
    if(isUpdateSuccess) {
      dispatch(openMessageModal(updateResponse.msg));
    }
    if(isUpdateFailed) {
      dispatch(openErrorModal('Произошла ошибка при сохранении'));
    }
  }, [
    getGraphicsRequestFailed,
    isUpdateSuccess,
    isUpdateFailed,
  ])

  return (
    <div className={`${styles.wrapper}`}>
      <SectionHeader
        edit
      >
        Построение графиков
      </SectionHeader>
      <div
        className={`${styles.settingsWrapper}`}
      >
        {!newSettingState.settings.length && (
          <div>Атрибуты инициатив отсутствуют</div>
        )}
        {newSettingState.settings.map((settingsItem, index) => {
          return (
            <div
              key={settingsItem.propertie.id}
              style={{display: 'flex', alignItems: 'center', gap: '8px', width: '60%'}}
            >
              <div>
                По оси Х:
                &nbsp;
                <span>
                  {settingsItem.propertie.title}
                </span>
              </div>
              <div
              >
                По оси Y:
                &nbsp;
                <Select
                  value={selectorValue[index] || []}
                  sx={SelectStyle}
                  multiple={true}
                  renderValue={handleRenderValue}
                  SelectDisplayProps={{
                    style: {
                      padding: '0 16px',
                    },
                  }}
                  onChange={(e) => onSelectorChangeHandler(e, index)}
                >
                  {settingsItem.metrics.map((el) => (
                    <MenuItem value={JSON.stringify({ ...el.metric })} key={el.metric.id}>
                      {el.metric.title}
                      <Checkbox checked={el.activate} />
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          );
        })}
        <div
          style={{display: 'flex', alignItems: 'center', gap: '8px', width: '60%'}}
        >
          <div>
            По оси Х:
            &nbsp;
            <span>
              Статус
            </span>
          </div>
          <div
          >
            По оси Y:
            &nbsp;
            <Select
              value={selectorValue[selectorValue.length -1] || []}
              sx={SelectStyle}
              multiple={true}
              renderValue={handleRenderValue}
              SelectDisplayProps={{
                style: {
                  padding: '0 16px',
                },
              }}
              onChange={(e) => onSelectorChangeHandler(e)}
            >
              {newSettingState.status.map((el) => (
                <MenuItem value={JSON.stringify({ ...el.metric })} key={el.metric.id}>
                  {el.metric.title}
                  <Checkbox checked={el.activate} />
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
        
      </div>
      {!!newSettingState.settings.length && (
        <div
          className={`${styles.buttonWrapper}`}
        >
          <CustomizedButton
            value="Отменить"
            color="transparent"
          />
          <CustomizedButton
            value="Сохранить"
            color="blue"
            onClick={saveButtonClickHandler}
          />
        </div>
      )}
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
      {modal.isOpen && modal.type.message && (
        <ModalInfo message={modal.message} />
      )}
    </div>
  );
}
