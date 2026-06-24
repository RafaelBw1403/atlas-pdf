// utils/templateProcessor.ts

/**
 * Evalúa una expresión JavaScript en el contexto de los datos proporcionados.
 * @param plantilla - La plantilla con expresiones entre llaves {}.
 * @param datos - Los datos que se usarán para evaluar las expresiones.
 * @returns La plantilla con las expresiones evaluadas.
 */
export function evaluarPlantilla(plantilla: string, datos: any): string {
    // Expresión regular para encontrar {expresion}
    const regex = /{([^}]+)}/g;

    console.log("DATOS  : ", datos)
  
    // Reemplazar cada coincidencia con el valor correspondiente
    return plantilla.replace(regex, (match, expresion) => {

        console.log("expresion : ", expresion)
      try {
        // Evaluar la expresión en el contexto de los datos
        const valor = new Function("data", `return ${expresion}`)(datos);
  
        // Si el valor es un arreglo, unirlo en una cadena
        if (Array.isArray(valor)) {
          return valor.join("");
        }
  
        // Si el valor es un objeto, convertirlo a cadena
        if (typeof valor === "object" && valor !== null) {
            console.log("El json que regresa :_ ", JSON.stringify(valor))
          return JSON.stringify(valor);
        }
  
        // Devolver el valor como cadena
        return String(valor);
      } catch (error) {
        console.error(`Error al evaluar la expresión: ${expresion}`, error);
        return "N/A";
      }
    });
  }
  
  /**
   * Procesa una plantilla HTML que contiene placeholders del tipo ${nombreDelArreglo => (plantilla)}.
   * @param html - El HTML con placeholders.
   * @param data - Los datos que se usarán para reemplazar los placeholders.
   * @returns El HTML procesado.
   */
  export function procesarHTML(html: string, data: any): string {
    const regex = /\${(\w+)\s*=>\s*\(([\s\S]*?)\)}/g;
  
    const htmlProcesado = html.replace(regex, (match, nombreArreglo, plantilla) => {
      console.log("Match:", match); // Depuración
      console.log("Nombre del arreglo:", nombreArreglo); // Depuración
      console.log("Plantilla:", plantilla); // Depuración
  
      const arreglo = obtenerValor(data, nombreArreglo);
      console.log("Datos:", data); // Depuración
        console.log("Nombre del arreglo:", nombreArreglo); // Depuración
        console.log("Arreglo encontrado:", arreglo); // Depuración
      if (Array.isArray(arreglo)) {
        console.log("EVALUAR PLANTILLA ARREGLO")
        return arreglo.map((item) => evaluarPlantilla(plantilla, item)).join("");
      } else if (typeof arreglo === "object" && arreglo !== null) {
        console.log("EVALUAR PLANTILLA SIN ARREGLO")
        return evaluarPlantilla(plantilla, arreglo);
      }
      return match; // Si no se encuentra, dejar el placeholder tal cual
    });
  
    return htmlProcesado;
  }
  
  /**
   * Obtiene el valor de una propiedad anidada en un objeto.
   * @param obj - El objeto del cual obtener el valor.
   * @param propiedad - La propiedad en formato "anidado" (por ejemplo, "direccion.ciudad").
   * @returns El valor de la propiedad o undefined si no existe.
   */
  function obtenerValor(obj: any, propiedad: string): any {
    const partes = propiedad.split(".");
  
    console.log("OBJ:", obj); // Depuración
    console.log("PROPIEDAD:", propiedad); // Depuración
    console.log("PARTES:", partes); // Depuración
  
    return partes.reduce((acc, key) => {
      console.log("Acc:", acc); // Depuración
      console.log("Key:", key); // Depuración
  
      if (acc && typeof acc === "object" && acc.hasOwnProperty(key)) {
        console.log("Valor encontrado:", acc[key]); // Depuración
        return acc[key];
      }
      return undefined; // Si no se encuentra, devolver undefined
    }, obj);
  }