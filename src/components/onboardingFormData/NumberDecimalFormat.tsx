import React from 'react';
import { NumericFormat } from 'react-number-format';

const NumberDecimalFormat = React.forwardRef(function NumberDecimalFormat(props: any, ref) {
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
        isNumericString
      />
    </div>
  );
});

export default NumberDecimalFormat;
