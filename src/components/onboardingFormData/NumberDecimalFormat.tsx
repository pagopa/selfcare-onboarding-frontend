import NumberFormat from 'react-number-format';

export default function NumberDecimalFormat(props: any) {
  const { inputRef, onChange, ...other } = props;
  return (
    <div>
      <NumberFormat
        {...other}
        getInputRef={inputRef}
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
}
