# 10. AUDITORÍA ENTERPRISE DEL PORTAL Y REDISEÑO MAESTRO DE NAVEGACIÓN
**TMD Dominicana v9 — Sistema Operativo de Maquinaria Pesada & Portal de Clientes**  
**Fecha de Implementación:** Octubre 2026 | **Versión:** 9.4.0 Enterprise Command Edition  
**Ambiente:** Híbrido (Google Cloud Run + Supabase + Vercel Edge + PWA Offline)

---

## 1. RESUMEN EJECUTIVO Y DIAGNÓSTICO DE LA PROBLEMÁTICA PREVIA

En la auditoría exhaustiva realizada sobre el módulo de Portal (`#/portal`) se identificaron fricciones ergonómicas críticas que impedían una experiencia fluida de nivel corporativo:

### 1.1 Colisión de Doble Encabezado (Header Stacking)
- **Problema:** Al autenticarse en el portal (`#/portal`), el encabezado de mercadeo general (`Header.tsx`, 60px) y el encabezado del portal (`PortalShell.tsx`, 48px) se montaban uno encima del otro.
- **Impacto:** Confusión visual, pérdida de 108px de altura vertical y redundancia de controles (dos selectores de moneda USD/DOP, dos accesos de usuario).
- **Solución Implementada:** Se modificó `Header.tsx` para detectar rutas de portal (`#/portal*`) con sesión activa y suprimir el encabezado de mercadeo por completo (`return null`). En su lugar, el portal opera ahora con una **Barra de Comando Unificada de 56px**.

### 1.2 "Dead Zone" Vertical de 480px
- **Problema:** En `StaffCommandCenter.tsx` y `ClientDashboard.tsx`, cada sub-pestaña (como Cotizaciones, Órdenes de Taller, Telemetría LiveLink o Inventario) cargaba un banner de perfil de usuario de 95px, 4 tarjetas de métricas KPI gigantes de 140px, más las barras de pestañas e indicadores.
- **Impacto:** Los operadores y clientes debían desplazarse 480 píxeles hacia abajo antes de poder ver una sola fila de cotización o una orden de servicio.
- **Solución Implementada:**
  - El perfil completo y las tarjetas KPI ahora se aíslan exclusivamente en la vista de inicio (`command_center` para Staff, `overview` para Clientes).
  - Al hacer clic en cualquier herramienta operativa (`quotes`, `orders`, `livelink`, `inventory`, `integrations`), el sistema muestra una **Barra de Acción de Área de Trabajo compacta de 40px** con título, contador de registros, búsqueda contextual y botón de acción directa (`+ Nueva Proforma`, `+ Nueva Orden`), entregando el **100% de la altura de la pantalla a los datos de trabajo**.

### 1.3 Menú Desorganizado e Informal
- **Problema:** Las opciones de navegación estaban agrupadas de forma plana y arbitraria, mezclando finanzas, telemetría y configuración en una sola lista sin jerarquía empresarial.
- **Solución Implementada:** Reorganización del menú lateral y móvil en **4 Departamentos Empresariales TMD**.

---

## 2. EL NUEVO MODELO DE NAVEGACIÓN POR DEPARTAMENTOS

El sistema adopta la estructura funcional real de un concesionario de maquinaria pesada:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TMD DOMINICANA / PORTAL TMD [Km 22 Duarte] [🔍 Buscar (Ctrl+K)] [USD|DOP]   │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ 🏢 VENTAS & CRM   │                                                         │
│   • Cotizaciones  │ [ Cotizaciones ] [ 🔍 Filtrar ]  [ + Nueva Proforma ]   │
│   • Mis Compras   ├─────────────────────────────────────────────────────────┤
│   • B2B Pro Club  │ ID      CLIENTE          EQUIPO          ESTADO   TOTAL │
│                   │ Q-2026  Constructora B   JCB 3DX Eco     Enviado  $85K  │
│ ⚙️ OPERACIONES    │ Q-2025  Ing. Pérez SRL   Kubota U-35     Aprobado $62K  │
│   • Taller        │                                                         │
│   • Flujo Taller  │ (Vista directa sin necesidad de scroll vertical)        │
│   • Repuestos     │                                                         │
│   • Fichas Técn.  │                                                         │
│                   │                                                         │
│ 🛰️ TELEMETRÍA     │                                                         │
│   • LiveLink GPS  │                                                         │
│   • Patio Km 22   │                                                         │
│                   │                                                         │
│ 📊 ADMINISTRACIÓN │                                                         │
│   • Integraciones │                                                         │
│   • Métricas KPI  │                                                         │
│   • Auditoría     │                                                         │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

### Detalle de Departamentos:

1. **🏢 Ventas & CRM**
   - **Cotizaciones Proforma (`quotes`):** Emisión y seguimiento con NCF gubernamental (B01, B02, B14, B15), cálculo de ITBIS (18%) y despacho vía WhatsApp con PDF integrado.
   - **Compras & Pedidos (`purchases`):** Histórico de compras con estado de entrega e integración a despacho de almacén.
   - **TMD B2B Pro Club (`pro`):** Líneas de crédito, descuentos por volumen y condiciones mayoristas exclusivas.

2. **⚙️ Taller & Operaciones**
   - **Órdenes de Trabajo (`orders`):** Conectadas con Fullbay Heavy-Duty Shop Management para control de bahías, mecánicos asignados y estados de reparación.
   - **Flujo de Taller (`workflow`):** Tablero visual interactivo del estado de máquinas en servicio.
   - **Inventario & Stock (`inventory`):** Disponibilidad en tiempo real de repuestos originales (Kubota, JCB, Yanmar, LiuGong).
   - **Documentación Técnica (`docs`):** Manuales de servicio, diagramas hidráulicos y fichas de mantenimiento preventivo.

3. **🛰️ Flota & Telemetría**
   - **LiveLink & Telemetría (`livelink`):** Monitorización satelital en tiempo real de horómetros, nivel de combustible, códigos de falla DTC y geocercas activas.
   - **Patio Km 22 Duarte (`patio`):** Inspección virtual 360°, inventario físico listo para entrega inmediata y cámaras de exhibición.

4. **📊 Finanzas & Administración**
   - **Integraciones ERP (`integrations`):** Monitoreo del estado de sincronización con Google Cloud Run, Fullbay, LiveLink, QuickBooks Online, Method:CRM, Microsoft Outlook 365 y DGII.
   - **Métricas & KPIs (`metrics`):** Gráficos de facturación, cumplimiento de órdenes y márgenes operativos.
   - **Gestión de Usuarios (`users`):** Control de roles (Admin, Vendedor, Mecánico, Cliente Contratista).
   - **Auditoría & Seguridad (`audit`):** Trazabilidad de accesos, cambios de precios y eventos de seguridad.

---

## 3. ARQUITECTURA DE LA BARRA DE COMANDO (ENTERPRISE SHELL)

La barra superior (`PortalShell.tsx`) se consolidó a exactamente **56px de altura fija**, incorporando:

1. **Brand Identifier con Badge de Rol:** Logo TMD con indicación visual del perfil (`ADMIN`, `VENTAS`, `TALLER`, `CONTRATISTA`).
2. **Indicador de Sede Operativa:** `Km 22 Duarte · Online` con pulso esmeralda confirmando conexión con el nodo central.
3. **Buscador Global Inteligente (Ctrl+K):** Acceso instantáneo a cotizaciones, números de chasis (VIN), códigos de repuestos o RNC fiscal.
4. **Botón de Acción Rápida Contextual:**
   - Para Staff/Admin: `+ Nueva Proforma`.
   - Para Clientes: `+ Solicitar Taller`.
5. **Selector de Moneda Dinámica:** Conmutador instantáneo `USD | DOP` con tasa oficial del Banco Central de la República Dominicana (BCRD) integrada.
6. **Bóveda Técnica PWA:** Indicador de estado offline para técnicos en campo sin cobertura celular.
7. **Centro de Alertas:** Campana interactiva con contador de notificaciones de telemetría y cambios de estado.
8. **Selector de Tema:** Alternador ergonómico `Día / Noche` para trabajo en oficina o exteriores bajo luz solar.
9. **Píldora de Perfil y Salida Segura:** Muestra el nombre y avatar del usuario con botón de cierre de sesión en un solo clic.

---

## 4. MATRIZ DE VISIBILIDAD POR ROL (RBAC)

| Módulo / Pestaña | Clientes Contratistas | Técnicos de Taller | Asesores de Ventas | Administradores |
| :--- | :---: | :---: | :---: | :---: |
| **Inicio / KPIs** | Resumen Flota | Bahías Asignadas | Metas Mensuales | Consola Ejecutiva Completa |
| **Cotizaciones Proforma** | Sus Cotizaciones | Solo Lectura | Gestión Completa | Aprobación & Descuentos |
| **Órdenes de Trabajo** | Estado de sus Equipos | Ejecución & Fichas | Estado de Entrega | Asignación de Costos & NCF |
| **Telemetría LiveLink** | Su Flota Registrada | Diagnóstico Códigos | Ubicación para Entrega | Monitoreo Global de Flota |
| **Inventario Repuestos** | Catálogo & Precios | Consumo de Repuestos | Cotización de Piezas | Ajustes de Stock & Costos |
| **Integraciones ERP** | Oculto | Oculto | Oculto | **Acceso Total & Diagnóstico** |
| **Auditoría & Usuarios** | Oculto | Oculto | Oculto | **Acceso Total** |

---

## 5. ERGONOMÍA MÓVIL Y TABLET (RESPONSIVE ADAPTATION)

Para técnicos e ingenieros en campo (tabletas Rugged o smartphones):
- **Barra Inferior Táctil (PortalBottomBar):** Acceso directo a `Inicio`, `Cotizaciones`, `Taller`, `LiveLink` y un botón `Más` que despliega el cajón con los 4 departamentos completos.
- **Acciones con un Pulgar:** Todos los botones de acción principal tienen un área táctil mínima de 44x44px conforme a estándares WCAG 2.1 AAA.
- **Cero Solapamiento:** Las migajas de pan (`Breadcrumbs`) colapsan automáticamente en pantallas pequeñas, evitando el desbordamiento horizontal.

---

## 6. VALIDACIÓN TÉCNICA Y COMPILACIÓN

- **Chequeo de Tipos TypeScript:** `npx tsc --noEmit` completado con **0 errores**.
- **Compilación de Producción:** `npm run build` generado exitosamente en **3.95s** transformando 3,671 módulos con salida optimizada a `dist/`.
- **Pruebas de Navegación E2E (Playwright):**
  - Verificada la eliminación total del encabezado doble.
  - Verificada la respuesta del menú lateral y la visibilidad inmediata de tablas de datos.
  - Verificada la pestaña "Integraciones ERP" mostrando los conectores de Google Cloud Run, Fullbay, LiveLink, QuickBooks, Method:CRM y Outlook 365.
- **Sincronización de Respaldo:** Código fuente y documentación replicados en la unidad de respaldo física `F:\TMD_BACKUP`.
