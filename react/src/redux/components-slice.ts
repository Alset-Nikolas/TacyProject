import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getComponents, postRequest } from '../utils/requests';
import { TComponentsSettings, IRegistryPropertie, TUpdateComponents } from '../types';
import { openErrorModal } from './state/state-slice';

type TState = {
  value: TComponentsSettings | null;

  componentsRequest: boolean,
  componentsRequestSuccess: boolean,
  componentsRequestFailed: boolean,

  updateComponentsRequest: boolean,
  updateComponentsRequestSuccess: boolean,
  updateComponentsRequestFailed: boolean,
};

const initialState: TState = {
  value: null,

  componentsRequest: false,
  componentsRequestSuccess: false,
  componentsRequestFailed: false,

  updateComponentsRequest: false,
  updateComponentsRequestSuccess: false,
  updateComponentsRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'components',
  initialState,
  reducers: {
    setComponentsState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateSettings: (state, action) => {
      if (!state.value) return state;
      state.value.settings = {
        ...state.value.settings,
        ...action.payload,
      };
    },
    updateTableRegistry: (state, action) => {
      if (!state.value) return state;
      state.value.table_registry = {
        ...state.value.table_registry,
        [action.payload.key]: action.payload.array,
      };
    },
    updateTableCommunity: (state, action) => {
      if (!state.value) return state;
      state.value.table_community = {
        ...state.value.table_community,
        ...action.payload,
      };
    },
    componentsRequest: (state) => {
      return {
        ...state,
        componentsRequest: true,
        componentsRequestSuccess: false,
        componentsRequestFailed: false,
      }
    },
    componentsRequestSuccess: (state, action) => {
      return {
        ...state,
        value: action.payload,
        componentsRequest: false,
        componentsRequestSuccess: true,
      }
    },
    componentsRequestFailed: (state) => {
      return {
        ...state,
        componentsRequest: false,
        componentsRequestFailed: true,
      }
    },
    updateComponentsRequest: (state) => {
      return {
        ...state,
        updateComponentsRequest: true,
        updateComponentsRequestSuccess: false,
        pupdateComponentsRequestFailed: false,
      }
    },
    updateComponentsRequestSuccess: (state) => {
      return {
        ...state,
        updateComponentsRequest: false,
        updateComponentsRequestSuccess: true,
      }
    },
    updateComponentsRequestFailed: (state) => {
      return {
        ...state,
        updateComponentsRequest: false,
        updateComponentsRequestFailed: true,
      }
    },
  },
});

export const {
  setComponentsState,
  updateSettings,
  updateTableRegistry,
  updateTableCommunity,
  componentsRequest,
  componentsRequestSuccess,
  componentsRequestFailed,
  updateComponentsRequest,
  updateComponentsRequestSuccess,
  updateComponentsRequestFailed,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getComponentsThunk = (id: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const project = getState().state.project.value;

  if (!project) return;
  if (id !== project.id) return;

  dispatch(componentsRequest());
  getComponents(
    id,
    (res: AxiosResponse<TComponentsSettings>) => {
      try {
        // console.log(res.data);
      } catch (error) {
        console.log(error);
        dispatch(componentsRequestFailed());
      }
      dispatch(componentsRequestSuccess(res.data));
    },
    () => {
      dispatch(componentsRequestFailed());
    }
  );
};

export const updateComponentsThunk = (projectId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const project = getState().state.project.value;
  const components = getState().components.value;

  if (!components) return;

  const { settings, table_registry } = components;

  if (!project || !settings || !table_registry) return;
  if (projectId !== project.id) return;

  const body = {} as TUpdateComponents;

  body.project = projectId;
  body.addfields = settings.initiative_addfields.map((addfield) => {
    return {
      title: addfield.title,
      type: addfield.type,
    };
  });
  body.events_addfields = settings.event_addfields.map((addfield) => {
    return {
      title: addfield.title,
      type: addfield.type,
    };
  });
  body.risks_addfields = settings.risks_addfields.map((addfield) => {
    return {
      title: addfield.title,
      type: addfield.type,
    };
  });
  body.status = [...settings.initiative_status].splice(2, settings.initiative_status.length - 2).map((status) => {
    return {
      name: status.name,
      value: status.value,
    };
  });
  body.table_registry = table_registry;

  dispatch(updateComponentsRequest());
  postRequest(
    'components/settings/',
    body,
    () => {
      dispatch(updateComponentsRequestSuccess());
    },
    () => {
      dispatch(componentsRequestFailed());
      dispatch(openErrorModal('При сохранении произошла ошибка'));
    }
  );
};
