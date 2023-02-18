// import { styled } from '@mui/material/styles';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import { ReactNode } from 'react';
import Pictogram from '../pictogram/pictogram';

type TCustomizedSelectProps = {
  items?: Array<any>;
  value?: string;
  height?: string;
  onChange?: (event: SelectChangeEvent<string>, child: ReactNode,) => void;
  style?: { [key: string]: string | number };
  name?: string;
  id?: string,
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

export default function CustomizedSelect({
  items,
  value,
  onChange,
  height,
  style,
  name,
  id,
}: TCustomizedSelectProps) {
  // console.log(value);
  const SelectStyle = style ? style : {
    minWidth: '223px',
    maxWidth: 300,
    height: height ? height : '32px',
    border: '1px solid #504F4F',
    borderRadius: 0,
    paddingBottom: 0,
  };

  if (value === undefined && items?.length) value = items[0];
  return (
    <Select
      value={value}
      sx={SelectStyle}
      MenuProps={SelectMenuProps}
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
      {items?.map((el) => <MenuItem value={el} key={el}>{el}</MenuItem>)}
    </Select>
  );
}
