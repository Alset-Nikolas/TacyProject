import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getComponents, getInitiativesList, getRequest, postRequest } from '../utils/requests';
import { TBoss, TComponentsSettings, TCoordinationHistoryItem, TEvent, TInitiative, TRisk } from '../types';
import { getUserInfoByIdThunk, getUserRightsThunk } from './auth-slice';
import Properties from '../components/properties/properties';

type TState = {
  graphics: Array<{
    propertieName: string;
    graphicData: Array<{
      metricName: string;
      data: Array<{
        name: string;
        value: number;
      }>;
    }>;
  }>;

  getGraphicsRequest: boolean,
  getGraphicsRequestSuccess: boolean,
  getGraphicsRequestFailed: boolean,
};

const initialState: TState = {
  graphics: [],

  getGraphicsRequest: false,
  getGraphicsRequestSuccess: false,
  getGraphicsRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'graphics',
  initialState,
  reducers: {
    setGraphicsState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    getGraphicsRequest: (state) => {
      return {
        ...state,
        getGraphicsRequest: true,
        getGraphicsRequestSuccess: false,
        getGraphicsRequestFailed: false,
      }
    },
    getGraphicsRequestSuccess: (state, action) => {
      return {
        ...state,
        graphics: action.payload,
        getGraphicsRequest: false,
        getGraphicsRequestSuccess: true,
      }
    },
    getGraphicsRequestFailed: (state) => {
      return {
        ...state,
        getGraphicsRequest: false,
        getGraphicsRequestFailed: true,
      }
    },
  },
});

export const {
  setGraphicsState,
  getGraphicsRequest,
  getGraphicsRequestSuccess,
  getGraphicsRequestFailed,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getGraphicsThunk = (projectId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const project = getState().state.project.value;
  dispatch(getGraphicsRequest());
  getRequest(
    `grafics/statistic/metrics/?id=${projectId}`,
    (res: AxiosResponse<{ grafics: Array<any> }>) => {
      try {
        const data: Array<any> = [];
        const graphics = res.data.grafics; 
        const propertiesEntries = Object.entries(graphics);
        if (project) {
          propertiesEntries.forEach((el) => {
            const propGraphic = {} as any;
            const propertieName = project.properties.find((properie) => properie.id === +el[0])?.title;
            propGraphic.propertieName = propertieName;
            const metricssEntries = Object.entries(el[1]);
            const graphicData = metricssEntries.map((el) => {
              const metricName = project.metrics.find((metric) => metric.id === +el[0])?.title;
              return {
                metricName: metricName ? metricName : 'enum',
                data: el[1],
              };
            })
            propGraphic.graphicData = graphicData;
            data.push(propGraphic);
          });
          dispatch(getGraphicsRequestSuccess(data));
        } else {
          throw new Error('Project doesn\'t exist');
        }
        

      } catch (error) {
        console.log(error);
        dispatch(getGraphicsRequestFailed());
      }
      
    },
    () => {
      dispatch(getGraphicsRequestFailed());
    }
  );
};
