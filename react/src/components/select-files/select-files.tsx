import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Checkbox, MenuItem } from '@mui/material';
import { ReactNode } from 'react';
import { TTeamMember } from '../../types';
import Pictogram from '../pictogram/pictogram';

type TSelectUnitsProps = {
  items?: Array<{id: number, title: string}>;
  value?: Array<string>;
  height?: string;
  onChange?: (event: SelectChangeEvent<Array<string>>, child: ReactNode,) => void;
  style?: { [key: string]: string | number };
  name?: string;
  id?: string;
};

const SelectMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: 0,
      background: '#FFFFFF',
      border: '1px solid #504F4F',
      padding: 0,
      margin: 0,
    },
  },
}

export default function SelectFiles({
  items,
  value,
  onChange,
  height,
  style,
  name,
  id,
}: TSelectUnitsProps) {
  // console.log(value);
  const SelectStyle = style ? style : {
    minWidth: '223px',
    height: height ? height : '32px',
    border: '1px solid #504F4F',
    borderRadius: 0,
    paddingBottom: 0,
  };

  if (!value) return null;
  return (
    <Select
      value={value}
      sx={SelectStyle}
      MenuProps={SelectMenuProps}
      multiple={true}
      renderValue={(selected) => {
        const renderArray = selected.map((item) => {
          const parsedItem = JSON.parse(item) as {id: number, title: string};
          return parsedItem.title;
        })
        return renderArray.join(', ')
      }}
      SelectDisplayProps={{
        style: {
          padding: '0 16px',
        },
      }}
      onChange={onChange}
      name={name}
      id={id}
      IconComponent={(props) => (
        <div
          {...props}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 15,
            height: 15,
          }}
        >
          <Pictogram
            type="selector-arrow"
          />
        </div>
      )}
    >
      {items?.map((el) => {
        const isChecked = () => {
          const foundItem = value.find((item) => {
            const parsedValue = JSON.parse(item) as {id: number, title: string};
            return parsedValue.id === el.id;
          });
          return foundItem ? true : false;
        }
        return (
          <MenuItem value={JSON.stringify({id: el.id, title: el.title})} key={el.id}>
            <Checkbox
              checked={isChecked()}
            />
            {el.title}
          </MenuItem>
        );
      })}
    </Select>
  );
}
