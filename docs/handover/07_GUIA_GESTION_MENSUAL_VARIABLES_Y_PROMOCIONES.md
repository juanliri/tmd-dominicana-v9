# GUÍA OPERATIVA: GESTIÓN MENSUAL DE VARIABLES, BANNERS Y TASAS
## TECNOMAQUINARIAS DIESEL DOMINICANA (TMD) — SISTEMA ENTERPRISE V9
### Manual para Gerentes de Operaciones y Marketing: Actualizaciones sin Programadores ni Redespliegues

---

## 1. INTRODUCCIÓN AL SISTEMA DINÁMICO DE GESTIÓN

En la industria de maquinaria pesada y repuestos en la República Dominicana, existen variables comerciales críticas que cambian constantemente:
- La **Tasa de Cambio del Dólar Estadounidense (DOP / USD)** fijada por el Banco Central (BCRD).
- Las **Tasas de Interés de Financiamiento (Leasing)** negociadas con entidades bancarias (Banco Popular, Banco BHD, Banreservas).
- Los **Banners y Marquesinas de Campañas Promocionales** (Feria Agropecuaria, Bono Minero, Temporada de Ciclones).
- Los **Cupones de Descuento Mensuales** para los miembros del Club TMD Pro.
- Los **Horarios de Atención y Teléfonos de Auxilio Vial** en días feriados (Semana Santa, Navidad).

Para resolver esto sin tener que llamar a un desarrollador de software ni esperar redespliegues de código en la nube, el sistema TMD v9 incluye el **Gestor de Variables Mensuales en Vivo (`MonthlyBusinessConfigModal`)**.

---

## 2. CÓMO ACCEDER AL GESTOR DE VARIABLES

1. Ingrese al panel administrativo desde cualquier computadora o tableta autorizada:
   - Ruta directa: `http://localhost:3000/#/admin` (o en producción `https://tmd.com.do/#/admin`).
2. En la barra superior del panel de control, localice el botón:
   - **`[⚙ VARIABLES MENSUALES]`** (ubicado junto al botón de Carga Masiva).
3. Al hacer clic, se desplegará instantáneamente la ventana modal segura: **"Gestor de Variables Mensuales & Promociones TMD"**.

---

## 3. PASO A PASO: ACTUALIZACIÓN DE VARIABLES COMUNES

### CASO A: El Banco Central incrementa la tasa del dólar (ej: de 60.50 a 61.20)
1. En la sección **"1. Variables Financieras & Divisas"**, ubique el campo **"Tasa Oficial DOP/USD"**.
2. Escriba el nuevo valor numérico (ej: `61.20`).
3. Presione el botón amarillo **"Guardar y Publicar en Todo el Sitio"**.
4. **Efecto Inmediato:** Todos los precios en pesos dominicanos del catálogo, las cotizaciones en proceso y la calculadora de cuotas actualizarán sus cálculos automáticamente al nuevo tipo de cambio sin recargar la página.

---

### CASO B: Banco Popular o BHD lanzan una feria con tasa preferencial del 8.5%
1. En el campo **"Tasa Financiamiento (% Anual)"**, cambie el valor de `9.95` a `8.50`.
2. Si el banco permite financiar hasta 72 meses, cambie **"Plazo Máximo Leasing"** a `72`.
3. Presione **"Guardar y Publicar en Todo el Sitio"**.
4. **Efecto Inmediato:** La calculadora de financiamiento disponible para los clientes en las fichas de maquinaria recalculará las cuotas mensuales reducidas, estimulando el cierre de contratos de leasing.

---

### CASO C: Iniciar una Campaña Promocional Nueva (ej: "Bono Constructor 2026")
1. En la sección **"2. Campaña del Mes"**:
   - Marque la casilla **"Banner Activo"**.
   - **Titular:** Digite el nombre de la campaña, por ejemplo:
     `BONO CONSTRUCTOR RD: 10% DE DESCUENTO EN RETROEXCAVADORAS JCB`
   - **Subtítulo:** Escriba las condiciones o beneficios adicionales, por ejemplo:
     `Financiamiento pre-aprobado en 24 horas y primer servicio de 250 horas gratis en patio Km 22.`
   - **Enlace de Acción:** Escriba la ruta donde desea dirigir al usuario, por ejemplo: `#/machinery`.
2. Presione **"Guardar y Publicar en Todo el Sitio"**.
3. **Efecto Inmediato:** La marquesina superior y el banner destacado del inicio mostrarán el anuncio a todos los visitantes.

---

### CASO D: Renovar el Cupón de Descuento para Clientes Pro-Member
1. En la sección **"3. Beneficios & Cupones Club Pro-Member"**:
   - Cambie el código del cupón activo del mes, por ejemplo: de `TMDPRO2026` a `PROVERANO26`.
   - Ajuste los porcentajes de descuento si aplica (ej: 15% en Repuestos y 20% en Mano de Obra de Taller).
2. Presione **"Guardar y Publicar en Todo el Sitio"**.
3. **Efecto Inmediato:** Cuando un contratista registrado use el nuevo código en el carrito o en taller, el sistema aplicará automáticamente el descuento pactado.

---

### CASO E: Modificar Horarios por Feriado o Asignar Nuevo Teléfono de Auxilio 24/7
1. En la sección **"4. Horarios & Números de Emergencia 24/7"**:
   - Si cambia la camioneta de auxilio vial de turno, ingrese el nuevo número de celular en **"Línea Auxilio Vial & Emergencias"** (ej: `+1 (809) 560-1234`).
   - Actualice el horario para días festivos en **"Horarios de Atención en Patio Km 22"** (ej: `Semana Santa: Taller cerrado de Jueves a Domingo. Auxilio vial activo por WhatsApp`).
2. Presione **"Guardar y Publicar en Todo el Sitio"**.

---

## 4. MECANISMO DE RESTABLECIMIENTO (BOTÓN DE PÁNICO)

Si por error algún usuario ingresa datos erróneos o tasas distorsionadas:
1. En la esquina inferior izquierda del modal, presione el botón **"Restablecer Valores Base"**.
2. El sistema solicitará confirmación y restaurará inmediatamente los valores oficiales de fábrica certificados por la Gerencia General de TMD.

---

## 5. RESUMEN DE SEGURIDAD Y AUDITORÍA

- Cada vez que alguien guarda cambios en el gestor, el sistema registra en la base de datos la **fecha y hora exacta** y el **nombre del usuario administrador** que realizó la modificación.
- Esto garantiza total control interno y evita discrepancias entre los departamentos de Ventas, Contabilidad y Gerencia.
