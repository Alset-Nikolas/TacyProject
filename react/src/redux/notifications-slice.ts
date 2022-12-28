import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getRequest } from '../utils/requests';
import { TCoordinationHistoryItem, TNotification } from '../types';

type TState = {
  notifications: {
    count: number;
    next: string;
    previous: string;
    results: Array<{
      user: number;
      date: string;
      text: string;
    }>
  } | null;

  getNotificationsListRequest: boolean,
  getNotificationsListRequestSuccess: boolean,
  getNotificationsListRequestFailed: boolean,
};

const initialState: TState = {
  notifications: null,

  getNotificationsListRequest: false,
  getNotificationsListRequestSuccess: false,
  getNotificationsListRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    getNotificationsListRequest: (state) => {
      return {
        ...state,
        getNotificationsListRequest: true,
        getNotificationsListRequestSuccess: false,
        getNotificationsListRequestFailed: false,
      }
    },
    getNotificationsListRequestSuccess: (state, action) => {
      return {
        ...state,
        notifications: action.payload,
        getNotificationsListRequest: false,
        getNotificationsListRequestSuccess: true,
      }
    },
    getNotificationsListRequestFailed: (state) => {
      return {
        ...state,
        getNotificationsListRequest: false,
        getNotificationsListRequestFailed: true,
      }
    },
  },
});

export const {
  setNotificationsState,
  getNotificationsListRequest,
  getNotificationsListRequestSuccess,
  getNotificationsListRequestFailed,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getNotificationsThunk = (url?: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(getNotificationsListRequest());
  getRequest(
    url ? url : `notifications/info`,
    (res: AxiosResponse<{ notifications: Array<TNotification>}>) => {
      try {
        console.log(res.data);
      } catch (error) {
        console.log(error);
        dispatch(getNotificationsListRequestFailed());
      }
      dispatch(getNotificationsListRequestSuccess(res.data));
    },
    () => {
      dispatch(getNotificationsListRequestFailed());
    }
  );
};
