import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  'Saltar al contenido': 'Skip to content',
  'TU CENTRO DE OPERACIONES': 'YOUR OPERATIONS CENTER',
  'El código, bajo control.': 'Code, under control.',
  'TU INVENTARIO': 'YOUR INVENTORY',
  Proyectos: 'Projects',
  Dependencias: 'Dependencies',
  'EL PANORAMA GLOBAL': 'THE GLOBAL OVERVIEW',
  Vulnerabilidades: 'Vulnerabilities',
  'COINCIDENCIAS EN TU STACK': 'MATCHES IN YOUR STACK',
  'Alertas activas': 'Active alerts',
  'INFORME DE SEGURIDAD': 'SECURITY REPORT',
  'Detalle de vulnerabilidad': 'Vulnerability details',
  AJUSTES: 'SETTINGS',
  'Preferencias de la aplicación': 'Application preferences',
  Resumen: 'Overview',
  Alertas: 'Alerts',
  Configuración: 'Settings',
  'TU ESPACIO': 'YOUR WORKSPACE',
  'Navegación principal': 'Main navigation',
  'Flaw, ir al resumen': 'Flaw, go to overview',
  'Tu código cambia.': 'Your code changes.',
  'Tu seguridad también.': 'Your security does too.',
  'Workspace personal': 'Personal workspace',
  'Sesión activa': 'Active session',
  'API conectada': 'API connected',
  'API sin conexión': 'API offline',
  'Conectando API': 'Connecting to API',
  'Actualizar datos': 'Refresh data',
  'Consultar OSV para las dependencias registradas': 'Check registered dependencies with OSV',
  'Añade dependencias para iniciar el análisis': 'Add dependencies to start scanning',
  'Analizando…': 'Scanning…',
  Analizar: 'Scan',
  'Nuevo proyecto': 'New project',
  'No podemos leer los datos de Flaw.': 'Unable to load Flaw data.',
  'No se pudo conectar con la API. Comprueba que el backend esté iniciado y vuelve a intentarlo.':
    'Could not connect to the API. Make sure the backend is running and try again.',
  'No se pudo consultar la base de vulnerabilidades de OSV.':
    'Unable to query the OSV vulnerability database.',
  Reintentar: 'Retry',
  'Conectando con tu stack…': 'Connecting to your stack…',
  'Cargando y traduciendo los avisos de seguridad…': 'Loading and translating security advisories…',
  'Cerrar notificación': 'Dismiss notification',
  'Análisis completado: {dependencyCount} dependencias revisadas, sin coincidencias.':
    'Scan complete: {dependencyCount} dependencies checked, no matches found.',
  'Análisis completado: {findingCount} hallazgos en {dependencyCount} dependencias.':
    'Scan complete: {findingCount} findings across {dependencyCount} dependencies.',
  'Dependencia añadida a la vigilancia.': 'Dependency added to monitoring.',
  'Dependencia eliminada de la vigilancia.': 'Dependency removed from monitoring.',
  'Proyecto eliminado.': 'Project deleted.',
  'Proyecto creado. Ya puedes añadir dependencias.': 'Project created. You can now add dependencies.',
  'SEGURIDAD DE DEPENDENCIAS, SIN RUIDO': 'DEPENDENCY SECURITY, WITHOUT THE NOISE',
  'El riesgo está': 'Risk lives',
  'lo que instalas.': 'what you install.',
  'Vigila tu stack. Encuentra las piezas vulnerables. Arregla lo importante antes de que se convierta en un incidente.':
    'Monitor your stack. Find vulnerable components. Fix what matters before it becomes an incident.',
  'Explorar mis proyectos': 'Explore my projects',
  'Aún no has analizado tus dependencias.': 'You have not scanned your dependencies yet.',
  'Usa «Analizar» para consultar los avisos reales de OSV.': 'Select “Scan” to check real OSV advisories.',
  'El inventario ha cambiado.': 'Your inventory has changed.',
  'Vuelve a analizarlo para actualizar los resultados.': 'Scan again to update the results.',
  'Último análisis OSV: {date} · {count} dependencias': 'Last OSV scan: {date} · {count} dependencies',
  'repositorios vigilados': 'repositories monitored',
  'paquetes en seguimiento': 'packages tracked',
  'en las dependencias analizadas': 'in scanned dependencies',
  '{count} críticas detectadas': '{count} critical findings',
  '01 — MATCH ENGINE': '01 — MATCH ENGINE',
  'Señales para actuar': 'Signals to act on',
  'Ver todas': 'View all',
  'Sin coincidencias.': 'No matches.',
  'No hay alertas para las dependencias registradas.': 'No alerts found for the registered dependencies.',
  'Ver todos los proyectos': 'View all projects',
  '02 — TU STACK': '02 — YOUR STACK',
  'En el radar': 'On the radar',
  'VIGILANDO': 'MONITORING',
  '{count} dependencias': '{count} dependencies',
  'Añade dependencias para empezar a vigilar.': 'Add dependencies to start monitoring.',
  '+{count} paquetes más': '+{count} more packages',
  'Aún no hay proyectos conectados.': 'No projects connected yet.',
  'Añade el primero': 'Add your first project',
  'Protegiendo el código que mueve el mundo.': 'Protecting the code that moves the world.',
  'FUENTE: OPEN SOURCE VULNERABILITIES (OSV)': 'SOURCE: OPEN SOURCE VULNERABILITIES (OSV)',
  'Cada repositorio es una superficie de ataque. Añade proyectos y dependencias para ver dónde importa cada alerta.':
    'Every repository is an attack surface. Add projects and dependencies to see where each alert matters.',
  'PROYECTOS': 'PROJECTS',
  'PAQUETES': 'PACKAGES',
  'Vigila otro proyecto': 'Monitor another project',
  'Conecta un repositorio a tu radar.': 'Connect a repository to your radar.',
  'REPOSITORIOS / 00': 'REPOSITORIES / 00',
  'Empieza por tu código.': 'Start with your code.',
  'Crea un proyecto y añade sus dependencias. Flaw encontrará las vulnerabilidades que coincidan con tu stack.':
    'Create a project and add its dependencies. Flaw will find vulnerabilities affecting your stack.',
  'Crear primer proyecto': 'Create your first project',
  'Avisos de OSV que coinciden con las versiones registradas en tus proyectos.':
    'OSV advisories matching the versions registered in your projects.',
  'Publicada {date}': 'Published {date}',
  'RESULTADOS / {count}': 'RESULTS / {count}',
  'Filtrar por severidad': 'Filter by severity',
  TODAS: 'ALL',
  Todas: 'All',
  'Buscar vulnerabilidades': 'Search vulnerabilities',
  'Buscar CVE, paquete…': 'Search CVE, package…',
  'Afecta a': 'Affects',
  'Corregida en': 'Fixed in',
  'Sin parche indicado': 'No fix specified',
  'Abrir aviso original': 'Open original advisory',
  'Todavía no hay resultados de análisis.': 'No scan results yet.',
  'Pulsa «Analizar» para consultar las versiones registradas en OSV.': 'Select “Scan” to check the registered versions with OSV.',
  'El análisis necesita actualizarse.': 'The scan needs to be updated.',
  'Vuelve a analizar las dependencias para obtener resultados actualizados.': 'Scan your dependencies again to get up-to-date results.',
  'No encontramos resultados.': 'No results found.',
  'Prueba otra búsqueda o cambia el filtro de severidad.': 'Try another search or change the severity filter.',
  'Limpiar filtros': 'Clear filters',
  'Verifica siempre la recomendación de parche con el aviso del proveedor antes de aplicarla.':
    'Always verify the patch recommendation with the vendor advisory before applying it.',
  'ANÁLISIS PENDIENTE': 'SCAN PENDING',
  'Analiza tu stack.': 'Scan your stack.',
  'Ejecuta un análisis para consultar OSV con las versiones exactas que has registrado.':
    'Run a scan to check OSV using the exact versions you registered.',
  'ANÁLISIS DESACTUALIZADO': 'SCAN OUT OF DATE',
  'Vuelve a analizar.': 'Scan again.',
  'Has modificado tus proyectos o dependencias desde el último análisis. Ejecuta uno nuevo para actualizar los resultados.':
    'You changed your projects or dependencies since the last scan. Run a new scan to update the results.',
  'SIN COINCIDENCIAS EN OSV': 'NO OSV MATCHES',
  'No se encontraron coincidencias.': 'No matches found.',
  'OSV no ha reportado vulnerabilidades conocidas para las {count} dependencias analizadas.':
    'OSV reported no known vulnerabilities for the {count} scanned dependencies.',
  'COINCIDENCIAS / FUENTE OSV': 'MATCHES / OSV SOURCE',
  '{count} coincidencia necesita': '{count} match needs',
  '{count} coincidencias necesitan': '{count} matches need',
  'tu atención.': 'your attention.',
  'Análisis pendiente.': 'Scan pending.',
  'Análisis desactualizado.': 'Scan out of date.',
  'Sin coincidencias en OSV.': 'No OSV matches.',
  'No se han encontrado avisos para las versiones revisadas.': 'No advisories found for the checked versions.',
  'CRÍTICAS': 'CRITICAL',
  'Alertas coincidentes': 'Matching alerts',
  'RANGO AFECTADO': 'AFFECTED RANGE',
  'ACTUALIZA A': 'UPDATE TO',
  'Ver aviso oficial': 'See official advisory',
  PUBLICADA: 'PUBLISHED',
  'Abrir informe': 'Open report',
  'Revisar dependencias': 'Review dependencies',
  'Análisis: {date}': 'Scan: {date}',
  'Resultados de OSV para dependencias directas registradas. Verifica los avisos del proveedor antes de desplegar.':
    'OSV results for registered direct dependencies. Verify vendor advisories before deploying.',
  'Sin clasificar': 'Unclassified',
  'Sin puntuación': 'Unscored',
  'Fecha no disponible': 'Date unavailable',
  Crítica: 'Critical',
  Alta: 'High',
  Media: 'Medium',
  Baja: 'Low',
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  UNKNOWN: 'Unknown',
  'INFORME NO DISPONIBLE': 'REPORT UNAVAILABLE',
  'Esta alerta ya no está en el análisis vigente.': 'This alert is no longer part of the current scan.',
  'Vuelve a las alertas y ejecuta un análisis actualizado para consultar los resultados actuales.':
    'Return to alerts and run an up-to-date scan to see current results.',
  'Volver a alertas': 'Back to alerts',
  'El aviso no incluye una descripción detallada. Consulta la referencia de seguridad para obtener información del proveedor.':
    'This advisory does not include a detailed description. Check the security reference for information from the vendor.',
  'Resumen del aviso': 'Advisory summary',
  SEVERIDAD: 'SEVERITY',
  'PUNTUACIÓN CVSS BASE': 'CVSS BASE SCORE',
  FUENTE: 'SOURCE',
  'COMPONENTE AFECTADO': 'AFFECTED COMPONENT',
  'Dependencia detectada': 'Detected dependency',
  Proyecto: 'Project',
  Ecosistema: 'Ecosystem',
  Paquete: 'Package',
  'Versión registrada': 'Registered version',
  'Rango afectado según OSV': 'Affected range reported by OSV',
  'No especificado por OSV': 'Not specified by OSV',
  'DETALLES DEL AVISO': 'ADVISORY DETAILS',
  'Descripción técnica publicada': 'Published technical description',
  'Este resultado guardado no contiene los detalles técnicos completos. Ejecuta «Analizar» para volver a consultar OSV y guardar la información disponible.':
    'This saved result does not contain the full technical details. Select “Scan” to check OSV again and save the available information.',
  'ESTADO DE CORRECCIÓN': 'REMEDIATION STATUS',
  'OSV indica una versión corregida': 'OSV reports a fixed version',
  'OSV no indica una versión corregida': 'OSV does not report a fixed version',
  'El aviso identifica esta versión como una corrección para el rango afectado. Verifica las notas del proveedor y la compatibilidad antes de actualizar.':
    'The advisory identifies this version as a fix for the affected range. Check the vendor notes and compatibility before updating.',
  'VERSIÓN CORREGIDA INDICADA': 'REPORTED FIXED VERSION',
  'Los datos de OSV no especifican una versión corregida. Esto no confirma que no exista una solución: revisa el aviso original para comprobar mitigaciones, actualizaciones o recomendaciones del proveedor.':
    'OSV does not specify a fixed version. This does not mean that no fix exists: check the original advisory for mitigations, updates, or vendor recommendations.',
  'REFERENCIA DEL AVISO': 'ADVISORY REFERENCE',
  'Consulta la fuente de seguridad': 'Check the security source',
  'Abre el aviso asociado para revisar el análisis técnico y las recomendaciones publicadas.':
    'Open the linked advisory to review the technical analysis and published recommendations.',
  'Abrir aviso de seguridad': 'Open security advisory',
  'Enlace del aviso OSV; puede dirigir a la publicación del proveedor.':
    'OSV advisory link; it may lead to the vendor publication.',
  'SIGUIENTES PASOS': 'NEXT STEPS',
  'Antes de cerrar la alerta': 'Before closing this alert',
  'Revisa el aviso original y confirma que afecta al uso que hace el proyecto del paquete.':
    'Review the original advisory and confirm it affects how your project uses the package.',
  'Evalúa actualizar a {version} y valida la compatibilidad.':
    'Consider updating to {version} and verify compatibility.',
  'Consulta si el proveedor recomienda una mitigación o una versión alternativa.':
    'Check whether the vendor recommends a mitigation or an alternative version.',
  'Vuelve a ejecutar el análisis para comprobar el estado de la dependencia actualizada.':
    'Run the scan again to check the status of the updated dependency.',
  'Informe generado a partir de los datos publicados por OSV y de la dependencia registrada. Confirma la solución en la documentación del proveedor.':
    'This report is based on data published by OSV and the registered dependency. Verify the fix in the vendor documentation.',
  '¿Eliminar el proyecto "{name}" y sus dependencias?': 'Delete project "{name}" and its dependencies?',
  'Eliminar {name}': 'Delete {name}',
  'Eliminar proyecto': 'Delete project',
  'Sin descripción': 'No description',
  DEPENDENCIAS: 'DEPENDENCIES',
  'Todavía no vigilas dependencias en este proyecto.': 'You are not monitoring any dependencies in this project yet.',
  'Dejar de vigilar {name}': 'Stop monitoring {name}',
  'Dejar de vigilar': 'Stop monitoring',
  'Versión': 'Version',
  'p. ej. express': 'e.g. express',
  'p. ej. api-gateway': 'e.g. api-gateway',
  Cancelar: 'Cancel',
  'Guardando…': 'Saving…',
  Vigilar: 'Monitor',
  'Añadir dependencia': 'Add dependency',
  'PRIMER PASO': 'FIRST STEP',
  'Añade un proyecto.': 'Add a project.',
  'Cerrar diálogo': 'Close dialog',
  'Empieza por el repositorio. Después podrás añadir las dependencias que quieres vigilar.':
    'Start with your repository. Then you can add the dependencies you want to monitor.',
  'Nombre del proyecto': 'Project name',
  OPCIONAL: 'OPTIONAL',
  Descripción: 'Description',
  '¿Qué hace este proyecto?': 'What does this project do?',
  'URL del repositorio': 'Repository URL',
  'Creando…': 'Creating…',
  'Crear proyecto': 'Create project',
  'Error de carga': 'Loading error',
  'Elige el idioma de la interfaz. Tu selección se guardará en este dispositivo.':
    'Choose the interface language. Your selection will be saved on this device.',
  'Los títulos y descripciones públicas de OSV se envían a DeepL para traducirse. Configura DEEPL_AUTH_KEY en el backend; si no está disponible, se mostrarán los textos originales.':
    'Public OSV titles and descriptions are sent to DeepL for translation. Configure DEEPL_AUTH_KEY in the backend; if it is unavailable, the original text will be shown.',
  'La traducción de avisos requiere configurar DEEPL_AUTH_KEY en el backend.':
    'Advisory translation requires setting DEEPL_AUTH_KEY in the backend.',
  'No se pudieron traducir los avisos con DeepL. Se muestran los textos originales.':
    'Could not translate advisories with DeepL. Original text is shown.',
  'DeepL devolvió una respuesta de traducción incompleta.':
    'DeepL returned an incomplete translation response.',
  'Un texto supera el tamaño máximo admitido por DeepL.':
    'A text exceeds DeepL’s maximum supported size.',
  Idioma: 'Language',
  Español: 'Spanish',
  Inglés: 'English',
  'Idioma actual': 'Current language',
  'El idioma se ha cambiado a {language}.': 'Language changed to {language}.',
  'Métricas de seguridad': 'Security metrics',
};

const LanguageContext = createContext(null);
const STORAGE_KEY = 'flaw.language';

function getInitialLanguage() {
  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return savedLanguage === 'en' ? 'en' : 'es';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'en'
      ? 'Flaw — Security that keeps up with your code'
      : 'Flaw — Seguridad que sigue el ritmo de tu código';
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: setLanguageState,
    t: (text, variables = {}) => {
      const apiError = language === 'en' ? text.match(/^La API respondió con un error \((\d+)\)\.$/) : null;
      const translated = language === 'en'
        ? translations[text] ?? (apiError ? `The API returned an error (${apiError[1]}).` : text)
        : text;
      return translated.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider.');
  }
  return context;
}
