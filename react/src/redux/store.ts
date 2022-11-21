import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import stateReducer from '../redux/state-slice';
import authReducer from '../redux/auth-slice';
import teamReducer from '../redux/team-slice';
import componentsReducer from '../redux/components-slice';
import initiativesReducer from '../redux/initiatives-slice';
import risksReducer from '../redux/risks-slice';
import eventsReducer from '../redux/evens-slice';
import coordinationReducer from '../redux/coordination-slice';
import notificationsReducer from '../redux/notifications-slice';
import graphicsReducer from '../redux/graphics-slice';

export const store = configureStore({
  reducer: {
    state: stateReducer,
    auth: authReducer,
    team: teamReducer,
    components: componentsReducer,
    initiatives: initiativesReducer,
    risks: risksReducer,
    events: eventsReducer,
    coordination: coordinationReducer,
    notifications: notificationsReducer,
    graphics: graphicsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
