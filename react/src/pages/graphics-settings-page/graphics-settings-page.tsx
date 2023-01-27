import { Checkbox, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import CustomizedButton from '../../components/button/button';
import Graphics from '../../components/graphics/graphics';
import ModalInfo from '../../components/modal-info/modal-info';
import SectionHeader from '../../components/section/section-header/section-header';
import SelectUnits from '../../components/select-units/select-units';
import CustomizedSelect from '../../components/select/Select';
import { getGraphicsSettingsThunk, updateGraphicsSettingsThunk } from '../../redux/graphics-slice';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { openErrorModal } from '../../redux/state/state-slice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';

// Styles
import styles from './graphics-settings-page.module.scss';

export default function GraphicsSettingsPage() {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const modal = useAppSelector((store) => store.state.app.modal);
  const { settings: graphicsSettings, getGraphicsRequestFailed } = useAppSelector((store) => store.graphics);
  const [newSettingState, setNewSettingState] = useState([...graphicsSettings]);
  const initialSelectorValue = (settings: typeof graphicsSettings): Array<Array<string>> => {
    const returnSelectorValue = settings.map((propertie) => {
      const activeMetrics = propertie.metrics.filter((metric) => metric.activate)
      return activeMetrics.map((el) => JSON.stringify(el.metric));
    });
    return returnSelectorValue;
  };
  const [selectorValue, setSelectorValue] = useState<Array<Array<string>>>(initialSelectorValue(newSettingState));

  const SelectStyle = {
    minWidth: '223px',
    height: '32px',
    border: '1px solid #504F4F',
    borderRadius: 0,
    paddingBottom: 0,
  };

  const onSelectorChangeHandler = (e: SelectChangeEvent<Array<string>>, index: number) => {
    // console.log(JSON.parse(e.target.value[0]));
    const { value } = e.target;
    if (value instanceof Array) {
      const parsedValue = value.map((el) => JSON.parse(el));
      // if (parsedValue[index]) parsedValue[index].activate = !parsedValue[index].activate;
      const localState = [...newSettingState];
      const currentPropertie = {...localState[index]};
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
      localState[index] = currentPropertie;
      setNewSettingState(localState);
      setSelectorValue((prevState) => {
        const tempState = [...prevState];
        // tempState[index] = parsedValue.map((el) => JSON.stringify(el));
        tempState[index] = value;
        return tempState;
      });
    }
  };

  const handleRenderValue = (selected: Array<string>) => {
    const parsedSelected = selected.map((el) => JSON.parse(el));
    const titles = parsedSelected.map((el) => el.title);
    return titles.join(', ');
  }

  const saveButtonClickHandler = () => {
    if (project) dispatch(updateGraphicsSettingsThunk(project?.id, newSettingState));
  }

  useEffect(() => {
    if (project) dispatch(getGraphicsSettingsThunk(project.id));
  }, [project]);

  useEffect(() => {
    setNewSettingState([ ...graphicsSettings ]);
    setSelectorValue(initialSelectorValue([ ...graphicsSettings ]));
  }, [graphicsSettings])

  useEffect(() => {
    if (getGraphicsRequestFailed) {
      dispatch(openErrorModal('Произошла ошибка'));
    }
  }, [getGraphicsRequestFailed])

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
        {!newSettingState.length && (
          <div>Атрибуты инициатив отсутствуют</div>
        )}
        {newSettingState.map((settingsItem, index) => {
          return (
            <div
              key={settingsItem.propertie.id}
              style={{display: 'flex', alignItems: 'center', gap: '8px'}}
            >
              <div>
                По оси Х:
                &nbsp;
                <span>
                  {settingsItem.propertie.title}
                </span>
              </div>
              <div
                className={`${styles.buttonWrapper}`}
              >
                По оси Y:
                &nbsp;
                {/* <SelectUnits
                  value={[]}
                  items={settingsItem.metrics.map((metric) => metric.metric.title)}
                  onChange={onSelectorChangeHandler}
                /> */}
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
      </div>
      {!!newSettingState.length && (
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
