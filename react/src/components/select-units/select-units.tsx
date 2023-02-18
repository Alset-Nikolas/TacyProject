import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Checkbox, MenuItem } from '@mui/material';
import { ReactNode } from 'react';
import Pictogram from '../pictogram/pictogram';

type TSelectUnitsProps = {
  items?: Array<string>;
  value?: Array<string>;
  height?: string;
  onChange?: (event: SelectChangeEvent<Array<string>>, child: ReactNode,) => void;
  style?: { [key: string]: string | number };
  name?: string;
  id?: string;
};

const SelectMenuProps = {
  // disableScrollLock: true,
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

export default function SelectUnits({
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
      renderValue={(selected) => selected.join(', ')}
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
      {items?.map((el) => (
        <MenuItem value={el} key={el}>
          {el}
          <Checkbox checked={value.indexOf(el) > -1} />
        </MenuItem>
      ))}
    </Select>
  );
}
