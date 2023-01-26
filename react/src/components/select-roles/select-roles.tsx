import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Checkbox, MenuItem } from '@mui/material';
import { ReactNode } from 'react';
import { TTeamMember } from '../../types';

type TSelectUnitsProps = {
  items?: Array<TTeamMember>;
  value?: Array<string>;
  height?: string;
  onChange?: (event: SelectChangeEvent<Array<string>>, child: ReactNode,) => void;
  style?: { [key: string]: string | number };
  name?: string;
  id?: string;
};

const SelectMenuProps = {
  disableScrollLock: true,
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

export default function SelectRoles({
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
          const parsedItem = JSON.parse(item) as {id: number, name: string};
          const splitedName = parsedItem.name.split(' ');
          return `${splitedName[0]} ${splitedName[1]}. ${splitedName[2]}.`;
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
    >
      {items?.map((el) => {
        const splitedName = el.name.split(' ');
        const isChecked = () => {
          const foundItem = value.find((item) => {
            const parsedValue = JSON.parse(item) as {id: number, name: string};
            return parsedValue.id === el.id;
          });
          return foundItem ? true : false;
        }
        return (
          <MenuItem value={JSON.stringify({id: el.id, name: el.name})} key={el.id}>
            <Checkbox
              checked={isChecked()}
            />
            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              <div>
                {`${splitedName[0]} ${splitedName[1]}.  ${splitedName[2]}.`}
              </div>
              {el.properties.map((property) => (
                <div
                  key={property.id}
                >
                  {property.values.map((el) => el.value).join(', ')}
                </div>
              ))}
            </div>
          </MenuItem>
        );
      })}
    </Select>
  );
}
