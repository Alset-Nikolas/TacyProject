import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getComponents, getInitiativesList, getRequest, postRequest } from '../utils/requests';
import { TComponentsSettings, TEvent, TInitiative, TRisk } from '../types';

type TState = {
  list: Array<TEvent>;
  // currentInitiativeId: number | null;
  event: TEvent | null;

  eventsListRequest: boolean,
  eventsListRequestSuccess: boolean,
  eventsListRequestFailed: boolean,

  eventByIdRequest: boolean,
  eventByIdRequestSuccess: boolean,
  eventByIdRequestFailed: boolean,

  addEventRequest: boolean,
  addEventRequestSuccess: boolean,
  addEventRequestFailed: boolean,

  deleteEventByIdRequest: boolean;
  deleteEventByIdRequestSuccess: boolean;
  deleteEventByIdRequestFailed: boolean;
};

const initialState: TState = {
  list: [],
  // currentInitiativeId: null,
  event: null,

  eventsListRequest: false,
  eventsListRequestSuccess: false,
  eventsListRequestFailed: false,

  eventByIdRequest: false,
  eventByIdRequestSuccess: false,
  eventByIdRequestFailed: false,

  addEventRequest: false,
  addEventRequestSuccess: false,
  addEventRequestFailed: false,

  deleteEventByIdRequest: false,
  deleteEventByIdRequestSuccess: false,
  deleteEventByIdRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEventsState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setEventsList: (state, action) => {
      state.list = action.payload;
    },
    eventsListRequest: (state) => {
      return {
        ...state,
        eventsListRequest: true,
        eventsListRequestSuccess: false,
        eventsListRequestFailed: false,
      }
    },
    eventsListRequestSuccess: (state, action) => {
      return {
        ...state,
        list: action.payload,
        eventsListRequest: false,
        eventsListRequestSuccess: true,
      }
    },
    eventsListRequestFailed: (state) => {
      return {
        ...state,
        eventsListRequest: false,
        eventsListRequestFailed: true,
      }
    },
    eventByIdRequest: (state) => {
      return {
        ...state,
        eventByIdRequest: true,
        eventByIdRequestSuccess: false,
        eventByIdRequestFailed: false,
      }
    },
    eventByIdRequestSuccess: (state, action) => {
      return {
        ...state,
        event: action.payload,
        eventByIdRequest: false,
        eventByIdRequestSuccess: true,
      }
    },
    eventByIdRequestFailed: (state) => {
      return {
        ...state,
        eventByIdRequest: false,
        eventByIdRequestFailed: true,
      }
    },
    postEventByIdRequest: (state) => {
      return {
        ...state,
        postEventByIdRequest: true,
        postEventByIdRequestSuccess: false,
        postEventByIdRequestFailed: false,
      }
    },
    postEventByIdRequestSuccess: (state) => {
      return {
        ...state,
        postEventByIdRequest: false,
        postEventByIdRequestSuccess: true,
      }
    },
    postEventByIdRequestFailed: (state) => {
      return {
        ...state,
        postEventByIdRequest: false,
        postEventByIdRequestFailed: true,
      }
    },
    clearEvent: (state) => {
      state.event = null;
    },
    addEventRequest: (state) => {
      return {
        ...state,
        addEventRequest: true,
        addEventRequestSuccess: false,
        addEventRequestFailed: false,
      }
    },
    addEventRequestSuccess: (state) => {
      return {
        ...state,
        addEventRequest: false,
        addEventRequestSuccess: true,
      }
    },
    addEventRequestFailed: (state) => {
      return {
        ...state,
        addEventRequest: false,
        addEventRequestFailed: true,
      }
    },
    deleteEventByIdRequest: (state) => {
      return {
        ...state,
        deleteEventByIdRequest: true,
        deleteEventByIdRequestSuccess: false,
        deleteEventByIdRequestFailed: false,
      }
    },
    deleteEventByIdRequestSuccess: (state) => {
      return {
        ...state,
        deleteEventByIdRequest: false,
        deleteEventByIdRequestSuccess: true,
      }
    },
    deleteEventByIdRequestFailed: (state) => {
      return {
        ...state,
        deleteEventByIdRequest: false,
        deleteEventByIdRequestFailed: true,
      }
    },
  },
});

export const {
  setEventsState,
  setEventsList,
  eventsListRequest,
  eventsListRequestSuccess,
  eventsListRequestFailed,
  eventByIdRequest,
  eventByIdRequestSuccess,
  eventByIdRequestFailed,
  postEventByIdRequest,
  postEventByIdRequestSuccess,
  postEventByIdRequestFailed,
  clearEvent,
  addEventRequest,
  addEventRequestSuccess,
  addEventRequestFailed,
  deleteEventByIdRequest,
  deleteEventByIdRequestSuccess,
  deleteEventByIdRequestFailed,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getEventsListThunk = (initiativeId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const project = getState().state.project.value;
  const initiative = getState().initiatives.initiative;

  if (!initiative) return;
  // if (id !== project.id) return;

  dispatch(eventsListRequest());
  getRequest(
    `components/event/info/list/?id=${initiativeId}`,
    (res: AxiosResponse<{ initiative_events: Array<TEvent> }>) => {
      try {
        // console.log(res.data);
      } catch (error) {
        console.log(error);
        dispatch(eventsListRequestFailed());
      }
      dispatch(eventsListRequestSuccess(res.data.initiative_events));
    },
    () => {
      dispatch(eventsListRequestFailed());
    }
  );
};

export const getEventByIdThunk = (eventId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const project = getState().state.project.value;

  dispatch(eventByIdRequest());
  getRequest(
    `components/event/info/?id=${eventId}`,
    (res: AxiosResponse<TRisk>) => {
      try {
        console.log(res.data);
        const newInitiative = {} as any;
        // newInitiative                  
      } catch (error) {
        console.log(error);
        dispatch(eventByIdRequestFailed());
      }
      dispatch(eventByIdRequestSuccess(res.data));
    },
    () => {
      dispatch(eventByIdRequestFailed());
    }
  );
};

export const postEventByIdThunk = (eventId: number, body: any) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const project = getState().state.project.value;

  dispatch(postEventByIdRequest());
  postRequest(
    `components/event/info/list/?id=${eventId}`,
    body,
    (res: AxiosResponse) => {
      try {
        console.log(res.data);         
        dispatch(postEventByIdRequestSuccess());
      } catch (error) {
        console.log(error);
        dispatch(postEventByIdRequestFailed());
      }
    },
    () => {
      dispatch(postEventByIdRequestFailed());
    }
  );
};

export const addEventThunk = (event: any) => (dispatch: AppDispatch, getState: () => RootState) => {
  const initiative = getState().initiatives.initiative;
  const body = { ...event };

  dispatch(addEventRequest());
  postRequest(
    `components/event/create/`,
    body,
    (res: AxiosResponse) => {
      dispatch(addEventRequestSuccess());
      if (initiative) dispatch(getEventsListThunk(initiative.initiative.id))
    },
    () => {
      dispatch(addEventRequestFailed());
    }
  );
};

export const deleteEventByIdThunk = (id: any) => (dispatch: AppDispatch, getState: () => RootState) => {
  const initiative = getState().initiatives.initiative;
  const body = { ...event };

  dispatch(deleteEventByIdRequest());
  postRequest(
    `components/event/delete/?id=${id}`,
    body,
    (res: AxiosResponse) => {
      dispatch(deleteEventByIdRequestSuccess());
      if (initiative) dispatch(getEventsListThunk(initiative.initiative.id))
    },
    () => {
      dispatch(deleteEventByIdRequestFailed());
    }
  );
};
