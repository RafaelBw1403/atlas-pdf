


// Exporta una función genérica que selecciona campos específicos de un objeto
export const pickFields = <T, K extends keyof T>(
  obj: T,           // Objeto del cual extraer los campos
  keys: K[]         // Array de claves a seleccionar
): Pick<T, K> => {  // Retorna un tipo Pick con solo las claves seleccionadas
    // Crea un objeto vacío con el tipo resultante
    const result = {} as Pick<T, K>;
    
    // Itera sobre cada clave en el array de keys
    keys.forEach((key) => {
        // Solo asigna el valor si no es undefined
        if (obj[key] !== undefined) {
        result[key] = obj[key];
        }
    });
    
    return result;
}