import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';
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
import { eventsApi } from './events/events-api';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistStateConfig = {
  key: 'state',
  storage,
  whitelist: ['project'],
};

const persistInitiativesConfig = {
  key: 'initiatives',
  storage,
  whitelist: ['currentInitiativeId'],
};

const rootReducer = combineReducers({
  state: persistReducer(persistStateConfig, stateReducer),
  [stateApi.reducerPath]: stateApi.reducer,
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  team: teamReducer,
  [teamApi.reducerPath]: teamApi.reducer,
  components: componentsReducer,
  initiatives: persistReducer(persistInitiativesConfig, initiativesReducer),
  [initiativesApi.reducerPath]: initiativesApi.reducer,
  risks: risksReducer,
  events: eventsReducer,
  [eventsApi.reducerPath]: eventsApi.reducer,
  coordination: coordinationReducer,
  notifications: notificationsReducer,
  graphics: graphicsReducer,
  personal: personalReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      stateApi.middleware,
      initiativesApi.middleware,
      teamApi.middleware,
      authApi.middleware,
      eventsApi.middleware,
    ]),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
