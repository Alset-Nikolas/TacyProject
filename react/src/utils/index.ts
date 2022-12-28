import { ChangeEvent } from 'react';
import { updateSettings } from '../redux/components-slice';
import { updateProjectForEdit } from "../redux/state/state-slice";
import { AppDispatch } from "../redux/store";
import {
  TCommonProject,
  TIntermediateDate,
  TMetrica,
  TProject,
  TProjectForEdit,
  TPropertie,
  TPropertieEdit,
  TStage,
  TStageEdit,
  TSettings,
  TAdditionalField,
  TStatusField
} from "../types";

export const handleInputChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  project: TProject | TProjectForEdit,
  dispatch: AppDispatch,
) => {
  if (Object.prototype.hasOwnProperty.call(project, e.target.name)) {
    dispatch(updateProjectForEdit({
      [e.target.name]: e.target.name.match('date') ? e.target.value.replaceAll('.', '-') : e.target.value,
    }));
  }
};

type KeysOfUnion<T> = T extends T ? keyof T: never;

export const handlePropertieInutChange = (
  index: number,
  project: TProjectForEdit,
  propType: keyof TProjectForEdit,
  key: KeysOfUnion<TMetrica | TIntermediateDate | TStage>, 
  value: string,
  dispatch: AppDispatch,
  propertieIndex?: number,
) => {
  if (propType === 'metrics' || propType === 'intermediate_dates' || propType === 'stages') {
    const propsArray = [...project[propType]];

    const propsArrayElement = {...propsArray[index]};

    propsArrayElement[key] = (key as string).match('date') ? value.replaceAll('.', '-') : value;
    propsArray[index] = propsArrayElement;

    dispatch(updateProjectForEdit({
      [propType]: [
        ...propsArray,
      ],
    }));
  }
  if (propType === 'properties') {
    const propsArray = [...project[propType]];
    const propsArrayElement = {...propsArray[index]};

    if (key === 'title') {
      propsArrayElement[key] = value;
    } else if (key === 'values' && typeof propertieIndex === 'number') {
      const propVluesArray = [...propsArrayElement[key]];
      const currentPropertie = { ...propVluesArray[propertieIndex] };
      currentPropertie.value = value;
      propVluesArray[propertieIndex] = currentPropertie;
      propsArrayElement[key] = propVluesArray;
    }

    propsArray[index] = propsArrayElement;

    dispatch(updateProjectForEdit({
      [propType]: [
        ...propsArray,
      ],
    }));
  }
};

export const addPropertie = (
  newProjectState: TProjectForEdit,
  key: keyof TProject,
  dispatch: AppDispatch,
) => {
  let newPropertyElement: TMetrica | TIntermediateDate | TStageEdit | TPropertieEdit | undefined ;

  switch (key) {
    case 'metrics':
      newPropertyElement = {
        id:-1,
        title: '',
        value: 0,
        target_value: 0,
        units: 'бм',
        active: false,
      };
      break;
    case 'intermediate_dates':
      newPropertyElement = {
        title: '',
        date: '',
      };
      break;
    case 'stages':
      newPropertyElement = {
        name_stage: '',
        date_start: '',
        date_end: '',
      };
      break;
    case 'properties':
      newPropertyElement = {
        id: -1,
        title: '',
        values: [
          {
            id: -1,
            value: '',
          },
        ],
      };
      break;
  }

  if (newPropertyElement &&
    newProjectState &&
    (key === 'metrics' ||
      key === 'intermediate_dates' ||
      key === 'stages' ||
      key === 'properties'
  )) {
    dispatch(updateProjectForEdit({
      [key]: [
        ...newProjectState[key],
        newPropertyElement,
      ],
    }));
  }
}

export const removePropertie = (
  removeIndex: number,
  newProjectState: TProject | TProjectForEdit,
  key: keyof TProject,
  dispatch: AppDispatch
) => {

  if (newProjectState && (key === 'metrics' || key === 'intermediate_dates' || key === 'stages' || key === 'properties')) {
    const propsArray = [...newProjectState[key]];
    propsArray.splice(removeIndex, 1);
    dispatch(updateProjectForEdit({
      [key]: propsArray,
    }));
  }
}

export const addPropertieValue = (
  projectForEditState: TProjectForEdit,
  // propTitle: string,
  indexOfPropertie: number,
  dispatch: AppDispatch,
) => {
  const propsArray = [...projectForEditState.properties];
  const propertie = { ...propsArray[indexOfPropertie] } as TPropertieEdit;
  // const indexOfPropertie = propsArray.findIndex((propertie) => propertie.title === propTitle);

  if (!propertie || typeof indexOfPropertie === 'undefined') return;

  propertie.values = [ ...propertie.values, { id: -1, value: ''} ];

  propsArray[indexOfPropertie] = propertie;

  dispatch(updateProjectForEdit({
    properties: [
      ...propsArray,
    ],
  }));
};

export const removePropertieValue = (
  projectForEditState: TProjectForEdit,
  propTitle: string,
  index: number,
  dispatch: AppDispatch,
) => {
  const propsArray = [...projectForEditState.properties];
  const propertie = { ...propsArray.find((propertie) => propertie.title === propTitle) } as TPropertieEdit;
  const indexOfPropertie = propsArray.findIndex((propertie) => propertie.title === propTitle);

  if (!propertie.title || typeof indexOfPropertie === 'undefined') return;

  const values = [ ...propertie.values ];
  values.splice(index, 1)
  propertie.values = values;

  propsArray[indexOfPropertie] = propertie;

  dispatch(updateProjectForEdit({
    properties: [
      ...propsArray,
    ],
  }));
}

export function isPropertie(item: TCommonProject): item is TPropertie {
  return (item as TPropertie).items !== undefined;
}

export function isPropertieEdit(item: TCommonProject): item is TPropertieEdit {
  return (item as TPropertieEdit).values !== undefined;
}

export function isStage(item: TCommonProject): item is TStage {
  return (item as TStage).name_stage !== undefined;
}

export function isIntermediateDate(item: TCommonProject): item is TIntermediateDate {
  return (item as TIntermediateDate).date !== undefined;
}

export function isMetric(item: TCommonProject): item is TMetrica {
  return (item as TMetrica).target_value !== undefined;
}

export function makeProjectFordit(project: TProject): TProjectForEdit {
  const projectForEdit: { [prop: string]: any } = {};

  for (const [key, value] of Object.entries(project)) {
    if (key === 'properties' && value instanceof Array) {
      projectForEdit[key] = [];
      // if (value.length === 0) {
      //   projectForEdit[key].push({
      //     title: '',
      //     values: [],
      //   });
      // } else {
        value.forEach((el) => {
          if (isPropertie(el)) {
            projectForEdit[key].push({
              title: el.title,
              // values: el.items.map((el) => el.value),
              values: el.items,
            });
          }
        });
      // }
    } else if (key === 'stages' && value instanceof Array) {
      projectForEdit[key] = [];
      if (value.length === 0) {
        // projectForEdit[key].push({
        //   name_stage: '',
        //   date_start: '',
        //   date_end: '',
        // });
      } else { 
        value.forEach((el) => {
          if (isStage(el)) {
            projectForEdit[key].push({
              name_stage: el.name_stage,
              date_start: el.date_start,
              date_end: el.date_end,
            });
          }
        });
      }
    } else if (key === 'intermediate_dates' && value instanceof Array) {
      projectForEdit[key] = [];
      if (value.length === 0) {
        // projectForEdit[key].push({
        //   title: '',
        //   date: '',
        // });
      } else { 
        value.forEach((el) => {
          if (isIntermediateDate(el)) {
            projectForEdit[key].push({
              title: el.title,
              date: el.date,
            });
          }
        });
      }
    } else if (key === 'metrics' && value instanceof Array) {
      projectForEdit[key] = [];
      if (value.length === 0) {
        projectForEdit[key].push({
          title: '',
          value: 0,
          target_value: 0,
          units: 'бм ',
          active: false,
        });
      } else { 
        value.forEach((el) => {
          if (isMetric(el)) {
            projectForEdit[key].push({
              title: el.title,
              value: el.value,
              target_value: el.target_value,
              units: el.units,
              active: el.active,
            });
          }
        });
      }
    } else {
      projectForEdit[key] = value;
    }
  }

  return projectForEdit as TProjectForEdit;
}

export function addComponentItem(
  itemsArray: Array<TAdditionalField | {
    id: number;
    value: number;
    name: string;
    settings_project: number;
  }>,
  key: keyof TSettings,
  dispatch: AppDispatch,
) {
  let newItem;
  if (key === 'initiative_addfields' || key === 'event_addfields' || key === 'risks_addfields') {
    newItem = {
      id: -1,
      title: '',
      type: "str",
      settings_project: -1,
    };
  }
  if (key === 'initiative_status') {
    newItem = {
      id: -1,
      value: itemsArray.length - 2,
      name: '',
      settings_project: -1,
    };
  }

  dispatch(updateSettings({
    [key]: [
      ...itemsArray,
      newItem,
    ],
  }));
}

export function removeComponentItem(
  index: number,
  itemsArray: Array<TAdditionalField | {
    id: number;
    value: number;
    name: string;
    settings_project: number;
  }>,
  key: keyof TSettings,
  dispatch: AppDispatch,
) {
  let newItemsArray = [...itemsArray];
  newItemsArray.splice(index, 1);

  if (key === 'initiative_status') {
    newItemsArray = newItemsArray.map((el, index) => {
      const newEl = { ...el } as {
        id: number;
        value: number;
        name: string;
        settings_project: number;
      };
      
      newEl.value = index - 2;
      if (newEl.name === 'Согласовано') newEl.value = -1;
      if (newEl.name === 'Отозвано') newEl.value = -2;
      
      return newEl;
    });
  }

  dispatch(updateSettings({
    [key]: newItemsArray,
  }));
}

export function handleComponentInputChange(
  index: number,
  value: string,
  itemsArray: Array<TAdditionalField | TStatusField>,
  key: keyof TSettings,
  dispatch: AppDispatch,
) {
  const newItemsArray = [...itemsArray];
  const newItem = { ...newItemsArray[index] };

  if (key === 'initiative_addfields' ||
    key === 'event_addfields' ||
    key === 'risks_addfields'
  ) {
    (newItem as TAdditionalField).title  = value;
  }
  if (key === 'initiative_status') {
    (newItem as TStatusField).name = value;
  }

  newItemsArray[index] = newItem;

  dispatch(updateSettings({
    [key]: newItemsArray,
  }));
}

export function parseRequestError(response: any): any {
  const errorEntries = Object.entries(response);
  const errorMessages = errorEntries.map((error: [string, any]) => {
    if (typeof error[1] === 'string') return `${error[0]}: ${error[1]}`;
    if (error[1] instanceof Array && typeof error[1][0] === 'string') {
      return `${error[0]}: ${error[1].join(', ')}`;
    }
    if (typeof error[1] === 'object') {
      // const currentErrorEntries = Object.entries(error[1][0]);
      // const title = currentErrorEntries[0][0];
      // const description = currentErrorEntries[0][1];
      // return `${error[0]} ${title}: ${description}`;
      return parseRequestError(error[1]);
    }
    return 'unknown error';
  });

  return errorMessages;
}
