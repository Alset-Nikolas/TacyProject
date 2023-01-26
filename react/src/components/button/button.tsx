import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { MouseEventHandler } from 'react';

type TCustomizedButtonProps = {
  value: string;
  color?: 'green' | 'blue' | 'transparent';
  noBorder?: boolean;
  type?: 'button' | 'submit'; 
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

const BlueButton = styled(Button)({
  height: '32px',
  background: 'rgb(23, 89, 140)',
  borderRadius: '30px',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '28px',
  color: '#FFFFFF',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgb(23, 89, 190)',
    borderColor: 'rgb(23, 89, 190)',
  },
  '&:active': {
    backgroundColor: 'rgb(23, 89, 190)',
    borderColor: 'rgb(23, 89, 190)',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem rgba(23, 89, 190, 0.5)',
  },
});

const GreenButton = styled(BlueButton)({
  background: 'rgb(141, 176, 64)',
  '&:hover': {
    backgroundColor: 'rgb(141, 190, 64)',
    borderColor: 'rgb(141, 190, 64)',
  },
  '&:active': {
    backgroundColor: 'rgb(141, 190, 64)',
    borderColor: 'rgb(141, 190, 64)',
  },
  '&:focus': {
    boxShadow: '0 0 0 0.2rem rgba(141, 190, 64, 0.5)',
  },
});

const TransparentButton = styled(BlueButton)({
  background: 'rgb(255, 255, 255)',
  color: 'rgb(23, 89, 140)',
  border: '1px solid rgb(23, 89, 140)',
  '&:hover': {
    background: 'rgb(255, 255, 255)',
    color: 'rgb(23, 89, 190)',
    borderColor: 'rgb(23, 89, 190)',
  },
  '&:active': {
    borderColor: 'rgb(23, 89, 190)',
  },
});

const TransparentButtonNoBorder = styled(TransparentButton)({
  border: 'none',
  color: '#504F4F',
  '&:hover': {
    color: '#504F4F',
  },
});

export default function CustomizedButton({
  value,
  className='',
  color='green',
  noBorder=false,
  type='button',
  onClick,
  disabled,
}: TCustomizedButtonProps) {
  if (color === 'blue') {
    return (
      <BlueButton
        className={className}
        variant="contained"
        disableRipple
        onClick={onClick}
        type={type}
        disabled={disabled}
      >
        {value}
      </BlueButton>
    );
  }
  if (color === 'transparent') {
    if (!noBorder) {
      return (
        <TransparentButton
          className={className}
          variant="contained"
          disableRipple
          onClick={onClick}
          type={type}
          disabled={disabled}
        >
          {value}
        </TransparentButton>
      );
    } else {
      return (
        <TransparentButtonNoBorder
          className={className}
          variant="contained"
          disableRipple
          onClick={onClick}
          type={type}
        >
          {value}
        </TransparentButtonNoBorder>
      );
    }
  }
  return  (
    <GreenButton
      className={className}
      variant="contained"
      disableRipple
      onClick={onClick}
      type={type}
    >
      {value}
    </GreenButton>
  );
}
