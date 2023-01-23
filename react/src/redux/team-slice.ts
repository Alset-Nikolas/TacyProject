import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getTeamList, postTeamList } from '../utils/requests';
import { TPropertie, TRequestTeamListItem, TTeamMember, TUser, TUserRequest } from '../types';
import { closeLoader, openErrorModal, showLoader } from './state/state-slice';

type TState = {
  list: Array<TTeamMember>;

  teamRequest: boolean,
  teamRequestSuccess: boolean,
  teamRequestFailed: boolean,

  postTeamRequest: boolean,
  postTeamRequestSuccess: boolean,
  postTeamRequestFailed: boolean,
};

const initialState: TState = {
  list: [],

  teamRequest: false,
  teamRequestSuccess: false,
  teamRequestFailed: false,

  postTeamRequest: false,
  postTeamRequestSuccess: false,
  postTeamRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeamState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setList: (state, action) => {
      state.list = action.payload;
    },
    clearList: (state) => {
      state.list = [];
    },
    updateList: (state, action) => {
      state.list = {
        ...state.list,
        ...action.payload,
      }
    },
    addMember: (state, action) => {
      state.list = [
        ...state.list,
        action.payload,
        // {
        //   id: -1,
        //   name: '',
        //   rights: [],
        //   role: action.payload.roles[0].name,
        //   email: '',
        //   phone: '',
        //   // unit: [],
        //   properties: action.payload.properties.map((propertie: TPropertie) => {
        //     const item = {} as {
        //       id: number;
        //       title: string;
        //       values: Array<string>;
        //     };

        //     item.id = propertie.id;
        //     item.title = propertie.title;
        //     item.values = [];
        //     return item;
        //   }),
        // },
      ];
    },
    teamRequest: (state) => {
      return {
        ...state,
        teamRequest: true,
        teamRequestSuccess: false,
        teamRequestFailed: false,
      }
    },
    teamRequestSuccess: (state, action) => {
      return {
        ...state,
        list: action.payload,
        teamRequest: false,
        teamRequestSuccess: true,
      }
    },
    teamRequestFailed: (state) => {
      return {
        ...state,
        teamRequest: false,
        teamRequestFailed: true,
      }
    },
    postTeamRequest: (state) => {
      return {
        ...state,
        postTeamRequest: true,
        postTeamRequestSuccess: false,
        postTeamRequestFailed: false,
      }
    },
    postTeamRequestSuccess: (state) => {
      return {
        ...state,
        postTeamRequest: false,
        postTeamRequestSuccess: true,
      }
    },
    postTeamRequestFailed: (state) => {
      return {
        ...state,
        postTeamRequest: false,
        postTeamRequestFailed: true,
      }
    },
    addNotExistingPropertie: (state, action) => {
      if (!state.list[action.payload.index]) return state;
      state.list[action.payload.index].properties = [
        ...state.list[action.payload.index].properties,
        action.payload.propertie,
      ];
    },
  },
});

export const {
  setTeamState,
  setList,
  clearList,
  updateList,
  teamRequest,
  teamRequestSuccess,
  teamRequestFailed,
  addMember,
  postTeamRequest,
  postTeamRequestSuccess,
  postTeamRequestFailed,
  addNotExistingPropertie,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getTeamThunk = (id: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const project = getState().state.project.value;

  if (!project) return;
  if (id !== project?.id) return;

  dispatch(teamRequest());
  dispatch(showLoader());
  getTeamList(
    id,
    (res: AxiosResponse<{ community_info: Array<TRequestTeamListItem<TUserRequest>> }>) => {
      const teamList = res.data.community_info.map((resItem) => {
        try {
          const member = {} as TTeamMember;
          member.id = resItem.user.id;
          member.name = `${resItem.user.last_name} ${resItem.user.first_name} ${resItem.user.second_name}`;
          member.email = resItem.user.email;
          member.phone = resItem.user.phone;
          // member.role = resItem.role_user.name;
          // member.rights = resItem.rights_user.map((right) => right.name);
          member.properties = resItem.properties.map((resPropertie) => {
            const projectPropertie = project.properties.find((el) => el.id === resPropertie.title.id);
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
        } catch (error) {
          console.log(error);
        }
      });
      dispatch(teamRequestSuccess(teamList));
    dispatch(closeLoader());
    },
    () => {
      dispatch(teamRequestFailed());
      dispatch(closeLoader());
    }
  );
};

export const postTeamThunk = (id: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const project = getState().state.project.value;
  const membersList = getState().team.list;
  const body = { community_info: [] } as { community_info: Array<TRequestTeamListItem<TUser>>};

  body.community_info = membersList.map((member) => {
    const listItem = {} as TRequestTeamListItem<TUser>;

    const name = member.name.split(' ');
    listItem.user = {
      last_name: name[0] ? name[0] : '',
      first_name: name[1] ? name[1] : '',
      second_name: name[2] ? name[2] : '',
      email: member.email,
      phone: member.phone,
    };
    // listItem.role_user = {
    //   id: project!.roles.find((role) => role.name === member.role)!.id,
    //   name: member.role,
    // };
    // listItem.rights_user = [];
    // member.rights.forEach((right) => {
    //   listItem.rights_user.push({
    //     id: project!.rights.find((el) => el.name === right)!.id,
    //     name: right,
    //   });
    // });
    listItem.properties = [];
    member.properties.forEach((el, index) => {
      listItem.properties.push({
        title: {
          id: project!.properties.find((propertie) => propertie.title === el.title)!.id,
          title: el.title,
        },
        // values: el.values.map((value) => {
        //   return {
        //     id: project!.properties[index].items.find((item) => item.value === value)!.id,
        //     value,
        //   };
        // }),
        values: el.values,
      });
    });

    return listItem;
  })
  dispatch(postTeamRequest());
  dispatch(showLoader());
  postTeamList(
    id,
    body,
    (res: AxiosResponse) => {
      dispatch(postTeamRequestSuccess());
      dispatch(closeLoader());
      dispatch(openErrorModal('Данные сохранены'));
    },
    () => {
      dispatch(postTeamRequestFailed());
      dispatch(closeLoader());
      dispatch(openErrorModal('Ошибка при сохранении'));
    }
  );
};
