# PLAN MAESTRO DE EVOLUCIÓN: PRÓXIMAS 10 FASES ENTERPRISE
## TECNOMAQUINARIAS DIESEL DOMINICANA (TMD) — SISTEMA OPERATIVO INTEGRAL
### Cronograma de Desarrollo, Expansión Tecnológica y Escalabilidad Multi-Sucursal (2026–2028)

---

## 1. VISIÓN ESTRATÉGICA DE ESCALAMIENTO

El sistema actual **TMD Dominicana v9.0** representa la culminación de la arquitectura base: catálogo comercial interactivo, portales de clientes y taller, sincronización de órdenes, telemetría simulada CAN-Bus, calculadora financiera y blindaje fiscal DGII.

Para consolidar el ecosistema tecnológico de la empresa y escalar hacia un conglomerado industrial de cobertura nacional, se define este **Plan Maestro de 10 Fases Consecutivas**:

```
[ v9.0 ACTUAL: CATÁLOGO, PORTALES & DGII B01/B02 ]
                       │
  ┌────────────────────┴────────────────────┐
  ▼                                         ▼
FASE 11: Despliegue & Dominio Oficial   FASE 16: Portal Importaciones & DGA
FASE 12: Factura Electrónica e-CF       FASE 17: Gestión Flota de Renta
FASE 13: Telemetría Real Módem J1939    FASE 18: App Móvil Técnicos 4x4
FASE 14: Conexión API Fullbay Live      FASE 19: Pronóstico Repuestos con IA
FASE 15: Multi-Sucursal (Santiago/Este) FASE 20: Portal Licitaciones MOPC
```

---

## 2. DETALLE DE LAS 10 FASES DE EVOLUCIÓN

### FASE 11: DESPLIEGUE EN PRODUCCIÓN, CLOUDFLARE & DOMINIO OFICIAL (DURACIÓN: 1 SEMANA)
- **Objetivos:**
  1. Configuración de DNS corporativo en Cloudflare para `tmd.com.do` y subdominios `portal.tmd.com.do` y `api.tmd.com.do`.
  2. Despliegue en Vercel Enterprise con variables de entorno seguras (`SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`).
  3. Verificación de reglas de seguridad SSL/TLS 1.3 con certificados gestionados y redirección forzada de HTTP a HTTPS.
  4. Pruebas de velocidad y CDN en los tres nodos de internet de República Dominicana (Claro, Altice, Wind).
- **Entregables:**
  - Sistema 100% en vivo en el dominio corporativo del cliente.
  - Reporte de verificación de Core Web Vitals y seguridad perimetral.

---

### FASE 12: INTEGRACIÓN FACTURACIÓN ELECTRÓNICA DGII (e-CF - LEY 32-23) (DURACIÓN: 3 SEMANAS)
- **Objetivos:**
  1. Adaptación a la nueva normativa obligatoria de Facturación Electrónica de la República Dominicana.
  2. Implementación del emisor de Comprobantes Fiscales Electrónicos:
     - **e-CF 31:** Factura de Crédito Fiscal Electrónica.
     - **e-CF 32:** Factura de Consumo Electrónica.
     - **e-CF 34:** Nota de Crédito Electrónica.
     - **e-CF 44:** Regímenes Especiales de Tributación Electrónico.
     - **e-CF 45:** Comprobante Gubernamental Electrónico.
  3. Integración de certificado digital X.509 emitido por entidad autorizada (Avansi / DigiCert) para firmado de XML.
  4. Generación automática del Código de Seguridad de 6 caracteres y Código QR estándar exigido por la DGII en la representación impresa de la factura.
- **Entregables:**
  - Módulo e-CF operativo con validación de estado en tiempo real contra los web services de la DGII.

---

### FASE 13: TELEMETRÍA REAL CON HARDWARE CAN-BUS J1939 & MÓDEM 4G/SATÉLITE (DURACIÓN: 4 SEMANAS)
- **Objetivos:**
  1. Conexión de pasarelas telemáticas físicas (módems Queclink GV300W o Teltonika FMC640) instaladas en las computadoras de a bordo de las excavadoras y palas mecánicas.
  2. Servidor de ingesta de telemetría de alta velocidad (Node.js UDP/TCP Server con WebSocket relay).
  3. Decodificación de tramas SAE J1939:
     - Parámetros de motor: RPM, Presión de Aceite, Nivel de Combustible, Temperatura de Refrigerante.
     - Horómetros reales acumulados sin intervención humana.
     - Detección inmediata de códigos de falla SPN/FMI y alerta por SMS/WhatsApp al jefe de taller.
- **Entregables:**
  - Dashboard LiveLink™ alimentado por datos satelitales 100% reales en campo.

---

### FASE 14: CONEXIÓN EN PRODUCCIÓN CON FULLBAY API (TALLER & BAHÍAS) (DURACIÓN: 2 SEMANAS)
- **Objetivos:**
  1. Sustituir el conector mock por las credenciales OAuth2 de producción de Fullbay Heavy Duty Shop Management.
  2. Sincronización bidireccional automática:
     - Cada orden de taller abierta en el portal de TMD genera un Service Order en Fullbay.
     - Los repuestos descontados en Fullbay actualizan el inventario en el portal TMD.
     - El cierre de orden en Fullbay notifica al cliente que su máquina está lista para retiro en el Km 22.
- **Entregables:**
  - Flujo continuo taller-portal sin re-digitación manual de información.

---

### FASE 15: GESTIÓN MULTI-SUCURSAL Y ALMACENES REGIONALES (DURACIÓN: 3 SEMANAS)
- **Objetivos:**
  1. Habilitar la arquitectura multi-nodo para soportar la expansión geográfica de TMD:
     - **Sede Central:** Km 22 Autopista Duarte, Santo Domingo Oeste (Taller Central & Patio Principal).
     - **Sucursal Norte / Cibao:** Autopista Duarte Km 5, Santiago de los Caballeros.
     - **Sucursal Este:** Cruce Verón - Punta Cana (Soporte hotelero y canteras).
     - **Sucursal Sur:** Cruce Azua / Barahona (Proyectos agrícolas y minería).
  2. Inventario distribuido: los clientes pueden consultar en qué sucursal hay existencia física de un filtro o bomba hidráulica.
  3. Módulo de traslados internos de repuestos y equipos con guías de remisión y trazabilidad.
- **Entregables:**
  - Selector de sucursal en catálogo y panel de inventario global consolidado para gerencia.

---

### FASE 16: PORTAL DE IMPORTACIONES MARÍTIMAS & ADUANAS (DGA) (DURACIÓN: 3 SEMANAS)
- **Objetivos:**
  1. Módulo para el departamento de compras internacionales para monitoreo de embarques:
     - Seguimiento de buques portacontenedores desde puertos de China (Shanghai/Ningbo), Reino Unido (Southampton) y Corea del Sur (Busan).
     - Alertas de atraque en Puerto Multimodal Caucedo y Puerto de Haina Oriental.
  2. Registro de aranceles de aduanas (DGA), declaración única aduanera (DUA) y costeo de importación en destino.
  3. Pre-asignación de maquinaria a clientes en lista de espera antes de que el barco arribe a la isla.
- **Entregables:**
  - Módulo de rastreo logístico marítimo integrado en el Command Center.

---

### FASE 17: GESTIÓN DE FLOTA DE RENTA & ALQUILER DE MAQUINARIA (DURACIÓN: 3 SEMANAS)
- **Objetivos:**
  1. Sistema integral de alquiler de equipos sin operador para contratistas viales y mineros.
  2. Control de tarifas: diaria, semanal, mensual o tarifa por bloque de 200 horas operativas.
  3. Monitoreo por LiveLink™ de horas extras de trabajo: si el cliente pactó 8 horas diarias y trabaja 14 horas, el sistema factura automáticamente el sobre-uso según horómetro satelital.
  4. Gestión de fianzas, depósitos de garantía y pólizas de seguro de alquiler.
- **Entregables:**
  - Módulo de contratos de renta con liquidación automática y firma digital.

---

### FASE 18: APLICACIÓN MÓVIL PARA TÉCNICOS DE CAMPO (4x4 FIELD SERVICE) (DURACIÓN: 4 SEMANAS)
- **Objetivos:**
  1. Aplicación especializada para teléfonos rugerizados de los técnicos que viajan en camionetas 4x4 a reparar máquinas en presas, minas y carreteras.
  2. Funcionamiento 100% offline con base de datos local SQLite.
  3. Inspección fotográfica previa y posterior con geolocalización GPS y marca de agua indeleble.
  4. Firma de recepción del operador en pantalla táctil con lápiz o dedo.
  5. Sincronización instantánea al recuperar señal de telefonía.
- **Entregables:**
  - App móvil instalada en la flota de servicio técnico de campo de TMD.

---

### FASE 19: PRONÓSTICO DE DEMANDA DE REPUESTOS CON INTELIGENCIA ARTIFICIAL (DURACIÓN: 3 SEMANAS)
- **Objetivos:**
  1. Algoritmo de Machine Learning que analiza el ritmo de trabajo promedio de la flota nacional de clientes (horas por mes) y predice qué repuestos se desgastarán en los próximos 90 días.
  2. Generación automática de órdenes de compra sugeridas a fábrica antes de que se agote el stock en Santo Domingo.
  3. Campañas preventivas personalizadas: envío de oferta al cliente de su kit de filtros justo dos semanas antes de que su equipo cumpla el ciclo de mantenimiento.
- **Entregables:**
  - Tablero de demanda predictiva e integración con el CRM comercial.

---

### FASE 20: PORTAL DE LICITACIONES PÚBLICAS Y GRANDES OBRAS ESTATALES (DURACIÓN: 3 SEMANAS)
- **Objetivos:**
  1. Centro de recursos para contratistas que participan en licitaciones del Ministerio de Obras Públicas (MOPC), INAPA, EGEHID y constructoras de infraestructura.
  2. Generador automático del dossier licitatorio:
     - Fichas técnicas selladas en PDF.
     - Cartas de representación oficial de fábrica LiuGong, JCB y Ammann.
     - Certificados de garantía local, stock de repuestos y compromiso de servicio técnico en el territorio dominicano.
- **Entregables:**
  - Generador de paquetes de licitación que acelera la adjudicación de contratos millonarios a clientes TMD.
