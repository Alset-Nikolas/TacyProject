export type TIntermediateDate = {
  [prop: string]: unknown;
  title: string;
  date: string;
};

export type TStage = {
  [prop: string]: unknown;
  name_stage: string;
  date_start: string;
  date_end: string;
  id: number;
  project: number;
};

export type TStageEdit = {
  [prop: string]: unknown;
  name_stage: string;
  date_start: string;
  date_end: string;
};

export type TMetrica = {
  [prop: string]: unknown;
  id: number;
  title: string;
  value: number;
  target_value: number;
  active: boolean;
  description: string;
  is_aggregate: boolean;
  is_percent: boolean;
  units: string;
};

export type TRole = {
  [prop: string]: unknown;
  id: number;
  name: string;
  // coverage: number;
  // project: number;
  is_approve: boolean;
  is_update: boolean;
  initiative_activate: boolean;
};

export type TRight = {
  id: number;
  name: string;
  project: number;
  flags: number;
};

export type TPropertie = {
  id: number;
  title: string;
  items: Array<{
    id: number;
    value: string;
    propertie: number;
  }>;
};

export type TPropertieEdit = {
  id: number;
  title: string;
  values: Array<{
    id: number;
    value: string;
    value_short: string;
  }>;
};

export type TProject = {
  id: number;
  name: string;
  date_start: string;
  date_end: string;
  purpose: string;
  tasks: string;
  description: string;
  intermediate_dates: Array<TIntermediateDate>;
  stages: Array<TStage>,
  metrics: Array<TMetrica>;
  properties: Array<TPropertie>;
  roles: Array<TRole>;
  rights: Array<TRight>;
};

export type TProjectForEdit = {
  id: number;
  name: string;
  date_start: string;
  date_end: string;
  purpose: string;
  tasks: string;
  description: string;
  intermediate_dates: Array<TIntermediateDate>;
  stages: Array<TStageEdit>,
  metrics: Array<TMetrica>;
  properties: Array<TPropertieEdit>;
  roles: Array<TRole>;
  rights: Array<TRight>;
};

export type TCommonProject = string |
  number |
  TIntermediateDate |
  TStage | TStageEdit |
  TMetrica |
  TPropertie | TPropertieEdit |
  TRole |
  TRight;

export type TTeamMember = {
  id: number;
  // firstName: string;
  // secondName: string;
  // surname: string;
  name: string;
  rights: Array<string>;
  role: string;
  email: string;
  phone: string;
  is_create: boolean;
  is_author: boolean;
  is_superuser: boolean;
  // unit: Array<string>;
  properties: Array<{
    id: number;
    title: string;
    // values: Array<string>;
    values: Array<{
      id: number,
      value:  string,
    }>;
  }>; 
}

export type TUserRequest = {
  id: number;
  first_name: string;
  last_name: string;
  second_name: string;
  email : string;
  phone: string;
  is_superuser: boolean;
};

export type TUser = {
  first_name: string;
  last_name: string;
  second_name: string;
  email : string;
  phone: string;
};

export type TRequestTeamListItem<T> = {
  user: T;
  // role_user: {
  //   id: number;
  //   name: string;
  // };
  // rights_user: Array<{
  //   id: number;
  //   name: string;
  // }>;
  is_create: boolean;
  is_superuser: boolean;
  is_author: boolean;
  properties: Array<{
    title: {
      id: number;
      title: string;
    },
    values: Array<{
      id: number;
      value: string;
    }>
  }>;
}

export type TFieldType = 'str' | 'num';

export type TAdditionalField = {
  id: number;
  title: string;
  type: TFieldType;
  settings_project: number;
}

export type TStatusField = {
  id: number;
  value: number;
  name: string;
  settings_project: number;
}

export type TSettings = {
  id: number;
  initiative_status: Array<TStatusField>;
  initiative_addfields: Array<TAdditionalField>;
  event_addfields: Array<TAdditionalField>;
  risks_addfields: Array<TAdditionalField>;
}

export interface IRegistryMetric {
  id: number,
  title: string,
  initiative_activate: boolean,
}

export interface IRegistryRole {
  id: number;
  project: number;
  name: string;
  is_approve: boolean;
  is_update: boolean;
  initiative_activate: boolean;
}

export interface IRegistryPropertie extends IRegistryMetric {
  is_community_activate: boolean,
  items: Array<{
    id: number,
    value: string,
    propertie: number,
  }>,
}

export type  TCommunityTableSettings = {
  properties: Array<IRegistryPropertie>;
  settings_addfields_community: Array<{
    id: number;
    title: string;
  }>;
}

export type TComponentsSettings = {
  settings: TSettings | null;
  table_registry: {
    properties: Array<IRegistryPropertie>;
    metrics: Array<IRegistryMetric>;
    roles: Array<IRegistryRole>;
  };
  table_community: TCommunityTableSettings;
  // table_community: unknown;
}

export type TInitiativeInfo = {
  id: number;
  project: number;
  author: number;
  name: string;
  current_state: string;
  reasons: string;
  description: string;
  date_start: string;
  date_end: string;
  date_registration: string;
  status: {id: number, value: number, name: string, settings_project: number} | null;
}

export type TInitiativePropertiesFields = {
  id: number;
  title: {
    id: number;
    title: string;
    initiative_activate: boolean;
  },
  values: Array<{
    id: number;
    value: string;
    propertie: number;
  }>;
}

export type TInitiativeMetricsFields = {
  metric: {
    id: number;
    title: string;
    units: string;
    initiative_activate: boolean;
  },
  value: number | string;
}

export type TInitiativeAdditionalFields = {
  id: number;
  value: string;
  title: {
    id: number;
    title: string;
    type: TFieldType;
  }
}

export type TInitiative = {
    initiative: TInitiativeInfo;
    properties_fields: Array<TInitiativePropertiesFields>;
    metric_fields: Array<TInitiativeMetricsFields>;
    addfields: Array<TInitiativeAdditionalFields>;
    roles: Array<{
      // users: Array<TUser & { id: number }>;
      role: TRole & { project: number };
      community: Array<{
        user_info: {
          user: TUser & { id: number },
          // proerties: Array<TPropertie>,
          properties: Array<{
            title: {
              id: number,
              title: string,
            },
            values: Array<{
              id: number,
              value: string,
            }>,
          }>,
          // properties: Array<{
          //   id: number;
          //   title: string;
          //   values: Array<string>;
          // }>,
        } | null,
        status: boolean | null
      }>;
    }>;
    files: Array<{
      file: string |null;
      file_name: string;
      id: number;
      initiative: number;
      title: {
        id: number;
        settings_project: number;
        title: string;
      };
    }>
}

export type TCurrentInitiative = {
  id: number;
  project: number;
  author: number;
  name: string;
  curentState: string;
  reasons: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  properties: Array<{
    id: number;
    title: string;
    value: string;
  }>;
  metrics: Array<{
    id: number;
    title: string;
    unit: string;
    value: number;
  }>;
  addfields: Array<{
    id: number;
    title: string;
    type: TFieldType;
    value: number | string;
  }>;
}

export type TUpdateComponents = {   
  project: number;
  addfields: Array<{
    title: string;
    type: TFieldType;
  }>;
  events_addfields: Array<{
    title: string;
    type: TFieldType;
  }>;
  risks_addfields: Array<{
    title: string;
    type: TFieldType;
  }>;
  status: Array<{
    name: string;
    value: number;
  }>;
  table_registry: {
    properties: Array<{
      id: number;
      title: string;
      initiative_activate: boolean;
    }>;
    metrics: Array<{
      id: number;
      title: string;
      initiative_activate: boolean;
    }>;
  };
  table_community: TCommunityTableSettings;
}

export type TRisk = {
  risk: {
    id: number;
    name: string;
    initiative: number;
  },
  addfields: Array<{
    id: number;
    value: string;
    title: {
      id: number;
      title: string;
      type: TFieldType;
      settings_project: number;
    }
  }>;
}

export type TAuthUser = {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    second_name: string;
    phone: string;
    is_superuser: boolean
  };
  user_in_project: Array<{
    id: number;
    rights_user: Array<{
      id: number;
      name: string;
      flags: {
        id: number;
        is_create: boolean;
        is_coordinate: boolean;
        project: number;
      }
    }>;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      second_name: string;
      email: string;
      phone: string;
    },
    role_user: {
      id: number;
      name: string;
      coverage: number;
      project: number;
    }
  }>;
  user_flags_in_project: {
    is_create: boolean;
    is_coordinate: boolean;
    is_watch: boolean;
  }
}

export type TEvent = {
  event: {
    id: number;
    initiative: number;
    name: string;
    date_start: string;
    date_end: string;
    ready: boolean;
  },
  event_status: string;
  addfields: Array<{
    id: number;
    value: string;
    title: {
      id: number;
      title: string;
      type: TFieldType;
      settings_project: number;
    }
  }>,
  metric_fields: Array<TInitiativeMetricsFields>;
};

export type TCoordinationHistoryItem = {
  id: number;
  coordinator: {
    id: number;
    first_name: string;
    last_name: string;
    second_name: string;
    email: string;
    phone: string;
  } | null;
  // coordinator:number;
  author_text: {
    id: number;
    first_name: string;
    last_name: string;
    second_name: string;
    email: string;
    phone: string;
  } | null;
  // author_text: number;
  date: string;
  text: string;
  action: string;
  initiative: {
    id: number;
    name: string;
    curent_state: string;
    reasons: string;
    description: string;
    date_registration: string;
    date_start: string;
    date_end: string;
    activate: boolean;
    failure: boolean;
    project: number;
    author: number;
    status: any;
  },
  status: {
    id: number;
    value: number;
    name: string;
    settings_project: number;
  } | null;
  // status: number;
}

export type TUserRights = {
  init_failure: boolean;
  user_is_author: boolean;
  user_is_superuser: boolean;
  user_now_apprwed: boolean;
  user_add_comment: boolean;
  user_rights_flag: {
    is_create: boolean;
    is_approve: boolean;
    is_update: boolean;
  }
}

export type TNotification = {
  user: number;
  date: string;
  text: string;
}

export type TBoss = {
  id: number;
  email: string;
  phone: string;
  is_superuser: boolean;
  first_name: string;
  second_name: string;
  last_name: string;
}

export type TPersonalStats = {
  user_initiatives: Array<TInitiative>;
  events: Array<{
    id: number;
    initiative: number;
    name: string;
    date_start: string;
    date_end: string;
    ready: boolean;
    get_status: string;
  }>;
  metrics_user_stat: Array<{
    title: string;
    value: number;
  }>;
}

export type TFilesSettings = {
  status: {
    id: number;
    value: number;
    name: string;
    settings_project: number;
  },
  settings_file: Array<{
    id: number;
    settings_project: number;
    title: string;
    status: number;
  }>;
};

export type TInitiativeFiles = {
  title: {
    id: number;
    settings_project: number;
    title: string;
    status: {
      id: number;
      name: string;
      value: number;
    }
  };
  file: {
    id:number;
    file: string | null;
    file_name: string;
    initiative: number;
    title: number;
  },
}
