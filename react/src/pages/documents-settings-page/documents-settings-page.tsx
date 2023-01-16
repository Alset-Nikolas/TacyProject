import { Checkbox, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import CustomizedButton from '../../components/button/button';
import Graphics from '../../components/graphics/graphics';
import ModalInfo from '../../components/modal-info/modal-info';
import Pictogram from '../../components/pictogram/pictogram';
import SectionHeader from '../../components/section/section-header/section-header';
import SelectUnits from '../../components/select-units/select-units';
import CustomizedSelect from '../../components/select/Select';
import { getGraphicsSettingsThunk, updateGraphicsSettingsThunk } from '../../redux/graphics-slice';
import { useGetFilesQuery, useGetFilesSettingsQuery, useGetProjectInfoQuery, usePostFilesMutation, usePostFilesSettingsMutation } from '../../redux/state/state-api';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';

// Styles
import styles from './documents-settings-page.module.scss';

export default function DocumentsSettingsPage() {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const modal = useAppSelector((store) => store.state.app.modal);
  const graphicsSettings = useAppSelector((store) => store.graphics.settings);
  const [newSettingState, setNewSettingState] = useState([...graphicsSettings]);
  const initialSelectorValue = (settings: typeof graphicsSettings): Array<Array<string>> => {
    const returnSelectorValue = settings.map((propertie) => {
      const activeMetrics = propertie.metrics.filter((metric) => metric.activate)
      return activeMetrics.map((el) => JSON.stringify(el.metric));
    });
    return returnSelectorValue;
  };
  const [selectorValue, setSelectorValue] = useState<Array<Array<string>>>(initialSelectorValue(newSettingState));
  const components = useAppSelector((store) => store.components.value);
  const { data: filesSettings } = useGetFilesSettingsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [tempFilesSettings, setTempFilesSettings] = useState(filesSettings ? filesSettings : []);
  const [postFilesSettings] = usePostFilesSettingsMutation();

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

  const onInputChangeHandler = (e: ChangeEvent<HTMLInputElement>, statusIndex: number, fileItemIndex: number) => {
    const value = e.target.value;

    setTempFilesSettings((prevState) => {
      const newState = [...prevState];
      const currentStatus = {...newState[statusIndex]};
      const filesArray = [...currentStatus.settings_file];
      const currentFile = {...filesArray[fileItemIndex]};
      currentFile.title = value;
      filesArray[fileItemIndex] = currentFile;
      currentStatus.settings_file = filesArray;
      newState[statusIndex] = currentStatus;

      return newState;
    });
  };

  const saveButtonClickHandler = () => {
    if (currentId) {
      const body = [] as Array<{
        id: number;
        title: string;
        status: number;
      }>;
      tempFilesSettings.forEach((el) => {
        if (el.status.value > -1) {
          el.settings_file.forEach((file) => {
            body.push({
              id: file.id,
              title: file.title,
              status: el.status.id,
            });
          });
        }
      });

      postFilesSettings({projectId: currentId, body });
    }
  };

  const cancelButtonClickHandler = () => {
    if (filesSettings) setTempFilesSettings(filesSettings);
  };

  const addFileSettings = (index: number) => {
    setTempFilesSettings((prevState) => {
      const newState = [...prevState];
      const settingsItem = {...newState[index]};
      const filesInfo = [...settingsItem.settings_file];
      filesInfo.push({
        id: -1,
        settings_project: currentId ? currentId : -1,
        title: '',
        status: newState[index].status.id,
      });
      settingsItem.settings_file = filesInfo;
      newState[index] = settingsItem;

      return newState;
    });
  };

  const removeFileSettings = (index: number, fileItemIndex: number) => {
    setTempFilesSettings((prevState) => {
      const newState = [...prevState];
      const settingsItem = {...newState[index]};
      const filesInfo = [...settingsItem.settings_file];
      filesInfo.splice(fileItemIndex, 1);
      settingsItem.settings_file = filesInfo;
      newState[index] = settingsItem;

      return newState;
    });
  };

  useEffect(() => {
    if (filesSettings) setTempFilesSettings(filesSettings);
  }, [filesSettings]);

  return (
    <div className={`${styles.wrapper}`}>
      <SectionHeader
        edit
      >
        Прикрепляемые документы
      </SectionHeader>
      <div
        className={`${styles.settingsWrapper}`}
      >
        {tempFilesSettings.map((item, index) => {
          if (item.status.value < 0) return null;
          return (
            <div
              key={item.status.id}
              className={`${styles.statusWrapper}`}
            >
              <div
                className={`${styles.statusHeader}`}
              >
                {item.status.name}
                <div>
                  <Pictogram
                    type="add"
                    cursor="pointer"
                    onClick={() => addFileSettings(index)}
                  />
                </div>
              </div>
              {item.settings_file.map((fileItem, fileItemIndex) => (
                <div
                  key={fileItem.id}
                  className={`${styles.fileInputWrapper}`}
                >
                  <input
                    value={fileItem.title}
                    onChange={(e) => onInputChangeHandler(e, index, fileItemIndex)}
                  />
                  <div>
                    <Pictogram
                      type="delete"
                      cursor="pointer"
                      onClick={() => removeFileSettings(index, fileItemIndex)}
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
        <div
          className={`${styles.buttonWrapper}`}
        >
          <CustomizedButton
            value="Отменить"
            color="transparent"
            onClick={cancelButtonClickHandler}
          />
          <CustomizedButton
            value="Сохранить"
            color="blue"
            onClick={saveButtonClickHandler}
          />
        </div>
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
      {modal.isOpen && modal.type.message && (
        <ModalInfo message={modal.message} />
      )}
    </div>
  );
}
