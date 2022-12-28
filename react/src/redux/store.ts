import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import stateReducer from './state/state-slice';
import authReducer from '../redux/auth-slice';
import teamReducer from '../redux/team-slice';
import componentsReducer from '../redux/components-slice';
import initiativesReducer from '../redux/initiatives-slice';
import risksReducer from '../redux/risks-slice';
import eventsReducer from '../redux/evens-slice';
import coordinationReducer from '../redux/coordination-slice';
import notificationsReducer from '../redux/notifications-slice';
import graphicsReducer from '../redux/graphics-slice';
import personalReducer from '../redux/personal-slice';
import { stateApi } from './state/state-api';
import { initiativesApi } from './initiatives/initiatives-api';
import { teamApi } from './team/team-api';
import { authApi } from './auth/auth-api';

export const store = configureStore({
  reducer: {
    state: stateReducer,
    [stateApi.reducerPath]: stateApi.reducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    team: teamReducer,
    [teamApi.reducerPath]: teamApi.reducer,
    components: componentsReducer,
    initiatives: initiativesReducer,
    [initiativesApi.reducerPath]: initiativesApi.reducer,
    risks: risksReducer,
    events: eventsReducer,
    coordination: coordinationReducer,
    notifications: notificationsReducer,
    graphics: graphicsReducer,
    personal: personalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      stateApi.middleware,
      initiativesApi.middleware,
      teamApi.middleware,
      authApi.middleware,
    ]),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
