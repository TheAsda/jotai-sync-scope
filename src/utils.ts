export const areMapsEqual = (m1: Map<any, any>, m2: Map<any, any>) => {
  return (
    m1.size === m2.size && [...m1.entries()].every(([k1, v1]) => m2.has(k1) && v1 === m2.get(k1))
  );
};
