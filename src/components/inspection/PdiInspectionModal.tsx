import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Download, 
  ShieldCheck, 
  Printer, 
  UserCheck, 
  Wrench, 
  HardHat, 
  Truck, 
  Check, 
  Sparkles,
  ClipboardList,
  Fuel,
  Cpu,
  Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Machine } from '../../types';
import { drawTmdOfficialLogoPdf } from '../../utils/pdfGenerator';
import { triggerHaptic } from '../../utils/haptics';

interface PdiInspectionModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
}

type CheckStatus = 'pass' | 'fail' | 'na';

interface PdiItem {
  id: string;
  category: 'motor_fluidos' | 'hidraulico_mandos' | 'tren_rodaje_chasis' | 'cabina_display' | 'seguridad_legal';
  label: string;
  detail: string;
}

const PDI_CATEGORIES = [
  { id: 'motor_fluidos', label: '1. Motor & Fluidos', icon: Fuel, count: 18 },
  { id: 'hidraulico_mandos', label: '2. Hidráulica & Mandos', icon: Wrench, count: 18 },
  { id: 'tren_rodaje_chasis', label: '3. Tren de Rodaje & Estructura', icon: Layers, count: 17 },
  { id: 'cabina_display', label: '4. Cabina, Eléctrico & Display', icon: Cpu, count: 16 },
  { id: 'seguridad_legal', label: '5. Seguridad Operativa & Normativa RD', icon: ShieldCheck, count: 16 }
] as const;

const PDI_85_ITEMS: PdiItem[] = [
  // --- CATEGORÍA 1: MOTOR & FLUIDOS (18 Ítems) ---
  { id: 'pdi-01', category: 'motor_fluidos', label: 'Nivel y viscosidad aceite de motor (15W-40 CI-4/CK-4)', detail: 'Verificar varilla en frío, consistencia y ausencia de espuma o partículas.' },
  { id: 'pdi-02', category: 'motor_fluidos', label: 'Nivel y concentración refrigerante motor (50/50 OAT)', detail: 'Comprobar tanque de expansión y tapón presurizado (mínimo -37°C anticongelante/108°C ebullición).' },
  { id: 'pdi-03', category: 'motor_fluidos', label: 'Filtro primario de combustible con separador de agua', detail: 'Vaso decantador limpio, sin agua ni sedimentos, sensor de presencia drenado.' },
  { id: 'pdi-04', category: 'motor_fluidos', label: 'Filtro secundario de combustible (micraje fino)', detail: 'Filtro roscado con torque homologado y ausencia de fugas perimetrales.' },
  { id: 'pdi-05', category: 'motor_fluidos', label: 'Filtro de aire de dos etapas (Elemento Primario y Secundario)', detail: 'Cartucho fijado herméticamente, válvula de descarga de polvo libre.' },
  { id: 'pdi-06', category: 'motor_fluidos', label: 'Tensión y alineación de correas de accesorios / alternador', detail: 'Deflexión de 8-10 mm con presión digital, sin cuarteaduras de goma.' },
  { id: 'pdi-07', category: 'motor_fluidos', label: 'Estanqueidad de mangueras de intercooler y turbo', detail: 'Abrazaderas T-bolt apretadas a 9.5 Nm, conductos sin fisuras.' },
  { id: 'pdi-08', category: 'motor_fluidos', label: 'Radiador y enfriador de aceite hidráulico limpios', detail: 'Panales de aluminio libres de barro, aletas sin doblar, paso de aire expedito.' },
  { id: 'pdi-09', category: 'motor_fluidos', label: 'Tapa de llenado de combustible y filtro colador en boca', detail: 'Cierre con llave hermético, venteo libre y colador de malla intacto.' },
  { id: 'pdi-10', category: 'motor_fluidos', label: 'Sensor de presión de aceite de motor y manómetro', detail: 'Lectura en ralentí > 1.8 bar; lectura a régimen nominal > 4.2 bar.' },
  { id: 'pdi-11', category: 'motor_fluidos', label: 'Sistema de escape y silenciador con supresor de chispas', detail: 'Uniones embridadas estancas sin soplado, abrazadera de salida fijada.' },
  { id: 'pdi-12', category: 'motor_fluidos', label: 'Bomba de inyección diésel / Common Rail sellada', detail: 'Sellos de garantía de fábrica intactos, conectores de inyector fijados.' },
  { id: 'pdi-13', category: 'motor_fluidos', label: 'Tacos antivibratorios de soporte de motor', detail: 'Gomas sin deformación ni impregnación de diésel, pernos torquizados.' },
  { id: 'pdi-14', category: 'motor_fluidos', label: 'Válvula de alivio de gases de cárter (PCV / Breather)', detail: 'Membrana flexible y tubo de venteo despejado sin goteo excesivo.' },
  { id: 'pdi-15', category: 'motor_fluidos', label: 'Purga de aire del circuito de combustible realizada', detail: 'Cebador manual de combustible duro y circuito presurizado.' },
  { id: 'pdi-16', category: 'motor_fluidos', label: 'Ventilador de motor con aspas balanceadas', detail: 'Giro suave, guarda protectora de seguridad fijada con pernos.' },
  { id: 'pdi-17', category: 'motor_fluidos', label: 'Tapón de drenaje de cárter con arandela de cobre nueva', detail: 'Torque de apriete verificado según especificación OEM, sin goteo.' },
  { id: 'pdi-18', category: 'motor_fluidos', label: 'Prueba de arranque en frío y estabilidad en ralentí', detail: 'Arranque en < 2.5 seg a 26°C, ralentí estable a 800 RPM sin oscilación.' },

  // --- CATEGORÍA 2: HIDRÁULICA & MANDOS (18 Ítems) ---
  { id: 'pdi-19', category: 'hidraulico_mandos', label: 'Nivel de aceite en mirilla de tanque hidráulico (ISO VG 46/68)', detail: 'Nivel en zona verde con cilindros retraídos en superficie nivelada.' },
  { id: 'pdi-20', category: 'hidraulico_mandos', label: 'Presión de alivio en banco principal (Main Relief Valve)', detail: 'Verificada con manómetro digital según ficha técnica (320-343 bar).' },
  { id: 'pdi-21', category: 'hidraulico_mandos', label: 'Presión de circuito piloto (Pilot Pressure)', detail: 'Presión constante a 38-40 bar alimentando mandos electrohidráulicos.' },
  { id: 'pdi-22', category: 'hidraulico_mandos', label: 'Vástagos de cilindros hidráulicos de pluma (Boom)', detail: 'Cromado pulido al espejo sin rayones, picaduras ni desprendimiento.' },
  { id: 'pdi-23', category: 'hidraulico_mandos', label: 'Vástagos de cilindros de brazo (Arm) y balde (Bucket)', detail: 'Inspección micrométrica sin rebabas, rascadores de polvo ajustados.' },
  { id: 'pdi-24', category: 'hidraulico_mandos', label: 'Ausencia total de fugas en racores ORFS de alta presión', detail: 'Verificación visual a presión máxima en todas las conexiones.' },
  { id: 'pdi-25', category: 'hidraulico_mandos', label: 'Filtro de retorno hidráulico y filtro de drenaje de carcasa', detail: 'Elementos filtrantes nuevos, indicador de saturación en verde.' },
  { id: 'pdi-26', category: 'hidraulico_mandos', label: 'Filtro respiradero (Breather) de tanque hidráulico', detail: 'Cartucho desecante activo con válvula de presurización positiva.' },
  { id: 'pdi-27', category: 'hidraulico_mandos', label: 'Motor de giro (Swing Motor) y freno de parqueo de giro', detail: 'Bloqueo mecánico efectivo, juego axial y radial dentro de tolerancia.' },
  { id: 'pdi-28', category: 'hidraulico_mandos', label: 'Nivel de aceite en reductora de giro', detail: 'Verificar varilla de engranajes con aceite para engranes 80W-90.' },
  { id: 'pdi-29', category: 'hidraulico_mandos', label: 'Motores de traslación en orugas / Transmisión eje', detail: 'Cambio de velocidad alta/baja (Turtle/Rabbit) instantáneo.' },
  { id: 'pdi-30', category: 'hidraulico_mandos', label: 'Respuesta progresiva y centrado automático de Joysticks', detail: 'Retorno a punto muerto sin resistencia mecánica ni puntos duros.' },
  { id: 'pdi-31', category: 'hidraulico_mandos', label: 'Pedales de traslación y palancas auxiliares', detail: 'Juegos calibrados, sin enganche fortuito de traslación.' },
  { id: 'pdi-32', category: 'hidraulico_mandos', label: 'Líneas hidráulicas auxiliares para martillo (bidireccionales)', detail: 'Acoples rápidos taponados con tapas protectoras de aluminio.' },
  { id: 'pdi-33', category: 'hidraulico_mandos', label: 'Válvula de bloqueo hidráulico de cabina (Palanca Roja)', detail: 'Inmovilización total de movimientos al levantar la palanca de seguridad.' },
  { id: 'pdi-34', category: 'hidraulico_mandos', label: 'Amortiguación de fin de carrera en cilindros hidráulicos', detail: 'Desaceleración suave sin golpe metálico al extender pluma completa.' },
  { id: 'pdi-35', category: 'hidraulico_mandos', label: 'Enfriador hidráulico termostático operativo', detail: 'Activación del flujo de enfriamiento a 55°C comprobada con pirómetro.' },
  { id: 'pdi-36', category: 'hidraulico_mandos', label: 'Acumulador de nitrógeno de emergencia (Bajar pluma con motor apagado)', detail: 'Prueba de descenso seguro con motor apagado mediante joystick.' },

  // --- CATEGORÍA 3: TREN DE RODAJE & ESTRUCTURA (17 Ítems) ---
  { id: 'pdi-37', category: 'tren_rodaje_chasis', label: 'Tensión de orugas / catenaria medida bajo larguero', detail: 'Flecha de comba de 15-25 mm regulada con pistola de engrase en tensor.' },
  { id: 'pdi-38', category: 'tren_rodaje_chasis', label: 'Zapatas de oruga y pernos de fijación torquizados', detail: 'Apretado en cruz al torque nominal especificado por el fabricante.' },
  { id: 'pdi-39', category: 'tren_rodaje_chasis', label: 'Rodillos inferiores y rodillos superiores guía', detail: 'Rotación concéntrica suave sin atascos ni fuga de aceite en sellos Duo-Cone.' },
  { id: 'pdi-40', category: 'tren_rodaje_chasis', label: 'Rueda guía delantera (Idler) y resorte amortiguador', detail: 'Alineación milimétrica con la línea de zapatas sin desgaste oblicuo.' },
  { id: 'pdi-41', category: 'tren_rodaje_chasis', label: 'Sprockets (Ruedas motrices) y dientes de engranaje', detail: 'Perfil de diente original sin desgaste prematuro ni melladuras.' },
  { id: 'pdi-42', category: 'tren_rodaje_chasis', label: 'Corona de giro (Slewing Ring) y pernos grado 10.9', detail: 'Torque verificado al 100% con torquímetro calibrado y marcado de pintura.' },
  { id: 'pdi-43', category: 'tren_rodaje_chasis', label: 'Engrase completo de corona y piñón de ataque de giro', detail: 'Grasa de extrema presión con bisulfuro de molibdeno (NLGI 2) fresca.' },
  { id: 'pdi-44', category: 'tren_rodaje_chasis', label: 'Pasadores y bujes de pluma, brazo y balde engrasados', detail: 'Engrase visible en todos los puntos y tapones de engrasadores colocados.' },
  { id: 'pdi-45', category: 'tren_rodaje_chasis', label: 'Holgura axial en articulación de balde ajustada con lainas', detail: 'Juego lateral inferior a 1.0 mm con espaciadores instalados.' },
  { id: 'pdi-46', category: 'tren_rodaje_chasis', label: 'Cuchilla de ataque y dientes de balde tipo roca', detail: 'Pasadores de retención y seguros elastoméricos insertados firmemente.' },
  { id: 'pdi-47', category: 'tren_rodaje_chasis', label: 'Soldaduras de pluma (Boom) inspeccionadas visualmente', detail: 'Cordones de soldadura libres de porosidades, socavados o fisuras.' },
  { id: 'pdi-48', category: 'tren_rodaje_chasis', label: 'Contrapeso trasero fijado sólidamente a chasis', detail: 'Pernos de anclaje de gran calibre apretados y seguros instalados.' },
  { id: 'pdi-49', category: 'tren_rodaje_chasis', label: 'Cubiertas inferiores de protección de motor y bombas (Belly Pans)', detail: 'Placas blindadas de acero atornilladas con pernos completos.' },
  { id: 'pdi-50', category: 'tren_rodaje_chasis', label: 'Presión de neumáticos (en caso de retroexcavadoras/palas)', detail: 'Neumáticos inflados a presión nominal (delanteros 45 PSI / traseros 35 PSI).' },
  { id: 'pdi-51', category: 'tren_rodaje_chasis', label: 'Tuercas de rueda con torque certificado en cruz', detail: 'Verificación con torquímetro a 550 Nm y marcadores de tuerca suelta.' },
  { id: 'pdi-52', category: 'tren_rodaje_chasis', label: 'Puntos de amarre y anclaje para transporte en Lowboy', detail: 'Cáncamos de sujeción libres de deformaciones para cadenas G70.' },
  { id: 'pdi-53', category: 'tren_rodaje_chasis', label: 'Pintura exterior de fábrica y esmalte amarillo TMD', detail: 'Acabado uniforme, libre de rayones de desembarque marítimo.' },

  // --- CATEGORÍA 4: CABINA, ELÉCTRICO & DISPLAY (16 Ítems) ---
  { id: 'pdi-54', category: 'cabina_display', label: 'Display digital LCD multifunción y telemetría LiveLink', detail: 'Pantalla de alta nitidez, idioma en Español y firmware actualizado.' },
  { id: 'pdi-55', category: 'cabina_display', label: 'Horómetro digital verificado y registrado en ficha PDI', detail: 'Lectura inferior a 10.0 horas de pruebas de fábrica y patio.' },
  { id: 'pdi-56', category: 'cabina_display', label: 'Conexión módem satelital / 4G de rastreo y geocerca', detail: 'Señal GPS enlazada con Command Center TMD Dominicana.' },
  { id: 'pdi-57', category: 'cabina_display', label: 'Estado de baterías (Voltaje en reposo > 12.6V / Sistema 24V)', detail: 'Bornes engrasados con vaselina dieléctrica y cables ajustados.' },
  { id: 'pdi-58', category: 'cabina_display', label: 'Voltaje de carga de alternador con motor en marcha', detail: 'Generación estable entre 27.8V y 28.6V en bornes de batería.' },
  { id: 'pdi-59', category: 'cabina_display', label: 'Luces LED de trabajo de pluma, cabina y contrapeso', detail: 'Haz de luz alineado, consumo eléctrico nominal y lentes limpios.' },
  { id: 'pdi-60', category: 'cabina_display', label: 'Luz giratoria estroboscópica (Beacon) superior ámbar', detail: 'Destello visible a 360° para seguridad en mina y carretera.' },
  { id: 'pdi-61', category: 'cabina_display', label: 'Aire acondicionado y calefactor Tropical Plus', detail: 'Temperatura de salida en tobera < 8°C a 32°C ambiente en 5 minutos.' },
  { id: 'pdi-62', category: 'cabina_display', label: 'Presurización positiva de cabina y filtro de polen', detail: 'Sellado hermético de puertas y burletes de goma en perfecto estado.' },
  { id: 'pdi-63', category: 'cabina_display', label: 'Asiento ergonómico con suspensión neumática y ajuste de peso', detail: 'Amortiguación funcional, apoyabrazos y consola ajustables.' },
  { id: 'pdi-64', category: 'cabina_display', label: 'Cinturón de seguridad retráctil de 3 puntos de anclaje', detail: 'Bloqueo inercial instantáneo, cinta sin deshilachado.' },
  { id: 'pdi-65', category: 'cabina_display', label: 'Limpia / Lavaparabrisas delantero y depósito de agua', detail: 'Bomba eléctrica operativa y plumilla de silicona barre sin estrías.' },
  { id: 'pdi-66', category: 'cabina_display', label: 'Espejos retrovisores convexos de alta visibilidad', detail: 'Ajuste panorámico sin vibración, espejos limpios sin roturas.' },
  { id: 'pdi-67', category: 'cabina_display', label: 'Bocina claxon estándar y botón de bocina en joystick', detail: 'Tono acústico claro y potente (> 105 dB a 2 metros).' },
  { id: 'pdi-68', category: 'cabina_display', label: 'Cámara de retroceso y monitor de visualización trasero', detail: 'Lente infrarroja limpia, líneas de guía de proximidad visibles en pantalla.' },
  { id: 'pdi-69', category: 'cabina_display', label: 'Cerraduras de puertas, ventanillas corredizas y trampilla de techo', detail: 'Llaves originales ensayadas en todas las cerraduras del equipo.' },

  // --- CATEGORÍA 5: SEGURIDAD OPERATIVA & NORMATIVA RD (16 Ítems) ---
  { id: 'pdi-70', category: 'seguridad_legal', label: 'Alarma de marcha y retroceso audible tipo Heavy Duty (>97 dB)', detail: 'Activación inmediata al accionar pedales o marcha atrás.' },
  { id: 'pdi-71', category: 'seguridad_legal', label: 'Extintor de incendios de polvo químico seco (ABC 20 lbs)', detail: 'Manómetro en zona verde, precinto plástico intacto y tarjeta vigente.' },
  { id: 'pdi-72', category: 'seguridad_legal', label: 'Interruptor general cortacorriente (Master Battery Switch)', detail: 'Apertura de circuito total y candado de bloqueo LOTO instalable.' },
  { id: 'pdi-73', category: 'seguridad_legal', label: 'Placa metálica DIN de Chasis / Serial / VIN grabada', detail: 'Remachada de fábrica con números legibles coincidentes con aduana.' },
  { id: 'pdi-74', category: 'seguridad_legal', label: 'Certificación de Cabina ROPS/FOPS estampada en chapa', detail: 'Cumplimiento con normas ISO 3471 (ROPS) e ISO 3449 (FOPS Nivel II).' },
  { id: 'pdi-75', category: 'seguridad_legal', label: 'Calcomanías de advertencia de seguridad en ESPAÑOL', detail: 'Señales de puntos de pellizco, ventilador, calor y alta presión.' },
  { id: 'pdi-76', category: 'seguridad_legal', label: 'Botiquín de primeros auxilios reglamentario en cabina', detail: 'Dotado con gasas, apósitos, vendas y soluciones antisépticas.' },
  { id: 'pdi-77', category: 'seguridad_legal', label: 'Martillo de escape rompecristales con cortador de cinturón', detail: 'Fijado en soporte visible de fácil acceso para el operador.' },
  { id: 'pdi-78', category: 'seguridad_legal', label: 'Cintas reflectivas reglamentarias MOPC grado diamante', detail: 'Bandas rojo/blanco reflectivas en laterales y contrapeso trasero.' },
  { id: 'pdi-79', category: 'seguridad_legal', label: 'Manual de Operación y Mantenimiento oficial en Español', detail: 'Ejemplar impreso protegido en funda plástica impermeable en cabina.' },
  { id: 'pdi-80', category: 'seguridad_legal', label: 'Catálogo de Repuestos y Partes Críticas con Códigos OEM', detail: 'Manual con diagramas de despiece para solicitud rápida de filtros.' },
  { id: 'pdi-81', category: 'seguridad_legal', label: 'Caja metálica de herramientas de mano y engrasadora manual', detail: 'Juego de llaves milimétricas, alicates y bomba de engrase de palanca.' },
  { id: 'pdi-82', category: 'seguridad_legal', label: 'Juego de 2 llaves de encendido originales + llavero TMD', detail: 'Llaves maestras verificadas en interruptor de contacto.' },
  { id: 'pdi-83', category: 'seguridad_legal', label: 'Certificado de Inspección de Emisiones y Opacidad de Humo', detail: 'Motor cumple normativa Tier 2 / Tier 3 / Stage V según especificación.' },
  { id: 'pdi-84', category: 'seguridad_legal', label: 'Filtro de Seguridad de Combustible con llave anti-hurto', detail: 'Mecanismo de seguridad de tapa de tanque probado.' },
  { id: 'pdi-85', category: 'seguridad_legal', label: 'Firma de Acta de Inspección por Inspector Técnico Certificado', detail: 'Validación técnica por Jefe de Taller Km 22 con sello oficial TMD.' }
];

export const PdiInspectionModal: React.FC<PdiInspectionModalProps> = ({
  machine,
  isOpen,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('motor_fluidos');
  const [itemsStatus, setItemsStatus] = useState<Record<string, CheckStatus>>(() => {
    // Default: all 85 items initialized to 'pass'
    const initial: Record<string, CheckStatus> = {};
    PDI_85_ITEMS.forEach(it => { initial[it.id] = 'pass'; });
    return initial;
  });

  const [inspectorName, setInspectorName] = useState('Ing. Marcos Taveras');
  const [inspectorRole, setInspectorRole] = useState('Jefe de Taller & Calidad PDI — Km 22');
  const [technicianBadge, setTechnicianBadge] = useState('TMD-PDI-882');
  const [customerName, setCustomerName] = useState('Consorcio Vial del Caribe S.R.L.');
  const [deliveryDestination, setDeliveryDestination] = useState('Obra Autopista Duarte Km 28');
  const [chassisSerial, setChassisSerial] = useState(() => {
    return machine ? `TMD-${machine.brand.substring(0, 3).toUpperCase()}-2026-${machine.modelCode.replace(/[^a-zA-Z0-9]/g, '')}-849` : 'TMD-LG-2026-922E-849';
  });
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    let passCount = 0;
    let failCount = 0;
    let naCount = 0;
    Object.values(itemsStatus).forEach(st => {
      if (st === 'pass') passCount++;
      else if (st === 'fail') failCount++;
      else if (st === 'na') naCount++;
    });
    const total = PDI_85_ITEMS.length;
    const progressPercent = Math.round((passCount / total) * 100);
    return { passCount, failCount, naCount, total, progressPercent };
  }, [itemsStatus]);

  if (!isOpen || !machine) return null;

  const currentCategoryItems = PDI_85_ITEMS.filter(it => it.category === activeCategory);

  const setItemState = (id: string, status: CheckStatus) => {
    triggerHaptic('mechanicalClick');
    setItemsStatus(prev => ({ ...prev, [id]: status }));
  };

  const handleApproveAll = () => {
    triggerHaptic('successThump');
    const updated: Record<string, CheckStatus> = {};
    PDI_85_ITEMS.forEach(it => { updated[it.id] = 'pass'; });
    setItemsStatus(updated);
  };

  const handleExportPdiPdf = async () => {
    triggerHaptic('heavyShud');
    setIsExportingPdf(true);
    try {
      await new Promise(r => setTimeout(r, 120));
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const currentDate = new Date().toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const currentTime = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

      // Top Header Amber Bar
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, pageWidth, 5, 'F');

      // Top Dark Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 5, pageWidth, 28, 'F');

      // Logo TMD
      drawTmdOfficialLogoPdf(doc, 12, 8, 38, 14);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('ACTA DE INSPECCIÓN PRE-ENTREGA CERTIFICADA (PDI)', 55, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text('CHECKLIST DE 85 PUNTOS CRÍTICOS — PATIO CENTRAL KM 22 AUTOPISTA DUARTE', 55, 22);

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`FECHA DE INSPECCIÓN: ${currentDate.toUpperCase()} | HORA: ${currentTime} | FOLIO: PDI-${machine.modelCode}-${Math.floor(1000 + Math.random() * 9000)}`, 55, 28);

      // Machine and Inspector info table
      autoTable(doc, {
        startY: 37,
        head: [['DATOS DEL EQUIPO PESADO', 'DATOS DE CALIDAD & ENTREGA']],
        body: [
          [
            `Equipo: ${machine.name}\nMarca / Modelo: ${machine.brand} Mod. ${machine.modelCode}\nAño: ${machine.year} | Horómetro: 3.4 Horas PDI\nNo. Chasis / VIN: ${chassisSerial}`,
            `Cliente: ${customerName}\nDestino Despacho: ${deliveryDestination}\nInspector Responsable: ${inspectorName} (${technicianBadge})\nDictamen Técnico: ${stats.failCount === 0 ? 'CONFORME (100% OPERATIVO)' : 'PENDIENTE DE CORRECCIÓN'}`
          ]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [245, 158, 11],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59],
          lineColor: [203, 213, 225]
        },
        margin: { left: 12, right: 12 }
      });

      // Table of 85 items
      const tableRows = PDI_85_ITEMS.map((item, index) => {
        const status = itemsStatus[item.id] || 'pass';
        const statusStr = status === 'pass' ? 'CONFORME' : status === 'fail' ? 'NO CONFORME' : 'N/A';
        return [
          (index + 1).toString(),
          item.label,
          item.detail,
          statusStr
        ];
      });

      // @ts-ignore
      const lastY = doc.lastAutoTable.finalY || 65;

      autoTable(doc, {
        startY: lastY + 4,
        head: [['#', 'PUNTO DE EVALUACIÓN (85 PUNTOS)', 'CRITERIO TÉCNICO DE TOLERANCIA', 'ESTADO']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 6.8,
          textColor: [15, 23, 42]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 70, fontStyle: 'bold' },
          2: { cellWidth: 82 },
          3: { cellWidth: 26, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const val = data.cell.raw;
            if (val === 'CONFORME') {
              data.cell.styles.textColor = [16, 185, 129];
            } else if (val === 'NO CONFORME') {
              data.cell.styles.textColor = [239, 68, 68];
            } else {
              data.cell.styles.textColor = [156, 163, 175];
            }
          }
        },
        margin: { left: 12, right: 12 }
      });

      // Signatures Box on Last Page
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY || 240;
      const signatureY = finalY > 235 ? 245 : finalY + 10;

      if (signatureY > 250) {
        doc.addPage();
      }

      const curY = signatureY > 250 ? 25 : signatureY;

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);

      // Inspector Signature
      doc.line(18, curY + 15, 85, curY + 15);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${inspectorName.toUpperCase()}`, 18, curY + 19);
      doc.setFont('helvetica', 'normal');
      doc.text(`Jefe de Taller TMD — Carnet: ${technicianBadge}`, 18, curY + 23);
      doc.text(`Firma Digital Certificada: SHA-256 Validado`, 18, curY + 27);

      // Customer Receiver Signature
      doc.line(115, curY + 15, 185, curY + 15);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATISTA / RECEPTOR AUTORIZADO', 115, curY + 19);
      doc.setFont('helvetica', 'normal');
      doc.text(`Por: ${customerName}`, 115, curY + 23);
      doc.text(`Cédula / RNC: __________________________`, 115, curY + 27);

      // Official Stamp
      doc.setDrawColor(245, 158, 11);
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(88, curY + 6, 24, 22, 2, 2, 'FD');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('SELLO CONTROL', 90, curY + 12);
      doc.text('CALIDAD PDI', 91, curY + 16);
      doc.text('KM 22 RD', 93, curY + 20);
      doc.text('APROBADO', 91, curY + 24);

      doc.save(`Acta_PDI_85_Puntos_${machine.brand}_${machine.modelCode}_TMD.pdf`);
    } catch (err) {
      console.error('Error generating PDI PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-950 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[94vh] font-mono text-white">
        
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Inspección Pre-Entrega Digital (PDI — 85 Puntos)
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">
                  {stats.progressPercent}% Conforme ({stats.passCount}/85)
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                {machine.brand} {machine.name} • Mod. {machine.modelCode} • Taller Central Km 22 Autopista Duarte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApproveAll}
              className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              title="Marcar todos los 85 puntos como conformes de fábrica"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Aprobar Todos (85)</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdiPdf}
              disabled={isExportingPdf}
              className="px-3 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Generando...' : 'Descargar Acta PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[2px] bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Credentials and Machine Metadata Bar */}
        <div className="px-4 py-2.5 bg-zinc-900/50 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10px] shrink-0">
          <div>
            <span className="text-zinc-400 block uppercase font-bold text-[9px]">Inspector Certificado:</span>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-[2px] text-zinc-200 text-[10px] focus:outline-none focus:border-amber-400 font-mono mt-0.5"
            />
          </div>
          <div>
            <span className="text-zinc-400 block uppercase font-bold text-[9px]">Carnet Inspector TMD:</span>
            <input
              type="text"
              value={technicianBadge}
              onChange={(e) => setTechnicianBadge(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-[2px] text-zinc-200 text-[10px] focus:outline-none focus:border-amber-400 font-mono mt-0.5"
            />
          </div>
          <div>
            <span className="text-zinc-400 block uppercase font-bold text-[9px]">Cliente Adquiriente:</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-[2px] text-zinc-200 text-[10px] focus:outline-none focus:border-amber-400 font-mono mt-0.5"
            />
          </div>
          <div>
            <span className="text-zinc-400 block uppercase font-bold text-[9px]">Serial / VIN Chasis:</span>
            <input
              type="text"
              value={chassisSerial}
              onChange={(e) => setChassisSerial(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-[2px] text-amber-400 font-bold text-[10px] focus:outline-none focus:border-amber-400 font-mono mt-0.5"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 overflow-x-auto shrink-0 scrollbar-none">
          {PDI_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const catItems = PDI_85_ITEMS.filter(it => it.category === cat.id);
            const catPassed = catItems.filter(it => itemsStatus[it.id] === 'pass').length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setActiveCategory(cat.id);
                }}
                className={`px-3.5 py-2.5 text-xs font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-400 bg-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-[2px] font-mono ${
                  catPassed === cat.count ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {catPassed}/{cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Checklist Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-900 text-[11px] text-zinc-400 font-bold uppercase">
            <span>Puntos de Verificación ({currentCategoryItems.length})</span>
            <span>Evaluación: Conforme | No Conforme | N/A</span>
          </div>

          {currentCategoryItems.map((item, idx) => {
            const status = itemsStatus[item.id] || 'pass';
            return (
              <div
                key={item.id}
                className={`p-3 rounded-[3px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  status === 'pass'
                    ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                    : status === 'fail'
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-zinc-500 font-mono text-xs font-bold w-6 shrink-0 pt-0.5">
                    {String(PDI_85_ITEMS.findIndex(x => x.id === item.id) + 1).padStart(2, '0')}.
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-tight">
                      {item.label}
                    </h5>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center font-mono">
                  <button
                    type="button"
                    onClick={() => setItemState(item.id, 'pass')}
                    className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      status === 'pass'
                        ? 'bg-emerald-500 text-black font-black shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:text-emerald-400 border border-zinc-800'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Conforme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemState(item.id, 'fail')}
                    className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      status === 'fail'
                        ? 'bg-rose-600 text-white font-black shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:text-rose-400 border border-zinc-800'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Fallo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemState(item.id, 'na')}
                    className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      status === 'na'
                        ? 'bg-zinc-700 text-white font-black shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Summary */}
        <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{stats.passCount} Conformes</span>
            </span>
            {stats.failCount > 0 && (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>{stats.failCount} Observaciones</span>
              </span>
            )}
            <span className="text-zinc-500 font-mono">
              Total Evaluados: {stats.total} Puntos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 uppercase hidden md:inline">
              Homologación Técnica TMD Dominicana
            </span>
            <button
              type="button"
              onClick={handleExportPdiPdf}
              disabled={isExportingPdf}
              className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>Emitir Acta Certificada PDI (.PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
