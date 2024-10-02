export * from './encodeUrl'
export * from './route'
export * from './create'

import storage from './localStorage'
import cookie from './cookie'

export {
  storage,
  cookie
}

// Determine whether the object is created through genInitFromSchema
export function isCreatedByGenInitFromSchema(obj){
  return obj instanceof Object && obj.constructor.name === 'NaslTypeConstructor';
}