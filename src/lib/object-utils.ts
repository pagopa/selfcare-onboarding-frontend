export function objectIsEmpty(obj: unknown) {
  return (
    !!obj && typeof obj === 'object' && Object.keys(obj).length === 0 && obj.constructor === Object
  );
}
