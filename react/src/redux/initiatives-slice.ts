import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getComponents, getInitiativesList, getRequest, postRequest } from '../utils/requests';
import { TComponentsSettings, TInitiative, TPropertie } from '../types';

type TState = {
  list: Array<TInitiative>;
  personalList: Array<TInitiative>;
  filter: {
    properties: Array<TPropertie & {
      selectedItems: Array<{
        id: number;
        value: string;
        propertie: number;
      }>
    }>,
    metrics: {
      metric: {
        id: number;
        name: string;
      };
      type: {
        title: string;
        value: number;
      }
    },
    status: Array<{
      id: number,
      name: string,
    }>,
    initiative: string,
    roles: Array<{
      role: number,
      items: Array<{
        id: number,
        item: string
      }>
    }>,
    files: Array<{
      title: string,
      id: number
    }>,
  },

  initiative: TInitiative | null;
  currentInitiativeId: number | null;

  initiativesListRequest: boolean,
  initiativesListRequestSuccess: boolean,
  initiativesListRequestFailed: boolean,

  personalInitiativesListRequest: boolean,
  personalInitiativesListRequestSuccess: boolean,
  personalInitiativesListRequestFailed: boolean,

  initiativesByIdRequest: boolean,
  initiativesByIdRequestSuccess: boolean,
  initiativesByIdRequestFailed: boolean,

  addInitiativeRequest: boolean,
  addInitiativeRequestSuccess: boolean,
  addInitiativeRequestFailed: boolean,
};

const initialState: TState = {
  list: [],
  personalList: [],
  filter: {
    properties: [],
    metrics: {
      metric: {
        id: -1,
        name: 'Не выбрано',
      },
      type: {
        title: 'По возрастанию',
        value: 0,
      }
    },
    status: [],
    initiative: '',
    roles: [],
    files: [],
  },

  initiative: null,
  currentInitiativeId: null,

  initiativesListRequest: false,
  initiativesListRequestSuccess: false,
  initiativesListRequestFailed: false,

  personalInitiativesListRequest: false,
  personalInitiativesListRequestSuccess: false,
  personalInitiativesListRequestFailed: false,

  initiativesByIdRequest: false,
  initiativesByIdRequestSuccess: false,
  initiativesByIdRequestFailed: false,

  addInitiativeRequest: false,
  addInitiativeRequestSuccess: false,
  addInitiativeRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    setInitiativesState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setCurrentInitiativeId: (state, action) => {
      state.currentInitiativeId = action.payload;
    },
    initiativesListRequest: (state) => {
      return {
        ...state,
        initiativesListRequest: true,
        initiativesListRequestSuccess: false,
        initiativesListRequestFailed: false,
      }
    },
    initiativesListRequestSuccess: (state, action) => {
      return {
        ...state,
        list: action.payload,
        initiativesListRequest: false,
        initiativesListRequestSuccess: true,
      }
    },
    initiativesListRequestFailed: (state) => {
      return {
        ...state,
        initiativesListRequest: false,
        initiativesListRequestFailed: true,
      }
    },
    initiativesByIdRequest: (state) => {
      return {
        ...state,
        initiativesByIdRequest: true,
        initiativesByIdRequestSuccess: false,
        initiativesByIdRequestFailed: false,
      }
    },
    initiativesByIdRequestSuccess: (state, action) => {
      return {
        ...state,
        initiative: action.payload,
        initiativesByIdRequest: false,
        initiativesByIdRequestSuccess: true,
      }
    },
    initiativesByIdRequestFailed: (state) => {
      return {
        ...state,
        initiativesByIdRequest: false,
        initiativesByIdRequestFailed: true,
      }
    },
    personalInitiativesListRequest: (state) => {
      return {
        ...state,
        personalInitiativesListRequest: true,
        personalInitiativesListRequestSuccess: false,
        personalInitiativesListRequestFailed: false,
      }
    },
    personalInitiativesListRequestSuccess: (state, action) => {
      return {
        ...state,
        personalList: action.payload,
        personalInitiativesListRequest: false,
        personalInitiativesListRequestSuccess: true,
      }
    },
    personalInitiativesListRequestFailed: (state) => {
      return {
        ...state,
        personalInitiativesListRequest: false,
        personalInitiativesListRequestFailed: true,
      }
    },
    clearInitiative: (state) => {
      state.initiative = null;
    },
    clearInitiativesList: (state) => {
      state.list = [];
    },
    addInitiativeRequest: (state) => {
      return {
        ...state,
        addInitiativeRequest: true,
        addInitiativeRequestSuccess: false,
        addInitiativeRequestFailed: false,
      }
    },
    addInitiativeRequestSuccess: (state) => {
      return {
        ...state,
        addInitiativeRequest: false,
        addInitiativeRequestSuccess: true,
      }
    },
    addInitiativeRequestFailed: (state) => {
      return {
        ...state,
        addInitiativeRequest: false,
        addInitiativeRequestFailed: true,
      }
    },
    setfilterProperties: (state, action) => {
      state.filter.properties = action.payload;
    },
    setSortMetrics: (state, action) => {
      state.filter.metrics = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filter.status = action.payload;
    },
    setRolesFilter: (state, action) => {
      state.filter.roles = action.payload;
    },
    setFilesFilter: (state, action) => {
      state.filter.files = action.payload;
    },
    setInitiativeFilter: (state, action) => {
      state.filter.initiative = action.payload;
    },
  },
});

export const {
  setInitiativesState,
  setCurrentInitiativeId,
  initiativesListRequest,
  initiativesListRequestSuccess,
  initiativesListRequestFailed,
  personalInitiativesListRequest,
  personalInitiativesListRequestSuccess,
  personalInitiativesListRequestFailed,
  initiativesByIdRequest,
  initiativesByIdRequestSuccess,
  initiativesByIdRequestFailed,
  clearInitiative,
  clearInitiativesList,
  addInitiativeRequest,
  addInitiativeRequestSuccess,
  addInitiativeRequestFailed,
  setfilterProperties,
  setSortMetrics,
  setStatusFilter,
  setRolesFilter,
  setFilesFilter,
  setInitiativeFilter,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getInitiativesListThunk = (id: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const project = getState().state.project.value;
  const initiative = getState().initiatives.initiative?.initiative;

  if (!project) return;
  if (id !== project.id) return;

  dispatch(initiativesListRequest());
  getInitiativesList(
    id,
    (res: AxiosResponse<{ project_initiatives: Array<TInitiative> }>) => {
      try {
        // console.log(res.data);
        if (!project) {
          throw new Error('Project is Missing');
        }
        if (id !== project.id) {
          throw new Error('Wrong project id');
        }
        if (!initiative && res.data.project_initiatives.length) dispatch(getInitiativeByIdThunk(res.data.project_initiatives[0].initiative.id));
      } catch (error) {
        console.log(error);
        dispatch(initiativesListRequestFailed());
      }
      dispatch(initiativesListRequestSuccess(res.data.project_initiatives));
    },
    () => {
      dispatch(initiativesListRequestFailed());
    }
  );
};

export const getPersonalInitiativesListThunk = (projectId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const project = getState().state.project.value;

  if (!project) return;
  if (projectId !== project.id) return;

  dispatch(personalInitiativesListRequest());
  getRequest(
    `components/initiative/info/list/user/?id=${projectId}`,
    (res: AxiosResponse<{ project_initiatives: Array<TInitiative> }>) => {
      try {
        if (!project) {
          throw new Error('Project is Missing');
        }
        if (projectId !== project.id) {
          throw new Error('Wrong project id');
        }
        console.log(res.data);
        dispatch(getInitiativeByIdThunk(res.data.project_initiatives[0].initiative.id));
        dispatch(personalInitiativesListRequestSuccess(res.data.project_initiatives));
      } catch (error) {
        console.log(error);
        dispatch(personalInitiativesListRequestFailed());
      }
    },
    () => {
      dispatch(personalInitiativesListRequestFailed());
    }
  );
};

export const getInitiativeByIdThunk = (id: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const project = getState().state.project.value;

  dispatch(initiativesByIdRequest());
  getRequest(
    `/components/initiative/info/?id=${id}`,
    (res: AxiosResponse<TInitiative>) => {
      try {
        // console.log(res.data);
        const newInitiative = {} as any;
        // newInitiative                  
      } catch (error) {
        console.log(error);
        dispatch(initiativesByIdRequestFailed());
      }
      dispatch(initiativesByIdRequestSuccess(res.data));
    },
    () => {
      dispatch(initiativesByIdRequestFailed());
    }
  );
};

export const addInitiativeThunk = (initiative: any) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const initiative = getState().initiatives.initiative;
  const body = { ...initiative };

  dispatch(addInitiativeRequest());
  postRequest(
    `components/initiative/create/`,
    body,
    (res: AxiosResponse) => {
      dispatch(addInitiativeRequestSuccess());
    },
    () => {
      dispatch(addInitiativeRequestFailed());
    }
  );
};
