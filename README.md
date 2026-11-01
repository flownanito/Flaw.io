# Flaw

Flaw es una aplicación para registrar proyectos, vigilar sus dependencias directas y contrastar las versiones exactas con avisos de seguridad publicados en [OSV (Open Source Vulnerabilities)](https://osv.dev/). Incluye una API REST con Spring Boot y un dashboard web con React.

> **Alcance:** el análisis consulta OSV al pulsar «Analizar». No es IA ni sustituye una auditoría: solo revisa las dependencias y versiones que registres, no lee automáticamente repositorios ni manifiestos y no resuelve dependencias transitivas. La API local tampoco tiene autenticación: no la expongas a Internet ni la uses como servicio de producción.

## Funcionalidades

- Crear y administrar proyectos y sus repositorios.
- Registrar dependencias de npm, Maven, PyPI, Go y Cargo.
- Analizar las versiones registradas consultando la API de OSV.
- Ver alertas relacionadas con el proyecto y paquete afectados, la versión corregida disponible y el aviso original.
- Guardar el último análisis y volver a ejecutarlo después de cambiar el inventario.

## Tecnologías

| Componente | Tecnología |
| --- | --- |
| Frontend | React 19, Vite 7 y CSS |
| API | Java 25, Spring Boot 3.5 y Maven |
| Base de datos local | H2 en modo compatible con PostgreSQL, almacenada en disco |
| Base de datos opcional | PostgreSQL 17 |

## Requisitos

- Java 25 o posterior y Maven 3.9 o posterior.
- Node.js 20 o posterior y npm.
- Conexión a Internet para consultar OSV durante el análisis.
- Docker solo si quieres usar PostgreSQL localmente en lugar de la base H2 predeterminada.

## Arranque rápido

### VS Code

Abre la carpeta raíz del proyecto y ejecuta **Terminal → Run Build Task** (en macOS, `⌘⇧B`). La tarea **Iniciar Flaw (frontend + API)** levanta ambos servicios.

- Dashboard: <http://localhost:3000>
- API: <http://localhost:8080>

### Terminal

En una terminal, inicia la API:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

En otra terminal, inicia el dashboard:

```bash
cd frontend
npm install
npm run dev
```

Abre <http://localhost:3000>. Para validar el frontend en producción, ejecuta `npm run build` desde `frontend/`; para ejecutar las pruebas del backend, ejecuta `mvn test` desde `backend/`.

## Base de datos y datos de demostración

El perfil `dev` usa por defecto una base H2 persistente en `backend/data/`. Spring la crea al iniciar, guarda los cambios entre reinicios y ese directorio está excluido de Git. No hacen falta Docker ni PostgreSQL para el arranque rápido.

Cuando la base está vacía, la API carga un proyecto de ejemplo con versiones antiguas de Log4j y Spring. Sus resultados no se inventan ni se cargan como catálogo estático: aparecen solo después de consultar OSV con el botón **Analizar**. El último análisis se guarda en la base local. Si OSV no está disponible, la API informa del error y conserva el último resultado correcto.

Para usar PostgreSQL, inicia el servicio incluido en `docker-compose.yml`:

```bash
docker compose up -d postgres
```

Después configura estas variables al arrancar la API:

```bash
DB_URL=jdbc:postgresql://localhost:15432/flaw
DB_USER=flaw
DB_PASSWORD=flaw_local
```

El dashboard usa `http://localhost:8080/api` por defecto. Para apuntarlo a otra API, define `VITE_API_URL` en `frontend/.env` (puedes partir de `frontend/.env.example`). Los orígenes permitidos se configuran con `FRONTEND_ORIGINS` o, para un solo origen, `FRONTEND_ORIGIN`.

## API disponible

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/dashboard/summary` | Resumen y métricas |
| `GET` | `/api/projects` | Lista de proyectos y dependencias |
| `GET` | `/api/projects/{id}` | Consulta un proyecto |
| `POST` | `/api/projects` | Crea un proyecto |
| `DELETE` | `/api/projects/{id}` | Elimina un proyecto |
| `POST` | `/api/projects/{id}/dependencies` | Añade una dependencia |
| `DELETE` | `/api/projects/{id}/dependencies/{dependencyId}` | Deja de vigilar una dependencia |
| `GET` | `/api/vulnerabilities` | Consulta los avisos del último análisis vigente |
| `GET` | `/api/alerts` | Consulta los hallazgos del último análisis vigente |
| `POST` | `/api/analysis/scan` | Analiza las dependencias registradas con OSV |
| `GET` | `/api/analysis/status` | Consulta la fecha y vigencia del último análisis |

Las peticiones de creación validan los datos de entrada. Añadir dos veces el mismo paquete al mismo proyecto devuelve `409 Conflict`.

## Estructura del proyecto

```text
backend/    API Spring Boot, organizada por dominios
frontend/   Dashboard React y componentes
.vscode/    Tareas para iniciar frontend y API juntos
```

## Límites actuales

La importación automática de manifiestos, el análisis de dependencias transitivas, la autenticación, el aislamiento de usuarios y la entrega de notificaciones todavía no están implementados. El valor CVSS solo se muestra si OSV entrega un valor numérico; no se inventa una puntuación a partir de un vector. Redis aparece en la configuración de Docker para trabajo futuro y no es necesario para ejecutar el MVP actual.
