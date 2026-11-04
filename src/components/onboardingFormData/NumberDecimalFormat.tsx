import React from 'react';
import { InputBaseComponentProps } from '@mui/material';
import { NumericFormat } from 'react-number-format';

// MUI passes InputBaseComponentProps to inputComponent and expects a change event-like object back
type Props = Omit<InputBaseComponentProps, 'onChange'> & {
  onChange: (event: { target: { name?: string; value: number } }) => void;
};

const NumberDecimalFormat = React.forwardRef<HTMLInputElement, Props>(
  function NumberDecimalFormat(props, ref) {
    const { onChange, ...other } = props;
    return (
      <div style={{ width: '90%' }}>
        <NumericFormat
          {...other}
          getInputRef={ref}
          onValueChange={(values) => {
            onChange({
              target: {
                name: props.name,
                value: parseFloat(values.value),
              },
            });
          }}
          decimalSeparator=","
          thousandSeparator="."
          prefix="€ "
          decimalScale={2}
          fixedDecimalScale={false}
        />
      </div>
    );
  }
);

export default NumberDecimalFormat;
