import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../consts';
import { TProject, TRequestTeamListItem, TTeamMember, TUserRequest } from '../../types';
import { stateApi } from '../state/state-api';
import { openErrorModal, openMessageModal } from '../state/state-slice';

export const teamApi = createApi({
  reducerPath: 'teamQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_BACKEND_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Token ${localStorage.getItem('token')}`);
      return headers;
    },
  }),
  tagTypes: ['Team'],
  endpoints: (builder) => ({
    getTeamList: builder.query<Array<TTeamMember>, { id: number, project: TProject | null }>({
      query: ({ id }) => `/project/community/?id=${id}`,
      transformResponse: (response: { community_info: Array<TRequestTeamListItem<TUserRequest>> }, meta, { project }) => {
        const teamList = response.community_info.map((resItem) => {
            
          const member = {} as TTeamMember;
          member.id = resItem.user.id;
          member.name = `${resItem.user.last_name} ${resItem.user.first_name} ${resItem.user.second_name}`;
          member.email = resItem.user.email;
          member.phone = resItem.user.phone;
          member.is_create = resItem.is_create;
          // member.role = resItem.role_user.name;
          // member.rights = resItem.rights_user.map((right) => right.name);
          member.properties = resItem.properties.map((resPropertie) => {
            const projectPropertie = project?.properties.find((el) => el.id === resPropertie.title.id);
            if (!projectPropertie) throw new Error('Propertie doesn\'t exist');
            const propertieValuesArray = resPropertie.values.map((value) => projectPropertie.items.find((el) => el.id === value.id)!.value);
            if (!propertieValuesArray.indexOf('undefined')) throw new Error('Value doesn\'t exist');
            
            return {
              id: projectPropertie ? projectPropertie.id : -1,
              title: projectPropertie ? projectPropertie.title : 'No propertie',
              // values: propertieValuesArray,
              values: resPropertie.values,
            };
          });

          return member;
        });

        return teamList;
      },
      providesTags: () => ['Team'],
    }),
    postTeamList: builder.mutation<any, { projectId: number, body: any }>({
      query({ projectId, body}) {
        return {
          url: `/project/community/?id=${projectId}`,
          method: 'POST',
          body: { community_info: body },
        }
      },
      invalidatesTags: ['Team'],
      async onQueryStarted({ projectId }, { dispatch, queryFulfilled, getState }) {
        // const { data: project } = stateApi.useGetProjectInfoQuery(projectId);
        const state = getState();
        try {
          const { data } = await queryFulfilled;
          // const patchResult = dispatch(
          //   teamApi.util.updateQueryData('getTeamList', { id: projectId, project: null }, (draft) => {
          //     Object.assign(draft, updatedTeamList);
          //   })
          // )
          if (data.code === 200) {
            dispatch(openMessageModal(data.msg));
          }
        } catch (e) {
          console.log(e);
          dispatch(openErrorModal('Произошла ошибка'));
        }
      },
    }),
  }),
});

// export const {
  // useGetTeamListQuery,
  // usePostTeamListMutation,
// } = teamApi;
