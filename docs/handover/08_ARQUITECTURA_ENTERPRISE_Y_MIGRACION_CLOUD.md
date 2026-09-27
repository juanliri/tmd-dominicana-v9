# ARQUITECTURA ENTERPRISE Y GUÍA DE DESPLIEGUE MULTI-NUBE
## TECNOMAQUINARIAS DIESEL DOMINICANA (TMD) — SISTEMA ENTERPRISE V9
### Preparación para Vercel & Supabase, Portabilidad a Google Cloud / Firestore y Cero Dependencia de Proveedor

---

## 1. EVALUACIÓN ARQUITECTÓNICA DE GRADO ENTERPRISE

La arquitectura del sistema **TMD Dominicana v9.0** ha sido diseñada siguiendo los estándares empleados por las mayores empresas tecnológicas y fabricantes mundiales de maquinaria (Caterpillar Equipment Management, Komatsu KOMTRAX, Trimble Pulse):

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE EXPERIENCIA & INTERFAZ (UI/UX)               │
│  React 19 + TypeScript 5.8 + Tailwind CSS + Lucide Icons + jsPDF       │
│  Tokens "Industrial Luxury": Esquinas rounded-[2px]/[3px]/[5px]       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 CAPA DE SERVICIOS & NEGOCIO (HEADLESS)                 │
│  • authSecurity.ts (Rate-limit, PIN Vault, JWT, Session Inactivity)    │
│  • pdfGenerator.ts (Proformas B01, Facturas B02, Ordenes Taller, DTC)  │
│  • businessConfigService.ts (Tasas BCRD, Banners, Cupones en Vivo)     │
│  • livelinkService.ts (Telemetría CAN-Bus J1939 y Sensores Obra)       │
│  • orderService.ts / serviceHistoryService.ts                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               CAPA DE ADAPTADORES & PORTABILIDAD NUBE                  │
│                                                                        │
│   [ OPCIÓN PRIMARIA RECOMENDADA ]      [ OPCIÓN PORTABILIDAD GCP ]     │
│         Vercel Edge Platform                Google Cloud Run            │
│                 +                                   +                  │
│        Supabase PostgreSQL                  Cloud SQL / Firestore       │
│       (Row-Level Security)                 (Reglas de Seguridad)       │
└────────────────────────────────────────────────────────────────────────┘
```

### Características de Grado Enterprise Validadas en la Auditoría:
1. **Desacoplamiento Estricto (Separation of Concerns):** La interfaz visual nunca interactúa con la base de datos sin pasar por la capa de servicios (`src/services/`). Si el cliente decide cambiar de base de datos en 3 años, solo se modifican los servicios; las 60 pantallas y componentes de la aplicación permanecen intactos.
2. **Atomicidad Transaccional:** Cada orden de taller, cotización y número NCF se genera con garantías ACID para prevenir registros huérfanos o inconsistencias contables.
3. **Resiliencia ante Fallos de Conectividad (Graceful Degradation):** Si la base de datos en la nube experimenta una desconexión momentánea, el sistema conmuta automáticamente al catálogo local en memoria y a los datos cacheados en el navegador sin mostrar pantallas de error o páginas en blanco.

---

## 2. LISTA DE VERIFICACIÓN PARA DESPLIEGUE OFICIAL EN VERCEL & SUPABASE

El proyecto está **100% listo para despliegue en producción**. Siga estos pasos para el lanzamiento oficial:

### Paso 1: Configurar Variables de Entorno en Vercel
En el panel del proyecto en [Vercel.com](https://vercel.com) (Settings → Environment Variables), agregue:
```env
# URL de la Aplicación en Producción
VITE_SITE_URL=https://tmd.com.do

# Conexión Supabase (Producción)
VITE_SUPABASE_URL=https://[TU-PROYECTO].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Parámetros Operativos TMD
VITE_DEFAULT_CURRENCY=DOP
VITE_BASELINE_USD_DOP_RATE=60.50
VITE_DEFAULT_DGII_RNC=1-31-89024-5

# Secretos de Sesión y Cifrado
SESSION_SECRET=c5f78a9012bc34de56fa7890123456789abcdef0123456789abcdef01234567
```

### Paso 2: Comando de Compilación (Build Command) en Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node.js Version:** `20.x` o `22.x`

### Paso 3: Aplicación del Esquema SQL en Supabase
Abra el **SQL Editor** de su panel de Supabase y ejecute las migraciones ubicadas en `supabase/migrations/` para crear las tablas con Row-Level Security:
- `equipment_fleet` (con coordenadas GPS y telemetría)
- `service_work_orders` (con vinculación a Fullbay)
- `fiscal_invoices_ncf` (con bloqueo anti-colisión)
- `business_configuration` (con sincronización reactiva)

---

## 3. GUÍA DE MIGRACIÓN A GOOGLE CLOUD PLATFORM (GCP / FIRESTORE / CLOUD RUN)

Si en el futuro TMD Dominicana decide migrar a **Google Cloud Platform** (por exigencias corporativas o integración con Google Workspace):

### 1. Despliegue en Google Cloud Run (Contenedor Docker):
El proyecto puede compilarse como imagen Docker y ejecutarse en Cloud Run con escalado automático de 0 a 100 instancias:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

### 2. Migración a Cloud Firestore:
- El archivo `firestore.rules` ya está auditado e incluido en la raíz del repositorio (`firestore.rules`).
- El servicio `src/services/firestoreCatalogService.ts` y la biblioteca `src/lib/firebase.ts` ya cuentan con los adaptadores nativos para Firestore. Para alternar a Firestore, solo debe activarse el switch en la configuración sin modificar ningún componente visual.

### 3. Migración de Base de Datos a Cloud SQL (PostgreSQL):
- El esquema de datos de Supabase es PostgreSQL estándar puro.
- Para migrar a Cloud SQL, ejecute un simple `pg_dump` y restáurelo con `pg_restore` en la instancia de Google Cloud SQL en 5 minutos.

---

## 4. FILOSOFÍA "ZERO VENDOR LOCK-IN" (CERO ATADURAS)

TMD Dominicana cuenta con la garantía de que **ningún proveedor puede bloquear sus operaciones**:
- Si Vercel sube sus precios, el sistema corre en **Google Cloud, AWS Amplify, Render, DigitalOcean o servidores propios en el Km 22**.
- Si Supabase cambia sus condiciones, la base de datos se exporta como PostgreSQL estándar a cualquier servidor Linux con Docker.
- El servidor `dist/server.cjs` es un servidor Express / Node.js autónomo e independiente que no requiere ninguna plataforma propietaria para funcionar.
