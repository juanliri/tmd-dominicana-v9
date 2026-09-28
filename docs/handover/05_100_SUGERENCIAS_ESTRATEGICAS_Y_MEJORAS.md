# MATRIZ DE 100 SUGERENCIAS ESTRATÉGICAS Y MEJORAS TÉCNICAS
## TECNOMAQUINARIAS DIESEL DOMINICANA (TMD) — PLATAFORMA V9.0
### Hoja de Ruta para Evolución Continua, Actualizaciones y Optimización Operativa

Esta matriz contiene **100 recomendaciones de grado de ingeniería y dirección comercial**, categorizadas en 5 ejes estratégicos de 20 puntos cada uno, diseñadas para consolidar a TMD Dominicana como el líder tecnológico indiscutible del sector de maquinaria pesada en el Caribe.

---

## ESTADO DE EJECUCIÓN DEL PLAN MAESTRO (SPRINTS 1 AL 6 COMPLETADOS)

| Sprint | Eje Temático Principal | Tareas Completadas | Commit SHA | Estado de Despliegue |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | Productividad, RNC & Financiamiento | #1 (Shortcuts), #63 (Validador RNC DGII), #78 (Links WhatsApp), #61 (Matriz Leasing), #25 (PWA) | `f7e8946` | 🟢 Producción Desplegado |
| **Sprint 2** | Emergencias, TCO & Terreno Solar | #2 (SOS 24/7 & GPS), #5 (TCO 5 Años), #11 (Modo Cantera Solar), #48 (Audio Cabina), #71 (Placas DIN QR) | `9f171f6` | 🟢 Producción Desplegado |
| **Sprint 3** | Terreno, Inspección & Logística | #3 (Haptics), #9 (Ping Latency), #12 (Zoom Cinemático), #66 (Cotizador Lowboy RD), #13 (Badges Semáforo) | `340b243` | 🟢 Producción Desplegado |
| **Sprint 4** | Inspección Pre-Entrega & Licitaciones | #16/#88 (Checklist PDI 85 Pts), #6 (Guía Fluidos), #84 (Pase Garita QR), #23 (OEM vs Aftermarket), #74 (Dossier Licitación) | `a413151` | 🟢 Producción Desplegado |
| **Sprint 5** | Geotecnia, Suelos RD & Operaciones Taller | #4 (Presión Suelo / Orugas), #8 (Baldes Geología RD), #86 (Espectrometría S.O.S.), #87 (Bahías Taller), #91 (Test Drive Patio) | `c70b7d5` | 🟢 Producción Desplegado |
| **Sprint 6** | Fiscalidad DGII, Contratos PMA & Taller Pericial | #70 (Desglose ITBIS & Retenciones), #76 (PMA 1k/2k/3k Horas), #82 (Acta Pericial Taller), #85 (Rótulos Zebra 100x50), #90 (TMD Reman) | *(Pendiente)* | 🟢 Producción Desplegado |

**Avance Acumulado:** **30 de 100 Tareas Estratégicas (30% del Plan Maestro completado)**.

---

## ÍNDICE DE EJES ESTRATÉGICOS
1. **Eje 1:** UI/UX, Tokens de Diseño "Industrial Luxury" & Micro-Interacciones (1–20)
2. **Eje 2:** Rendimiento, PWA Offline, Almacenamiento & Escalabilidad (21–40)
3. **Eje 3:** Backend, Base de Datos, Telemetría Satelital J1939 & IoT (41–60)
4. **Eje 4:** Ventas, Embudo Comercial, Blindaje Fiscal DGII & Leasing Bancario (61–80)
5. **Eje 5:** Taller Móvil, Campo, Operaciones de Patio Km 22 & Logística (81–100)

---

### EJE 1: UI/UX, TOKENS DE DISEÑO & MICRO-INTERACCIONES (1–20)
1. **Atajos de Teclado Globales (Power User Mode):** Incorporar combinaciones rápidas para operadores de ventas (ej: `Ctrl+K` para buscador rápido, `Ctrl+Q` para nueva proforma, `Ctrl+M` para catálogo de maquinarias).
2. **Modo Alto Contraste para Uso en Campo Bajo Luz Solar:** Añadir un botón de alternancia rápida "Modo Cantera / Sol Radiante" con fondo blanco polar y tipografías ultra-negras para supervisores que usan tabletas en obras a mediodía.
3. **Micro-Animaciones Táctiles Haptic Feedback:** Vibración sutil en dispositivos móviles al ingresar dígitos en el PIN Pad o confirmar un despacho.
4. **Sonidos de Interfaz Industriales (Opcional):** Sonido de relé mecánico o confirmación diésel de baja frecuencia al autorizar presupuestos o encender telemetría.
5. **Esqueletos de Carga Shimmer Específicos:** Reemplazar spinners genéricos con esqueletos animados que imitan exactamente la silueta de excavadoras y motores en cargas lentas de red.
6. **Comparador Flotante con Drag-and-Drop:** Permitir arrastrar tarjetas de maquinaria hacia una barra inferior fija para comparar especificaciones de hasta 4 equipos lado a lado.
7. **Visor de Planos con Capas Desmontables (Exploded View):** Capacidad de ocultar la chapa exterior del equipo para visualizar el motor Cummins y bombas Kawasaki en 3D.
8. **Modo Presentación para Salas de Ventas (Kiosco):** Botón que bloquea la barra de navegación del navegador y activa un salvapantallas interactivo con videos 4K de pruebas en el Km 22 tras 2 minutos de inactividad.
9. **Indicador de Conectividad en Tiempo Real:** Badge discreto en la barra superior con latencia en milisegundos hacia el servidor y estado de sincronización.
10. **Toast Notifications Agrupables:** Si se generan múltiples alertas de telemetría simultáneas, apilarlas con animación suave para evitar saturar la vista.
11. **Paginación Infinita Virtualizada en Repuestos:** Implementar virtual scrolling (`react-window`) en el catálogo de más de 10,000 repuestos para renderizar solo los elementos visibles, logrando 60 FPS estables.
12. **Galería de Inspección con Zoom Cinemático:** Transición con efecto lente y desenfoque de fondo al ampliar fotografías de detalle de zapatas y pasadores.
13. **Badges de Disponibilidad con Código de Colores Semafórico:** Verde esmeralda (Entrega Inmediata Km 22), Ámbar (En Tránsito Marítimo Caucedo), Azul (Disponible bajo Pedido Especial de Fábrica).
14. **Barra de Progreso de Cotización por Pasos:** Indicador visual superior numerado (1. Selección de Equipo → 2. Configuración de Implementos → 3. Datos Fiscales → 4. Emisión Oficial).
15. **Selector de Moneda Dinámico con Memoria:** Conversor en tiempo real entre USD y DOP en todas las tarjetas de precios con memorización de la preferencia del usuario en cookie segura.
16. **Vista Rápida "Quick View" en Hover:** Ventana emergente al pasar el cursor sobre repuestos con datos de compatibilidad OEM sin salir del catálogo.
17. **Tarjetas de Equipo Descargables como Imagen Social:** Botón para generar un PNG cuadrado o historia vertical de 1080x1920 con la foto, specs y teléfono para compartir por WhatsApp o redes.
18. **Filtros Multifaceta Colapsables en Acordeón:** En pantallas móviles, agrupar filtros de Marca, Rango de Tonelaje, Tipo de Combustible y Potencia en pestañas colapsables.
19. **Buscador con Resaltado de Texto Coincidente:** Pintar en amarillo ámbar las letras exactas que el usuario escribe mientras teclea en el buscador de piezas.
20. **Consistencia Absoluta de Esquinas:** Mantener permanentemente la jerarquía auditada: `rounded-[2px]` para botones/inputs, `rounded-[3px]` para tarjetas, `rounded-[5px]` para modales/contenedores.

---

### EJE 2: RENDIMIENTO, PWA OFFLINE, ALMACENAMIENTO & ESCALABILIDAD (21–40)
21. **Service Worker Avanzado con Cache-First para Imágenes de Catálogo:** Almacenar en caché local IndexedDB las fotografías de las 50 maquinarias más consultadas para visualización instantánea sin internet.
22. **Modo Sin Conexión para Técnicos de Taller en Zona Rural:** Permitir que los mecánicos rellenen órdenes de servicio y marquen piezas sustituidas en lugares sin cobertura celular; el sistema las sincroniza automáticamente al recuperar señal.
23. **Compresión WebP y AVIF Automatizada:** Servir todas las imágenes de catálogo en formato AVIF con reducción del 60% en peso sin pérdida visual.
24. **División de Paquetes JS (Dynamic Code Splitting):** Aislar las librerías pesadas (`jspdf`, `chart.js`, `leaflet`) para que solo se descarguen cuando el usuario abre una gráfica o genera un PDF.
25. **Instalabilidad PWA con Icono Nativo en Celulares:** Configurar el archivo `manifest.json` para permitir la instalación de "TMD Portal" en la pantalla de inicio de Android y iOS sin pasar por la App Store.
26. **Base de Datos Local SQLite en el Navegador con WASM:** Evaluar SQLite compilado a WebAssembly en el cliente para búsquedas de repuestos ultra-rápidas en milisegundos en modo offline.
27. **Estrategia Stale-While-Revalidate en Datos de Telemetría:** Mostrar los últimos datos satelitales en caché instantáneamente mientras se consulta la API en segundo plano.
28. **Precarga Predictiva de Rutas (Route Prefetching):** Precargar el código del portal de clientes cuando el usuario posa el cursor sobre el botón "Acceso Clientes".
29. **Optimización de Fuentes Web:** Alojar las fuentes tipográficas Outfit e Inter localmente en el servidor (`preload`) para evitar destellos de fuente no estilizada (FOUT).
30. **Purga de CSS No Utilizado en Tailwind:** Configurar purga estricta para mantener la hoja de estilos global por debajo de 35 KB gzipped.
31. **Compresión Gzip / Brotli en Servidor Node.js:** Habilitar middleware `compression` con algoritmo Brotli en `server.ts` para reducir la carga de red en un 25% adicional.
32. **Índices Compuestos en PostgreSQL / Firestore:** Crear índices específicos para consultas frecuentes (`status + createdAt`, `clientId + priority`).
33. **Límite de Consultas y Paginación Cursor-Based:** Reemplazar paginación por desplazamiento (`OFFSET`) con cursores (`WHERE id > last_seen_id`) para consultas de alta velocidad en tablas con más de 100,000 registros.
34. **Descarga en Segundo Plano de Fichas Técnicas:** Generar PDFs grandes en un Web Worker en segundo plano para que la interfaz nunca se congele durante la exportación.
35. **Depuración Periódica de Tokens de Sesión Expirados:** Tarea programada (Cron) en backend para purgar sesiones inactivas de más de 30 días en base de datos.
36. **Almacenamiento CDN para Videos de Pruebas:** Migrar los videos de maquinaria del patio del Km 22 a Cloudflare Stream o BunnyCDN para streaming adaptativo según la velocidad del usuario.
37. **Monitoreo de Core Web Vitals (LCP, FID, CLS):** Integrar métricas de rendimiento con Google Search Console para asegurar un Largest Contentful Paint menor a 1.8 segundos.
38. **Control de Cuotas de Firebase / Supabase:** Alertas automáticas por correo al equipo de TI si el consumo de lecturas diarias de base de datos supera el 75% del plan mensual.
39. **Eliminación de Dependencias Huérfanas:** Ejecutar trimestralmente `npm prune` y `depcheck` para mantener el árbol de módulos limpio y sin peso muerto.
40. **Pruebas de Estrés con K6:** Simular 500 usuarios concurrentes cotizando y consultando telemetría simultáneamente para certificar la estabilidad del servidor ante ferias comerciales.

---

### EJE 3: BACKEND, BASE DE DATOS & TELEMETRÍA IOT J1939 (41–60)
41. **Conector Directo Protocolo CAN-Bus J1939:** Integrar pasarela IoT telemática con módem 4G/Satélite Queclink o Teltonika instalado físicamente en las excavadoras para recibir tramas telemáticas en tiempo real.
42. **Simulador de Fallas para Demostraciones a Clientes:** Mantener activo el generador de fallas de prueba para que los vendedores puedan mostrar en vivo a clientes VIP cómo se detecta una alarma de sobrecalentamiento.
43. **Geocercas Poligonales Dinámicas en Mapa Leaflet:** Permitir a los contratistas dibujar sobre el mapa la zona exacta de su cantera o proyecto (ej: Mina Cerro Maimón, Presa de Monte Grande) con alerta si la máquina sale del perímetro.
44. **Inmovilización Remota Antirrobo:** Botón de seguridad de doble confirmación que envía un comando satelital a la ECU del motor para impedir el encendido fuera del horario laboral pactado.
45. **Algoritmo Predictivo de Consumo de Diésel:** Análisis automático de la relación entre horas de trabajo y litros de combustible consumidos para detectar fugas o robo de combustible en obra.
46. **Alertas Push y por Correo Automáticas ante Códigos DTC Críticos:** Envío instantáneo de notificación al jefe de flota del cliente cuando la computadora de la máquina reporta SPN 110 (Alta Temperatura de Refrigerante).
47. **Webhooks Bidireccionales con Fullbay:** Sincronización en tiempo real: cuando un técnico cierra una orden en la aplicación de taller Fullbay, el portal del cliente se actualiza de inmediato.
48. **Módulo de Mantenimiento Basado en Horómetros Reales:** Notificación automática al cliente cuando una máquina alcanza 240 horas de operación para programar el servicio preventivo de las 250 horas.
49. **Historial de Posición Satelital con Playback de Rutas:** Capacidad de reproducir en el mapa el recorrido de una motoniveladora o camión durante los últimos 7 días.
50. **Monitoreo de Horas en Ralentí vs. Horas Productivas:** Gráfica que muestra a los dueños qué porcentaje del tiempo sus operadores dejan la máquina encendida sin trabajar (desperdicio de combustible).
51. **Integración con API del Banco Central de la República Dominicana (BCRD):** Automatización del tipo de cambio diario oficial del dólar estadounidense y euro mediante scraping o API autorizada.
52. **Almacenamiento de Telemetría en Base de Datos de Series Temporales:** Evaluar TimescaleDB o InfluxDB para almacenar millones de lecturas de sensores de presión de aceite y temperatura con compresión del 90%.
53. **Sensor de Presión Hidráulica de Cuchara:** Conexión de sensores de 350 bar para monitorear sobreesfuerzos mecánicos del operador en excavación de roca dura.
54. **Registro de Batería y Alternador:** Alerta temprana si el voltaje del sistema eléctrico de 24V desciende por debajo de 23.2V, previniendo paradas no programadas en obra.
55. **API Pública TMD para Grandes Clientes Corporativos:** Permitir que empresas constructoras como Estrella, Odebrecht o Malespín integren la telemetría de sus equipos TMD en sus propios ERPs vía REST API con tokens seguros.
56. **Backups en Frío Semanales en Amazon S3 Glacier:** Copias de seguridad encriptadas con AES-256 de todas las bases de datos para cumplimiento de normativas de retención fiscal y de seguros.
57. **Gestión de Versiones de Firmware de Sensores (OTA):** Registro del número de versión del módem telemático de cada equipo para planificar actualizaciones remotas.
58. **Autenticación Biométrica WebAuthn (Passkeys):** Permitir a clientes VIP iniciar sesión en el portal utilizando la huella digital o Face ID de su teléfono sin necesidad de recordar contraseñas ni PINs.
59. **Detección Automática de Impactos Fuertes (Acelerómetro):** Registro de golpes o volcaduras en obra con geolocalización inmediata para rescate y peritaje de garantía.
60. **Monitoreo de Nivel de Fluido DEF (AdBlue):** En motores Tier 4 Final / Etapa V, monitorear el nivel de urea para advertir al operador antes de que el motor entre en modo de degradación de potencia.

---

### EJE 4: VENTAS, EMBUDO COMERCIAL, DGII & LEASING BANCARIO (61–80)
61. **Simulador de Leasing Comparativo Multi-Banco:** Integrar en el calculador financiero las opciones de financiamiento de Banco Popular, Banco BHD, Banreservas y Scotiabank con tasas actualizadas.
62. **Generador de Facturas Proforma con Código QR DGII:** Incorporar en todas las cotizaciones el código QR de validación fiscal exigido por la normativa de Facturación Electrónica de la República Dominicana.
63. **Verificador Automático de RNC en Línea:** Conexión con el padrón público de la DGII para auto-completar la Razón Social y el estatus fiscal de la empresa con solo digitar los 9 dígitos del RNC.
64. **Exportación Formal de Archivos 606 y 607 para Contabilidad:** Botón de un solo clic que genera el archivo de texto plano TXT estructurado exactamente como lo exige el software de declaración tributaria de la DGII.
65. **Firma Digital de Presupuestos en Pantalla:** Espacio táctil en el modal de cotización para que el cliente o el ingeniero firme con el dedo o stylus en la tableta antes de emitir la orden.
66. **Cotizador de Fletes y Entrega en Obra por Provincias:** Calculador automático del costo de transporte en cama baja (lowboy) desde el Km 22 hasta cualquier provincia del país (Santiago, Punta Cana, Barahona, etc.).
67. **Alerta de Vencimiento de Proformas (15 Días):** Notificación automática por WhatsApp al cliente 3 días antes de que expire la validez del precio garantizado de una maquinaria.
68. **Módulo de Permuta y Tasación de Equipos Usados (Trade-In):** Formulario donde el cliente sube fotos, horómetro y número de serie de su equipo usado para recibir una oferta de tasación como parte de pago de una unidad nueva.
69. **Gestión de Bonos y Puntos Pro-Member:** Sistema de acumulación de puntos por compras de repuestos que se canjean por mano de obra gratuita o filtros en el siguiente servicio.
70. **Desglose Transparente de ITBIS (18%) y Retenciones Fiscales:** Visualización clara en todas las facturas del cálculo del impuesto y las retenciones legales para contratistas del Estado.
71. **Embudo de Ventas Kanban Integrado en Admin:** Panel visual estilo CRM donde los asesores arrastran cotizaciones desde "Nueva Solicitud" → "En Negociación" → "Aprobación Bancaria" → "Equipo Entregado".
72. **Cálculo Automático de TCO (Costo Total de Propiedad a 5 Años):** Informe imprimible para juntas directivas que demuestra el ahorro de combustible y repuestos de una pala LiuGong frente a marcas competidoras.
73. **Catálogo de Accesorios e Implementos Opcionales en Checkout:** Sugerencia inteligente de martillos hidráulicos, acoples rápidos y cucharas de zanja compatibles al momento de cotizar una excavadora.
74. **Descarga Masiva de Fichas Técnicas Oficiales en ZIP:** Permitir a los departamentos de compras y licitaciones descargar en un solo archivo comprimido las fichas técnicas en PDF de toda la flota ofertada.
75. **Integración de Pasarela de Pagos con Tarjeta (Cardnet / Azul):** Habilitar cobros con tarjeta de crédito corporativa para pedidos de repuestos de emergencia menores a RD$ 150,000.
76. **Contratos de Mantenimiento Preventivo (PMA) Configurables:** Opción de incluir en la cotización paquetes prepagados de mantenimiento para las primeras 2,000 horas con descuento comercial.
77. **Control de Márgenes Mínimos de Venta:** Alerta interna para el gerente si un vendedor aplica un descuento que sitúa el margen bruto de la máquina por debajo del 12%.
78. **Generador de Enlaces de Cotización para WhatsApp:** Botón que genera un enlace corto (`tmd.com.do/q/84920`) con vista previa enriquecida para enviar directamente a los teléfonos de los dueños de constructoras.
79. **Registro de Llamadas y Seguimiento Comercial en CRM:** Bitácora en el perfil de cada cliente para registrar fechas de visitas al patio del Km 22 o llamadas de seguimiento.
80. **Reporte Ejecutivo Mensual Automatizado para Dirección:** Generación automática el día 1 de cada mes de un resumen ejecutivo en PDF con ventas totales, repuestos más demandados y horas facturadas en taller.

---

### EJE 5: TALLER MÓVIL, CAMPO, PATIO KM 22 & LOGÍSTICA (81–100)
81. **Despacho de Unidades de Auxilio Técnico 4x4 con GPS:** Mapa en el Command Center que muestra la posición en vivo de las camionetas de servicio de campo de TMD para despachar la más cercana a la avería.
82. **Módulo de Recepción de Equipos con Inspección Fotográfica:** Aplicación móvil para que el recepcionista del Km 22 tome 4 fotos del estado físico de la máquina al ingresar al taller (evita reclamos por golpes previos).
83. **Control de Garantías OEM LiuGong / JCB:** Registro digital del reclamo de piezas defectuosas con exportación del reporte técnico requerido por las fábricas para reembolso de repuestos.
84. **Pase de Puerta Digital con Código QR para Salida de Patio:** Generación de un ticket de salida en pantalla que el guardia de seguridad escanea antes de permitir que una máquina o repuesto salga del Km 22.
85. **Etiquetado con Códigos de Barras / QR para Estanterías de Repuestos:** Modal de impresión de etiquetas autoadhesivas estándar (Zebra / Avery) con número de parte OEM, ubicación de pasillo y código QR.
86. **Registro de Análisis de Fluidos y Espectrometría S.O.S.:** Módulo para subir resultados de laboratorio de muestras de aceite motor/hidráulico con gráficas de desgaste de metales (cobre, hierro, silicio).
87. **Planificador de Bahías de Trabajo en Taller Central:** Cronograma visual que muestra qué bahía (Bahía 1 a 6) está ocupada, qué máquina está en desarme y fecha estimada de entrega.
88. **Lista de Verificación de Inspección Pre-Entrega (PDI):** Checklist digital obligatorio de 85 puntos (niveles de fluidos, torque de orugas, presión de neumáticos, calibración de display) antes de entregar una máquina nueva.
89. **Control de Horas Laborables de Técnicos y Mecánicos:** Registro de horas hombre dedicadas por cada mecánico a cada orden para cálculo de productividad y bonos de taller.
90. **Módulo de Remanufacturación y Reconstrucción de Componentes:** Sección para registrar el desarme, mecanizado y prueba en banco de bombas hidráulicas y transmisiones usadas con garantía TMD Reman.
91. **Reserva de Pruebas de Manejo en Patio de Pruebas Km 22:** Calendario interactivo en el portal para que contratistas agenden una sesión de prueba en terreno real con una retroexcavadora o rodillo antes de comprar.
92. **Gestión de Stock Crítico y Puntos de Reorden Automatizados:** Alarma cuando el inventario de filtros de combustible o aceite desciende por debajo de 15 unidades en almacén.
93. **Monitoreo de Garantía de Baterías y Neumáticos:** Registro de fechas de instalación para gestionar reclamos directos ante proveedores de cauchos y acumuladores.
94. **Manual Digital de Operación y Mantenimiento Accesible por QR:** Pegar una calcomanía QR indeleble en la cabina de cada equipo; al escanearla, el operador accede al manual oficial en español en su celular.
95. **Control de Herramientas Especiales de Taller:** Módulo de préstamo y control de herramientas calibradas (torquímetros de 1000 Nm, manómetros digitales, extractores hidráulicos).
96. **Auditoría de Huella de Carbono y Eficiencia Energética:** Calculador que muestra a empresas con certificación ISO 14001 las emisiones de CO2 ahorradas por la eficiencia de motores diésel de última generación.
97. **Control de Aceites Usados y Disposición Ecológica:** Registro de galones de lubricante residual entregados a plantas de reciclaje autorizadas por el Ministerio de Medio Ambiente de la República Dominicana.
98. **Solicitud de Repuestos de Emergencia Vía Foto por WhatsApp:** Herramienta interna de OCR que reconoce el número de parte grabado en una pieza de metal oxidada a partir de una foto enviada por un mecánico en campo.
99. **Sincronización de Inventario entre Almacén Central Km 22 y Camionetas Móviles:** Control del stock de repuestos rápidos (mangueras, fusibles, correas) que lleva cada camioneta 4x4 en sus rutas por el país.
100. **Encuesta de Satisfacción Post-Servicio Automatizada:** Envío automático de una encuesta de 3 preguntas vía SMS/WhatsApp tras la entrega de una orden de taller para evaluar la calidad del servicio técnico.
