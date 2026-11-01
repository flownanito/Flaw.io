# 🛡️ Arquitectura del Sistema - Flaw (`flaw.app` / `flaw.io`)

**Flaw** es una plataforma de alertas y notificaciones en tiempo real diseñada para desarrolladores. Su objetivo es detectar vulnerabilidades críticas (Zero-Day, CVEs de alta severidad) en librerías, dependencias y ecosistemas de código (Java, Node.js, Python, Go, etc.) y notificar a los programadores al instante antes de que afecten sus aplicaciones en producción.

---

## 📐 1. Diagrama de Arquitectura General

El sistema adopta una arquitectura basada en eventos (*Event-Driven Architecture*) desacoplada en tres capas principales: **Ingesta**, **Procesamiento/Matching** y **Distribución de Notificaciones**.

```
[ Fuentes de Seguridad ]
  ├── NVD (NIST CVE Feed)
  ├── GitHub Security Advisories
  └── Vendors (Oracle, Node, etc.)
            │
            ▼
┌─────────────────────────────────────────┐
│        1. Ingestion Engine              │
│  (Crawlers, Webhooks & Normalizer)      │
└────────────────────┬────────────────────┘
                     │  (Eventos de CVEs)
                     ▼
┌─────────────────────────────────────────┐
│     2. Event Bus & Queue (Redis)        │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│     3. Matching & Filtering Engine      │
│  (Filtro de Severidad CVSS >= 7.0 &     │
│   Cruzado con Stack de Usuarios)        │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│     4. Notification Delivery Engine     │
│  (Push, Webhooks, Slack, Discord, Email)│
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│         5. Cliente / Interfaz           │
│  (Dashboard Web, App Móvil, Flaw CLI)   │
└─────────────────────────────────────────┘
```

---

## 🧩 2. Componentes Principales del Sistema

### A. Capa de Ingesta y Normalización (`Ingestion Engine`)
Servicio encargado de monitorear y recolectar alertas globales de vulnerabilidades las 24 horas del día.
* **Collectors / Connectors:**
  * **NVD API:** Consumo de actualizaciones de *Common Vulnerabilities and Exposures* (CVE).
  * **GitHub Security Advisory Database:** Colectores de vulnerabilidades en paquetes (`npm`, `Maven`, `PyPI`, `Go Modules`, `Cargo`, etc.).
  * **Feeds de Seguridad Directos:** Webhooks o RSS de avisos oficiales de frameworks/lenguajes (p. ej., Log4j, Spring, Express).
* **Data Normalizer:** Transforma las alertas desde sus distintos formatos origen a un objeto estructurado estándar:
  ```json
  {
    "cve_id": "CVE-2021-44228",
    "title": "Apache Log4j2 Remote Code Execution",
    "severity": "CRITICAL",
    "cvss_score": 10.0,
    "ecosystem": "maven",
    "package_name": "org.apache.logging.log4j:log4j-core",
    "vulnerable_versions": "< 2.15.0",
    "patched_version": "2.15.0",
    "published_at": "2021-12-10T10:15:00Z"
  }
  ```

### B. Motor de Coincidencia y Filtrado (`Matching Engine`)
Procesa las vulnerabilidades registradas y determina a qué usuarios o sistemas deben enviarse las alertas.
* **Filtro por Umbral de Severidad:** Por defecto, solo dispara alertas prioritarias para eventos con puntuación **CVSS ≥ 7.0 (High/Critical)**.
* **Mapeo de Dependencias y Stacks:** Contrasta las librerías afectadas con los proyectos y stacks registrados por cada desarrollador.

### C. Sistema de Entrega de Notificaciones (`Delivery Engine`)
Encargado de la entrega ultrarrápida multicanal.
* **Integraciones Directas:** Slack Apps, Discord Webhooks, Microsoft Teams.
* **Alertas Críticas:** Push Notifications (Móvil/Navegador), Email, SMS / PagerDuty para incidencias Zero-Day extremas.
* **Gestión de Reintentos:** Manejo de colas con política de reintentos (*Exponential Backoff*) para asegurar la entrega.

### D. Interfaz y Experiencia de Usuario (`Client Layer`)
* **Dashboard Web (`flaw.app` / `flaw.io`):** Panel para dar de alta proyectos, seleccionar tecnologías a vigilar y configurar integraciones de chat/notificación.
* **Flaw CLI (Línea de Comandos):** Herramienta para analizar archivos de dependencias locales (`package.json`, `pom.xml`, `requirements.txt`, `go.mod`) y sincronizar la lista de paquetes monitoreados automáticamente.

---

## 🛠️ 3. Stack Tecnológico Sugerido

| Capa | Tecnología Seleccionada | Justificación |
| :--- | :--- | :--- |
| **API & Backend Core** | **Go (Golang)** o **Node.js (TypeScript)** | Alta concurrencia, bajo consumo de recursos y procesamiento de I/O en tiempo real. |
| **Base de Datos Principal** | **PostgreSQL** | Almacenamiento relacional confiable para usuarios, configuraciones, integraciones y registro de CVEs. |
| **Colas de Mensajes / Cache** | **Redis + BullMQ** | Procesamiento asíncrono de eventos e ingesta en tiempo real sin bloquear la API principal. |
| **Frontend Dashboard** | **React + Vite + CSS** | Interfaz rápida y ligera, organizada por páginas y componentes, conectada a la API Spring Boot. |
| **CLI Tool** | **Go** | Permite generar un ejecutable binario único, liviano y multiplataforma sin dependencias externas. |
| **Infraestructura** | **Docker + Fly.io / AWS / Render** | Despliegue de microservicios con escalado según la carga de ingesta. |

---

## 🔄 4. Flujo de Trabajo en Tiempo Real (Caso de Uso)

1. **Aparición del Fallo:** Se publica una vulnerabilidad crítica de ejecución remota de código en una librería popular de Java.
2. **Detección Automática (< 30s):** El *Ingestion Engine* de Flaw detecta la entrada en GitHub Advisories / NVD y publica el evento en Redis.
3. **Indexación y Filtro (< 5s):** El *Matching Engine* valida que la vulnerabilidad tiene un CVSS de `10.0` (Crítica) e identifica a los desarrolladores registrados que utilicen esa versión.
4. **Disparo de Alertas (< 10s):** Se despachan notificaciones simultáneas mediante Webhooks a Slack/Discord y Notificaciones Push a los dispositivos móviles de los desarrolladores configurados.
5. **Mitigación:** El desarrollador recibe el aviso con el parche recomendado (ej. *Actualizar a la versión X.Y.Z*) antes de que la vulnerabilidad comience a ser explotada masivamente.

## Rglas de buenas practicas a seguir:

1. La aququitectura que quieroq ueme hags al desarrolar el sftware se la siguiente:
  - Una carepta llamada "backend" que contenga todo ele backend de la empresa con uana beuan organizacionpara mverm bien por los sitios y que este estructurado ene un modelo vista controlador con springboot
  - otra carpeta llamada "forntend" que contega todo lo de frontend y que dentro de hay este todo el react y tdo
  - dentro de la la crpeta frontend quiero que me estrectures tdod en "utils" "compnents" "pages" y denyri de pages y componets etes uana carpea con el nombre de cada componenete y de cada pagina y denyro de esa carpeta este jsx y css correcpondiente a esa pagina o ese compnenete.