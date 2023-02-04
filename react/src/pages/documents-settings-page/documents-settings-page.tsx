import { ChangeEvent, useEffect, useState } from 'react';
import CustomizedButton from '../../components/button/button';
import ModalInfo from '../../components/modal-info/modal-info';
import Pictogram from '../../components/pictogram/pictogram';
import SectionHeader from '../../components/section/section-header/section-header';
import {
  useGetFilesSettingsQuery,
  usePostFilesSettingsMutation
} from '../../redux/state/state-api';
import { openErrorModal } from '../../redux/state/state-slice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import SectionContent from '../../components/section/section-content/section-content';

// Styles
import styles from './documents-settings-page.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { TStatusField } from '../../types';

export default function DocumentsSettingsPage() {
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const modal = useAppSelector((store) => store.state.app.modal);
  
  const { data: filesSettings } = useGetFilesSettingsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [tempFilesSettings, setTempFilesSettings] = useState(filesSettings ? filesSettings : []);
  const [
    postFilesSettings,
    {
      isError: postFilesSettingsError,
      isSuccess: postFilesSettingsSuccess,
    },
  ] = usePostFilesSettingsMutation();
  const [edit, setEdit] = useState(false);
  const [renderFilesSetting, setRenderFilesSetting] = useState<Array<Array<{id: number; title: string}>>>([]);

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
    if (filesSettings) {
      setTempFilesSettings(filesSettings);
      setEdit(false);
    }
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

  useEffect(() => {
    if(tempFilesSettings.length) {
      const newRenderFileSetting: Array<any> = [];
      const entries = Object.entries(tempFilesSettings);

      tempFilesSettings.forEach((el) => {
        const entries = Object.entries(el);
        entries.forEach((el) => {

          const [key, value] = el;
          
          if (key === 'status') {
            newRenderFileSetting.push([{
              id: (value as TStatusField).id,
              title: (value as TStatusField).name
            }]);
          }

        })
      })

      tempFilesSettings.forEach((el,index) => {
        const entries = Object.entries(el);
        entries.forEach((el) => {

          const [key, value] = el;

          if (key === 'settings_file' && value instanceof Array) {
            value.forEach((fileInfo) => {
              newRenderFileSetting[index].push({
                id: fileInfo.id,
                title: fileInfo.title,
              });
            })
          }
        })
      })

      newRenderFileSetting.splice(0, 2);

      let maxLength = 0;
      newRenderFileSetting.forEach((el) => {
        if (el.length > maxLength) maxLength = el.length;
      });

      newRenderFileSetting.forEach((el) => {
        const addCount = maxLength - el.length;
        for (let i = 0; i < addCount; i++) {
          el.push({
            id: `empty-${i}`,
            title: '',
          });
        }
      });

      setRenderFilesSetting(newRenderFileSetting);
    }

  }, [tempFilesSettings])

  useEffect(() => {
    if (postFilesSettingsSuccess) {
      setEdit(false);
    }
    if (postFilesSettingsError) {
      dispatch(openErrorModal('Произошла ошибка. Проверьте заполнение полей'));
    }
  }, [postFilesSettingsError, postFilesSettingsSuccess])

  if (edit) return (
    <div className={`${styles.wrapper}`}>
      <SectionHeader
        edit
      >
        Прикрепляемые документы
      </SectionHeader>
      <div
        className={`${styles.settingsWrapper}`}
      >
        {!tempFilesSettings.length && (
          <div
            style={{
              padding: 20,
            }}
          >
            Статусы отсутствуют
          </div>
        )}
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
                    type="add-filled"
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
                      type="delete-filled"
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

  return (
    <div className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader
        className={`${sectionStyles.editHeaderWithButton}`}
      >
        Прикрепляемые документы
        <Pictogram
          type="edit"
          onClick={() => setEdit(true)}
        />
      </SectionHeader>
      <SectionContent
        className={`${styles.settingsWrapperView}`}
      >
        {!renderFilesSetting.length && (
          <div
            style={{
              padding: 20,
            }}
          >
            Статусы отсутствуют
          </div>
        )}
        {renderFilesSetting.map((filesArray, index) => (
          <div
            key={`files-col-${index}`}
            className={`${styles.statusWrapperView}`}
          >
            {filesArray.map((item, itemIndex) => {
              return (
                <div
                  key={item.id}
                  className={`${itemIndex === 0 ? styles.statusHeaderView : styles.fileInputWrapperView} ${itemIndex % 2 ? styles.oddRow : ''}`}
                >
                  {item.title}
                </div>
              )
          })}
          </div>
        ))}
        {/* {tempFilesSettings.map((item, index) => {
          if (item.status.value < 0) return null;
          return (
            <div
              key={item.status.id}
              className={`${styles.statusWrapperView}`}
            >
              <div
                className={`${styles.statusHeaderView}`}
              >
                {item.status.name}
              </div>
              <div
                className={`${styles.filesListView}`}
              >
                {item.settings_file.map((fileItem, fileItemIndex) => (
                  <div
                    key={fileItem.id}
                    className={`${styles.fileInputWrapperView} ${(fileItemIndex + 1) % 2 ? styles.oddRow : ''}`}
                  >
                    {fileItem.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })} */}
      </SectionContent>
    </div>
  );
}
