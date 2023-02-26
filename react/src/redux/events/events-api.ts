import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import REACT_APP_BACKEND_URL from '../../consts';
import { TEvent, TInitiative } from '../../types';
import { setCurrentInitiativeId } from '../initiatives-slice';

export const eventsApi = createApi({
  reducerPath: 'eventsQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_BACKEND_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Token ${localStorage.getItem('token')}`);
      return headers;
    },
  }),
  tagTypes: ['event', 'list'],
  endpoints: (builder) => ({
    getEventsList: builder.query<Array<TEvent>, number>({
      query: (initiativeId) => `components/event/info/list/?id=${initiativeId}`,
      transformResponse: (response: { initiative_events: Array<TEvent> }) => response.initiative_events,
      //   async onQueryStarted(voidArg, { dispatch, queryFulfilled }) {
      //     try {
      //       const { data: initiativesList } = await queryFulfilled;
      //       // `onSuccess` side-effect
      //       // const savedProjectId = localStorage.getItem('project-id');
      //       // if (savedProjectId && projectsList.find((item) => item.id === parseInt(savedProjectId))) {
      //       //   dispatch(setCurrentProjectId(parseInt(savedProjectId)));
      //       // } else if (projectsList.length) {
      //       //   dispatch(setCurrentProjectId(projectsList[0].id));
      //         dispatch(setCurrentInitiativeId(initiativesList[0].initiative.id));
      //       // }
      //     } catch (err) {
      //       // `onError` side-effect
      //       console.log(err);
      //     }
      //   },      
    }),
    // getPersonalInitiativesList: builder.query<Array<TInitiative>, number>({
    //   query: (id) => `components/initiative/info/list/user/?id=${id}`,
    //   transformResponse: (response: { project_initiatives: Array<TInitiative> }) => response.project_initiatives,
    //   providesTags: () => ['list'],
    // }),
    getEventById: builder.query<TEvent, number>({
      query: (eventId) => `components/event/info/?id=${eventId}`,
      providesTags: () => ['event'],
    }),
    addEvent: builder.mutation<TEvent, any>({
      query(event) {
        return {
          url: `components/event/create/`,
          method: 'POST',
          body: event,
        }
      },
      // async onQueryStarted(initiative, { dispatch, queryFulfilled, getState }) {
      //   try {
      //     // const projectId = getState().
      //     const { data: updatedInitiative } = await queryFulfilled;
      //     console.log(updatedInitiative);
      //     console.log(initiative);
      //     const patchResult = dispatch(
      //       initiativesApi.util.updateQueryData('getInitiativesList', initiative.initiative.project, (draft) => {
      //         draft.push(updatedInitiative);
      //       })
      //     )
      //   } catch (e) {
      //     console.log(e);
      //   }
      //   },
      invalidatesTags: ['list'],
    })
  }),
});

// export const {
//   useGetEventsListQuery,
//   useGetEventByIdQuery,
//   useAddEventMutation,
// } = eventsApi;
