# MANUAL OPERATIVO PARA EL PERSONAL TÉCNICO Y ADMINISTRATIVO
## TECNOMAQUINARIAS DIESEL DOMINICANA (TMD) — SISTEMA ENTERPRISE V9
### Guía de Operaciones Diarias: Taller Central Km 22, Facturación DGII, Telemetría y Despachos

---

## 1. INTRODUCCIÓN Y POLÍTICA DE SEGURIDAD OPERATIVA

Este manual describe el funcionamiento paso a paso de los módulos del **Portal de Personal (Staff Command Center)** y **Taller Central** de TMD Dominicana.

### Credenciales de Demostración & Acceso Rápido:
- **Jefe de Taller & Patio Km 22 (Carlos Mendoza):** PIN `2222` (Rol `staff`).
- **Administrador General (Ing. Juan Liriano):** PIN `3333` (Rol `admin`).
- **Terminales Autorizadas:** Computadoras del patio Km 22, tabletas de taller y dispositivos autorizados de supervisores.

> **Importante:** Por normativa de ciberseguridad, las sesiones inactivas se cerrarán automáticamente tras **15 minutos sin interacción**. El sistema emitirá una alerta visual a los 14 minutos.

---

## 2. PROCEDIMIENTO DE INICIO DE SESIÓN EN TERMINAL

1. Abra el navegador e ingrese a: `http://localhost:3000/#/portal/login` (o dominio oficial `https://portal.tmd.com.do`).
2. En la pantalla táctil o con el ratón, presione sobre el perfil **"CARLOS MENDOZA (STAFF TÉCNICO)"** o digite directamente el código **`2222`** en el teclado numérico en pantalla.
3. El sistema valida las credenciales en la memoria criptográfica y abrirá inmediatamente el **Command Center de Personal**.

---

## 3. MÓDULO 1: FACTURACIÓN FISCAL & GENERACIÓN NCF (DGII)

### Emisión de Cotización / Factura Fiscal:
1. En la pestaña **"Facturación & NCF"**, localice la sección **"Secuenciador Fiscal DGII"**.
2. Seleccione el Tipo de Comprobante Fiscal requerido por el cliente:
   - **B01 (Crédito Fiscal):** Para constructoras, empresas mineras y personas jurídicas con RNC registrado.
   - **B02 (Consumidor Final):** Para particulares o compras sin requerimiento de crédito tributario.
   - **B14 (Regímenes Especiales):** Para empresas en zonas francas o proyectos con exención de ITBIS por ley.
   - **B15 (Gubernamental):** Para ventas al Ministerio de Obras Públicas (MOPC) o instituciones estatales.
3. El sistema incrementa automáticamente el correlativo y asegura la atomicidad (imposibilidad de duplicidad).
4. Verifique el desglose financiero:
   - Subtotal en Dólares (USD) o Pesos Dominicanos (DOP).
   - Cálculo automático de **ITBIS (18%)**.
   - Total facturado con sello de validez fiscal de 15 días.
5. Para entregar el documento al cliente:
   - Haga clic en **"Exportar PDF DGII"**: Se descargará instantáneamente un documento formal con membrete oficial de TMD, RNC emisor, datos del comprador, tabla de repuestos o maquinaria, y líneas de firma autorizada.
   - O haga clic en **"WhatsApp Fiscal"**: Se generará un mensaje pre-formateado con los datos de la factura listo para enviar al móvil del cliente.

---

## 4. MÓDULO 2: TALLER & GESTIÓN DE ÓRDENES DE SERVICIO FULLBAY

### Apertura y Seguimiento de Orden de Servicio:
1. Diríjase a la pestaña **"Taller & Servicios"**.
2. Verifique la lista de órdenes activas ordenadas por prioridad (**Rutinaria, Urgente, Emergencia Vial**).
3. Haga clic sobre la orden deseada (ejemplo: `WO-84920` - *Pala LiuGong 856H*).
4. Se abrirá el modal **"Detalle de Orden de Servicio & Diagnóstico Fullbay"**:
   - **Datos del Equipo:** Modelo, marca, número de serie (VIN) y horómetro actual al momento de ingresar al taller.
   - **Diagnóstico Técnico:** Descripción del problema detectado por el banco hidráulico o escáner electrónico.
   - **Piezas Instaladas:** Listado de repuestos OEM utilizados con código de pieza, cantidad y subtotal.
   - **Mano de Obra:** Horas hombre facturables aplicadas por el mecánico.
5. **Aprobación de Presupuesto:** Si el cliente aún no ha autorizado la reparación, presione el botón verde **"Aprobar Presupuesto & Iniciar Reparación"**.
6. **Descarga de Orden de Servicio en PDF:**
   - Haga clic en el botón amarillo **"Descargar Orden PDF"**: El sistema genera la **Orden de Servicio Oficial** en hoja membretada para entrega física al cliente o archivo del taller central.
   - Si necesita una copia rápida para pegar en el parabrisas de la máquina, use el botón **"Imprimir"**.

---

## 5. MÓDULO 3: MONITOREO DE TELEMETRÍA LIVELINK™ CAN-BUS

### Diagnóstico Satelital en Tiempo Real:
1. En la barra superior, seleccione la pestaña **"Flota & LiveLink"**.
2. En la columna izquierda, verá el listado de toda la flota registrada de los clientes con su estatus de motor (**En Marcha, Ralentí, Apagado**).
3. Seleccione una unidad para inspeccionar su telemetría profunda:
   - **Panel General:** Horómetro acumulado, nivel de combustible diésel, consumo en litros/hora y voltaje de batería (24V).
   - **Temperaturas:** Indicador térmico de refrigerante de motor (temperatura nominal 85°C–98°C) y aceite hidráulico (límite seguro 80°C).
   - **Geocercas de Seguridad:** Estatus de ubicación dentro de la cantera o mina pactada.
   - **Códigos DTC de Diagnóstico:** Lista de alarmas activas reportadas por la computadora del motor (ej: `DTC-2384` - *Baja Presión en Circuito Secundario*).
4. **Acción de Emergencia / Despacho Fullbay:**
   - Si una máquina presenta una falla crítica (temperatura superior a 102°C o baja presión de aceite), presione el botón **"Despachar Cuadrilla Fullbay"**. El sistema abre de inmediato una orden de taller móvil y asigna una camioneta 4x4.
5. **Exportación de Reporte Técnico:**
   - Presione el botón **"Reporte PDF"** en la barra de herramientas del equipo: Se generará un informe técnico completo con la matriz de lecturas de sensores y códigos DTC para presentar al departamento de mantenimiento del cliente.

---

## 6. MÓDULO 4: DESPACHOS DE REPUESTOS Y PASES DE SALIDA EN PATIO KM 22

1. En la pestaña **"Pedidos & Despachos"**, revise las órdenes de piezas listas para retiro en el almacén del Km 22.
2. Compruebe que la orden figure con estatus **"En Preparación"** o **"Listo para Retiro"**.
3. Haga clic en **"Ver Detalles & Guía"**:
   - Verifique los números de parte OEM de los repuestos físicos entregados contra el listado en pantalla.
   - Presione **"Descargar Factura PDF"** para entregar el comprobante con valor fiscal al chofer o mensajero del cliente.
4. Una vez entregada la mercancía en el mostrador de repuestos, actualice el estatus a **"Entregado / Despachado"**.

---

## 7. PROTOCOLO DE CONTINGENCIA ANTE FALLAS DE RED O INTERRUPCIÓN ELÉCTRICA

1. **Modo de Respaldo Local (PWA Offline):** Si ocurre una interrupción de internet en la Autopista Duarte, el sistema continuará funcionando en modo local utilizando los datos almacenados en el navegador.
2. **Generación de Fichas sin Conexión:** Las plantillas de PDF funcionan 100% en el procesador de la computadora local sin depender de servidores externos.
3. **Mesa de Soporte de TI Interno:** Ante cualquier anomalía técnica o bloqueo de clave maestra, contacte a la Gerencia de Sistemas al teléfono **+1 (809) 560-1234** o vía correo a `soporte@tmd.rd`.
