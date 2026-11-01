# Cómo analiza Flaw las dependencias

## Resumen

Flaw comprueba si las dependencias que se han registrado para los proyectos coinciden con avisos de seguridad conocidos en [OSV (Open Source Vulnerabilities)](https://osv.dev/). El usuario inicia la consulta desde el botón **Analizar** del dashboard. El backend envía a OSV el ecosistema, el nombre exacto del paquete y la versión exacta registrada; después transforma y guarda las coincidencias para presentarlas como alertas.

Esto es un análisis de **dependencias**, no un análisis del código fuente. Flaw no descarga ni compila los repositorios, no inspecciona archivos, no ejecuta el software y no usa IA para decidir si el código es vulnerable.

## Qué información analiza

Cada dependencia vigilada pertenece a un proyecto y tiene estos datos:

| Dato | Para qué se utiliza |
| --- | --- |
| Ecosistema | Seleccionar el formato de paquete que OSV entiende. |
| Nombre del paquete | Identificar el paquete concreto; por ejemplo, `org.apache.logging.log4j:log4j-core`. |
| Versión | Consultar avisos que afecten a esa versión exacta. |
| Proyecto | Asociar el resultado con el proyecto y mostrar dónde se encontró la dependencia. |

Flaw reconoce los ecosistemas siguientes y los convierte al identificador que espera OSV:

| Ecosistema en Flaw | Ecosistema enviado a OSV |
| --- | --- |
| npm | `npm` |
| Maven | `Maven` |
| PyPI | `PyPI` |
| Go | `Go` |
| Cargo | `crates.io` |

Los datos deben registrarse en Flaw. Actualmente no se importan automáticamente `package.json`, `pom.xml`, archivos de bloqueo, SBOM ni otros manifiestos. Tampoco se calculan las dependencias transitivas: se consultan únicamente los paquetes y versiones añadidos directamente al inventario.

## Flujo completo

### 1. El usuario inicia un análisis

El botón **Analizar** ejecuta `POST /api/analysis/scan`. La interfaz indica que el análisis está en curso y, cuando termina, vuelve a cargar el estado, las alertas y las vulnerabilidades. Si la petición falla, muestra el error recibido en vez de comunicar un resultado satisfactorio.

El análisis no se ejecuta en cada carga de página ni de forma programada. El usuario debe iniciarlo después de registrar dependencias y volver a ejecutarlo cuando quiera consultar de nuevo OSV.

### 2. El backend toma una instantánea del inventario

El backend reúne las dependencias asociadas a todos los proyectos guardados. La cantidad comunicada como `dependencyCount` corresponde a las entradas registradas, aunque algunas entradas repetidas puedan compartir una misma consulta externa.

Antes de consultar OSV, crea claves con la combinación:

```text
ecosistema + nombre del paquete + versión
```

Si la misma combinación está registrada más de una vez —por ejemplo, en proyectos distintos— Flaw reutiliza la respuesta de OSV para evitar consultas duplicadas. Al convertir la respuesta en hallazgos, vuelve a asociarla a cada entrada del inventario, de forma que cada hallazgo conserve su proyecto y dependencia concretos.

### 3. Se consulta OSV con la versión exacta

Por cada combinación única, el backend envía una petición HTTP `POST` a:

```text
https://api.osv.dev/v1/query
```

El cuerpo tiene el formato de consulta por paquete y versión que define OSV. Por ejemplo:

```json
{
  "package": {
    "name": "org.apache.logging.log4j:log4j-core",
    "ecosystem": "Maven"
  },
  "version": "2.14.1"
}
```

El nombre del paquete no se deduce del repositorio: se usa exactamente el nombre registrado en Flaw. OSV responde con los avisos que relaciona con ese paquete, ecosistema y versión. Flaw no mantiene una copia propia del catálogo OSV ni afirma que su respuesta cubra fuentes de vulnerabilidades distintas de OSV.

Las consultas independientes se procesan en paralelo, con un máximo de **ocho peticiones simultáneas**. El cliente HTTP tiene un tiempo máximo de conexión de cinco segundos y un tiempo máximo de lectura de veinte segundos. Por tanto, es necesaria una conexión a Internet y el resultado depende de la disponibilidad y los datos publicados por OSV.

### 4. Se validan y transforman los avisos recibidos

Para cada aviso recibido, Flaw examina los paquetes declarados en la respuesta. Solo crea un hallazgo si el nombre del paquete y el ecosistema coinciden con la dependencia registrada. La comparación de esos dos campos no distingue mayúsculas de minúsculas; el ecosistema también se compara después de aplicar su correspondencia con el nombre de OSV.

Después transforma los datos del aviso:

- **Identificador:** utiliza el primer alias que empiece por `CVE-`, si existe; si no, conserva el identificador de OSV, que puede ser un `GHSA-` u otro ID.
- **Título:** usa el resumen publicado por OSV; si no hay resumen, usa el identificador. El título se limita a 300 caracteres.
- **Resumen para la lista:** parte de los detalles de OSV, elimina formato Markdown común, compacta los espacios y limita el texto mostrado en la tarjeta a 280 caracteres.
- **Detalles para el informe:** conserva además una versión de texto más extensa, de hasta 12.000 caracteres, con párrafos y listas sencillas para que el desarrollador pueda leer el contexto técnico sin salir de la aplicación. Si OSV no entrega detalles, usa el título. El enlace al aviso permite revisar el contenido original y las recomendaciones completas.
- **Rangos afectados:** traduce los eventos de versiones de OSV a expresiones legibles. Por ejemplo, un evento `introduced` seguido de `fixed` puede convertirse en `>= 2.0.0, < 2.15.0`. Si OSV publica varios rangos, Flaw los muestra separados por `OR`.
- **Versión corregida:** busca el evento `fixed` del rango que contiene la versión registrada. No inventa una versión corregida cuando OSV no especifica una.
- **Referencia:** prefiere una referencia OSV marcada como aviso (`ADVISORY`). Si no hay una, enlaza a `https://osv.dev/vulnerability/{id}`.
- **Fecha:** conserva la fecha de publicación de OSV si está disponible.

La comparación local para elegir el rango y la versión corregida acepta versiones numéricas separadas por puntos y operadores `<`, `<=`, `>` y `>=`; dentro de un rango, las condiciones separadas por comas se interpretan conjuntamente. No es un comparador universal de todos los esquemas de versiones existentes.

### 5. Se determina la severidad sin fabricar puntuaciones

Si OSV proporciona una puntuación CVSS numérica, Flaw la conserva. Si OSV proporciona un vector CVSS 3.0 o 3.1 válido, Flaw calcula su puntuación base conforme a las métricas del vector y la clasifica con estos umbrales:

| Puntuación CVSS | Severidad |
| --- | --- |
| 9,0 o superior | Crítica (`CRITICAL`) |
| 7,0 a menos de 9,0 | Alta (`HIGH`) |
| 4,0 a menos de 7,0 | Media (`MEDIUM`) |
| Menos de 4,0 | Baja (`LOW`) |

Si el vector está incompleto o pertenece a una versión no compatible, Flaw no inventa una puntuación y la interfaz omite ese dato. Para la etiqueta de severidad, Flaw intenta utilizar el campo específico de la base de datos de OSV; si no existe o no se reconoce, la severidad queda como `UNKNOWN`. Los vectores CVSS v4 no se calculan actualmente.

### 6. Se guardan los resultados del último análisis

Cuando todas las consultas y transformaciones terminan correctamente, Flaw reemplaza los hallazgos del análisis anterior por los nuevos y guarda:

- Cada hallazgo y la dependencia a la que corresponde.
- Identificador, título, resumen para la tarjeta, detalles técnicos para el informe, rangos afectados y posible versión corregida.
- Puntuación CVSS base (recibida como valor numérico o calculada desde un vector CVSS 3.0/3.1 válido) y severidad.
- Fecha de publicación y enlace de referencia.
- Fecha del análisis, número de dependencias examinadas, número de hallazgos y una huella del inventario analizado.

Los hallazgos se guardan asociados a la dependencia registrada, y por esa dependencia se puede llegar al proyecto. La base de datos impide duplicar el mismo aviso para la misma dependencia.

La sustitución se realiza dentro de una transacción. Si una consulta a OSV falla antes de guardar el nuevo análisis, la operación comunica el error y se conservan los resultados del último análisis correcto; no se presenta la respuesta fallida como si fuera un análisis sin vulnerabilidades.

Al actualizar una instalación existente, las filas de hallazgos que ya estaban guardadas no contienen el nuevo campo de detalles completos ni una puntuación calculada desde el vector OSV si antes no se había guardado. Después de aplicar la migración y actualizar el backend, ejecuta **Analizar** para volver a consultar OSV y regenerar esos datos para los resultados actuales.

### 7. Se comprueba si los resultados siguen vigentes

Al completar el análisis, Flaw calcula una huella SHA-256 del inventario. Para comparar el inventario de forma determinista, ordena las dependencias por identificador e incluye en la huella el identificador, el ecosistema, el nombre del paquete y la versión.

Cuando se solicita el estado mediante `GET /api/analysis/status`, Flaw vuelve a calcular la huella del inventario actual y la compara con la guardada:

- `scanned: false`: todavía no hay un análisis guardado.
- `upToDate: true`: el inventario coincide con el que se analizó.
- `upToDate: false`: se ha añadido, eliminado o cambiado alguna dependencia después del análisis.

Si el inventario cambia, Flaw no presenta los hallazgos antiguos como actuales: las rutas de alertas y vulnerabilidades devuelven una lista vacía hasta que se ejecute otro análisis. Los datos del análisis anterior siguen guardados, pero no se consideran vigentes para el inventario actual.

## Cómo aparecen los resultados en la aplicación

El frontend consulta el resumen, proyectos, alertas, vulnerabilidades y estado del análisis. La respuesta se presenta en las secciones del dashboard:

- **Alertas:** relaciona el aviso con el proyecto y la dependencia concretos.
- **Vulnerabilidades:** muestra los avisos sin repetirlos cuando el mismo aviso aparece para el mismo paquete y ecosistema en más de un proyecto.
- **Estado del análisis:** indica si falta analizar, si el inventario cambió o cuándo se ejecutó el último análisis.

En cada hallazgo pueden mostrarse el identificador, severidad, puntuación CVSS disponible, fuente OSV, paquete y versión, rango afectado, versión corregida y enlace al aviso original.

Las rutas de análisis son:

| Método | Ruta | Función |
| --- | --- | --- |
| `POST` | `/api/analysis/scan` | Ejecuta el análisis contra OSV y devuelve el nuevo estado. |
| `GET` | `/api/analysis/status` | Informa si se analizó, si sigue vigente, cuándo se ejecutó y los contadores. |
| `GET` | `/api/alerts` | Devuelve hallazgos asociados a proyectos y dependencias, si el análisis sigue vigente. |
| `GET` | `/api/vulnerabilities` | Devuelve avisos sin duplicados por CVE, ecosistema y paquete, si el análisis sigue vigente. |

Una respuesta de estado tiene esta forma:

```json
{
  "scanned": true,
  "upToDate": true,
  "scannedAt": "2026-11-01T12:00:00Z",
  "dependencyCount": 2,
  "findingCount": 9
}
```

Los valores de ejemplo son ilustrativos: la cantidad real de resultados depende del inventario, de la información disponible en OSV y del momento en que se ejecuta la consulta.

## Datos de demostración

En el perfil de desarrollo, si la base de datos está vacía, Flaw crea un proyecto de ejemplo con versiones antiguas de Log4j y Spring. El proyecto sirve para probar el flujo: las vulnerabilidades no se cargan como un catálogo estático de hallazgos. Para obtener resultados hay que ejecutar **Analizar**, que consulta OSV con esas dependencias.

## Qué significa —y qué no significa— un resultado

- **Un hallazgo** significa que OSV devolvió un aviso para la combinación consultada y Flaw pudo asociarlo al paquete y ecosistema registrados.
- **Cero hallazgos** significa que esa consulta no devolvió coincidencias conocidas en OSV en ese momento; no demuestra que el software sea seguro.
- **Una versión corregida** es la versión marcada como `fixed` en los datos del aviso cuando se pudo asociar al rango afectado. Hay que comprobar siempre las recomendaciones del proveedor antes de actualizar.
- **Un resultado vigente** significa que el inventario no cambió desde el análisis; no significa que OSV no haya publicado nuevos avisos después de la fecha de consulta.

Flaw no importa manifiestos, no resuelve transitivas, no analiza el código fuente ni el comportamiento de ejecución, no consulta otras bases de datos de avisos y no reemplaza una auditoría de seguridad. La cobertura depende de que el nombre del paquete, ecosistema y versión estén registrados correctamente y de los datos que OSV tenga publicados.

## Archivos principales de implementación

- [`AnalysisService`](./backend/src/main/java/io/flaw/vulnerabilities/service/AnalysisService.java): organiza las consultas, persiste resultados y determina si el análisis sigue vigente.
- [`OsvClient`](./backend/src/main/java/io/flaw/vulnerabilities/service/OsvClient.java): envía la consulta HTTP a OSV y traduce errores del proveedor.
- [`OsvFindingMapper`](./backend/src/main/java/io/flaw/vulnerabilities/service/OsvFindingMapper.java): normaliza avisos, rangos, severidad y datos de remediación.
- [`AnalysisController`](./backend/src/main/java/io/flaw/vulnerabilities/controller/AnalysisController.java): expone las rutas para analizar y consultar el estado.
- [`ScanFinding`](./backend/src/main/java/io/flaw/vulnerabilities/model/ScanFinding.java) y [`AnalysisRun`](./backend/src/main/java/io/flaw/vulnerabilities/model/AnalysisRun.java): representan los datos persistidos.
