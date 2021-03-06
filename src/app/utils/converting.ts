import {PageEditingProgress, PageProgressGroups} from '../data-types/page-editing-progress';

export function mapToObj<T2>(map: Map<string, T2>) {
  const obj = {};
  map.forEach((v, k) => obj[k] = v);
  return obj;
}

export function objIntoMap<T2>(obj, m: Map<string, T2> = new Map<string, T2>()): Map<string, T2> {
  Object.keys(obj).forEach(k => m.set(k, obj[k]));
  return m;
}

export function enumMapToObj<T1, T2>(map: Map<T1, T2>, EnumType) {
  const obj = {};
  Object.keys(EnumType).filter(t => isNaN(Number(t))).forEach(k => obj[k] = map.get(EnumType[k]))
  return obj;
}

function getEnumKeyByEnumValue(EnumType, value) {
  const keys = Object.keys(EnumType).filter(x => EnumType[x] === value);
  return keys.length > 0 ? EnumType[keys[0]] : null;
}

export function objIntoEnumMap<T1, T2>(obj, m: Map<T1, T2>, EnumType, fromString = true) {
  if (fromString) {
    Object.keys(obj).forEach(k => m.set(EnumType[k], obj[k]));
  } else {
    Object.keys(obj).forEach(k => m.set(getEnumKeyByEnumValue(EnumType, k), obj[k]));
  }
  return m;
}

export function keysOfIntEnum<EnumType>(e: any): string[] {
  return Object.keys(e).filter(key => isNaN(Number(e[key])));
}

export function valuesOfIntEnum<EnumType>(e: any): EnumType[] {
  return Object.keys(e).filter(key => !isNaN(Number(e[key]))).map(key => e[key]);
}
