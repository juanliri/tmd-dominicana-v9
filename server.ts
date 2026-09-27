import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const TMD_SYSTEM_INSTRUCTION = `
Eres el "Asistente Virtual TMD 24/7", el agente inteligente de atención al cliente, repuestos y servicio técnico de Tecnomaquinarias Diesel S.R.L. (TMD Dominicana).

DATOS DE TMD DOMINICANA:
- Empresa: Tecnomaquinarias Diesel S.R.L. (TMD Dominicana)
- Ubicación: Km 22, Autopista Duarte, Pedro Brand / Santo Domingo Oeste, República Dominicana.
- Cobertura: Todo el territorio nacional (Santo Domingo, Santiago de los Caballeros, Bávaro / Punta Cana, San Cristóbal, La Vega, Puerto Plata, Barahona, San Pedro de Macorís).
- Contacto Directo y WhatsApp 24/7: +1 (809) 560-1234
- Horario de talleres centrales: Lunes a Viernes 8:00 AM - 6:00 PM, Sábados 8:00 AM - 1:00 PM.
- Servicio Móvil de Emergencia en Campo: 24/7 para canteras, minas y obras viales en cualquier punto del país.

LÍNEAS DE MAQUINARIA PESADA DISTRIBUIDAS:
- LiuGong: Excavadoras hidráulicas sobre orugas (922E HD de 22 ton, 936E de 36 ton), Cargadores frontales (CLG856H balde 3.0 m³, CLG835H), Rodillos compactadores (CLG612H de 12 ton tambor liso/pata de cabra), Minicargadores (375B).
- JCB: Retroexcavadoras 4x4 (3CX Eco con brazo extensible y cabina con A/C, 4CX Turbo), Manipuladores telescópicos Loadall (540-170), Miniexcavadoras (8035ZTS).
- LS Tractor: Tractores agrícolas y agroindustriales (Plus 100 4WD de 100 HP con cabina climatizada, Plus 90, Serie MT compacta).

CATÁLOGO DE REPUESTOS GENUINOS & COMPONENTES:
- Filtración de Alto Rendimiento: Filtros de aceite de motor, filtros de combustible primarios con trampa de agua (separadores racor), filtros de aire primarios y de seguridad, filtros hidráulicos de retorno y succión de alta presión (Donaldson, Fleetguard, JCB genuino, LiuGong original).
- Herramientas de Corte y Desgaste (G.E.T.): Cuchillas de corte tratadas térmicamente, esquineros para cucharón de retroexcavadoras y palas, dientes y adaptadores estándar Cat J300/J350 y JCB, picas y pasadores de retención heavy duty.
- Tren de Rodaje & Orugas: Cadenas de orugas selladas y lubricadas, zapatas de acero de triple garra (600mm / 700mm / 800mm), orugas de goma de alta resistencia para miniexcavadoras, rodillos superiores e inferiores, ruedas motrices (sprockets) y ruedas tensoras (idlers).
- Hidráulica & Sellos: Kits de sellos certificados para cilindros hidráulicos (brazo, balde, aguilón, estabilizadores), bombas de engranajes y bombas de pistón de caudal variable, mangueras hidráulicas de 4 y 6 mallas espiraladas armadas en el taller, válvulas de control proporcionales.
- Motores Diésel & Transmisión: Repuestos para motores Cummins (QSB6.7, 6BT5.9, QSL9), Perkins (1104D, 1106D) y Weichai; turbocargadores, inyectores common-rail, kits de empaquetaduras superiores e inferiores; crucetas, discos de embrague y diferenciales Carraro y Dana Spicer.

SERVICIOS TÉCNICOS ESPECIALIZADOS EN RD:
1. Unidades de Servicio Móvil en Campo 24/7: Camiones taller completamente equipados (compresor, generador, máquina de soldar, prensa hidráulica portátil, banco de herramientas pesadas) para rescate de maquinaria varada directamente en la obra o mina.
2. Diagnóstico Electrónico Computarizado: Software y escáner de diagnóstico oficial para lectura de códigos de falla ECU, calibración de presiones hidráulicas y ajustes de inyección.
3. Taller Central de Reconstrucción (Overhaul): Reconstrucción integral de motores diésel con garantía de 6 meses a 1 año, rectificación, banqueo de bombas hidráulicas y calibración de transmisiones powershift.
4. Mantenimiento Preventivo Planificado: Rutinas de servicio por horómetro (250h, 500h, 1,000h y 2,000h) con toma y análisis espectrométrico de muestras de aceite.

REGLAS DE ATENCIÓN Y TONO:
- Responde siempre de forma amable, respetuosa, técnica pero accesible, en español neutro caribeño/dominicano profesional.
- Estructura las respuestas con claridad: usa negritas para modelos y números de parte, listas con viñetas cuando hayan varios puntos, y mantén las respuestas concisas (máximo 2 a 3 párrafos cortos).
- Si el cliente necesita un repuesto específico, pregúntale amablemente por el modelo de equipo, número de serie (VIN/Chasis) o número de parte para brindarle disponibilidad exacta.
- Ofrécele siempre soluciones concretas: agregar a cotización en la tienda online, contactar al equipo técnico por WhatsApp al +1 (809) 560-1234, o solicitar despacho express a cualquier provincia de República Dominicana.
`;

// Smart local fallback in case GEMINI_API_KEY is not configured or fails
function generateSmartFallback(message: string): string {
  const query = message.toLowerCase();

  if (query.includes("filtro") || query.includes("donaldson") || query.includes("fleetguard")) {
    return `En **TMD Dominicana** disponemos de stock permanente de **filtros genuinos Donaldson, Fleetguard, JCB y LiuGong** para entrega inmediata en todo el país:\n\n` +
      `• **Filtros de Aire:** Primarios y secundarios de alta retención para canteras y ambientes de polvo severo.\n` +
      `• **Filtros de Combustible:** Separadores de agua y trampas con sensor para sistemas Common-Rail.\n` +
      `• **Filtros de Aceite & Hidráulicos:** Micraje de precisión para bombas axiales y transmisiones.\n\n` +
      `Puede agregar sus filtros directamente a su cotización en nuestra sección de **Repuestos** o escribirnos al WhatsApp **+1 (809) 560-1234** con el modelo de su equipo para verificar disponibilidad inmediata.`;
  }

  if (query.includes("servicio") || query.includes("campo") || query.includes("emergencia") || query.includes("taller") || query.includes("tecnico") || query.includes("mecánico")) {
    return `Nuestro **Servicio Técnico TMD 24/7** opera tanto en nuestro taller central de Pedro Brand (Km 22 Autopista Duarte) como en campo:\n\n` +
      `• **Unidades Móviles 24/7:** Camiones taller para emergencias en canteras, carreteras y proyectos en cualquier provincia (Santiago, Punta Cana, Barahona, etc.).\n` +
      `• **Diagnóstico Computarizado:** Escáner para motores Cummins, Perkins y sistemas hidráulicos LiuGong y JCB.\n` +
      `• **Mantenimiento Programado:** Servicios de 250, 500, 1000 y 2000 horas con fluidos certificados.\n\n` +
      `Para coordinar una visita técnica o auxilio inmediato en obra, llámenos o envíenos un mensaje al **+1 (809) 560-1234**.`;
  }

  if (query.includes("3cx") || query.includes("jcb") || query.includes("retroexcavadora")) {
    return `Para retroexcavadoras **JCB 3CX Eco y 4CX**, disponemos de piezas y consumibles originales en almacén:\n\n` +
      `• Dientes, esquineros y pasadores para cucharón frontal y retro.\n` +
      `• Kits de sellos hidráulicos para cilindros de pluma, balde y estabilizadores.\n` +
      `• Filtros de motor Perkins/JCB Dieselmax y aceite hidráulico 46.\n` +
      `• Bombas hidráulicas principales y bombas de agua.\n\n` +
      `¿Desea que le preparemos una proforma o necesita asistencia de un mecánico en su proyecto? Escríbanos al **+1 (809) 560-1234**.`;
  }

  if (query.includes("excavadora") || query.includes("liugong") || query.includes("922") || query.includes("936")) {
    return `Para excavadoras **LiuGong (922E HD, 936E)** y equipos pesados similares:\n\n` +
      `• Disponemos de trenes de rodaje completos: cadenas selladas, zapatas, rodillos y sprockets.\n` +
      `• Bombas hidráulicas principales Kawasaki y motores de giro.\n` +
      `• Dientes Heavy Duty tipo Cat J350 / J300 para roca y cantera.\n` +
      `• Repuestos de motor Cummins QSB6.7.\n\n` +
      `Contáctenos vía WhatsApp al **+1 (809) 560-1234** con el número de serie de su máquina para cotizar de inmediato.`;
  }

  if (query.includes("horario") || query.includes("donde") || query.includes("ubicacion") || query.includes("direccion") || query.includes("telefono")) {
    return `**Tecnomaquinarias Diesel S.R.L. (TMD Dominicana):**\n\n` +
      `• **Dirección:** Km 22, Autopista Duarte, Pedro Brand / Santo Domingo Oeste, R.D.\n` +
      `• **Horario Taller Central:** Lunes a Viernes de 8:00 AM a 6:00 PM | Sábados de 8:00 AM a 1:00 PM.\n` +
      `• **Guardia Móvil 24/7:** Atención de urgencias en campo los 365 días del año.\n` +
      `• **Teléfono & WhatsApp:** +1 (809) 560-1234\n\n` +
      `¿En qué más podemos asistirle hoy?`;
  }

  return `¡Hola! Soy el **Asistente Virtual TMD 24/7**. Estoy aquí para ayudarle con:\n\n` +
    `• Consultas y cotizaciones de **repuestos genuinos** (filtros Donaldson, tren de rodaje, dientes, kits hidráulicos).\n` +
    `• Solicitud de **servicio técnico en campo 24/7** o citas en nuestro taller de Km 22 Autopista Duarte.\n` +
    `• Información sobre maquinaria pesada **LiuGong, JCB y LS Tractor**.\n\n` +
    `Por favor indíquenos qué repuesto o equipo necesita, o comuníquese directamente con nuestros asesores vía WhatsApp al **+1 (809) 560-1234**.`;
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // API Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // =========================================================================
  // JCB LIVELINK TELEMATICS & IOT API ROUTES
  // =========================================================================

  const livelinkFleet = [
    {
      id: "ll-jcb-001",
      vin: "JCB3CX2026DOM001",
      name: "JCB 3CX Eco 4x4 (Ficha #01)",
      brand: "JCB",
      model: "3CX-ECO-2026",
      serialNumber: "JCB3CX-882910-RD",
      customerName: "Ing. Alejandro Santos",
      customerCompany: "Constructora del Cibao S.A.S.",
      customerEmail: "operaciones@constructoradelcibao.do",
      location: {
        lat: 18.5204,
        lng: -69.9801,
        address: "Autopista Duarte Km 22, Pedro Brand",
        province: "Santo Domingo"
      },
      status: "running",
      horometerHours: 1485.6,
      fuelLevelPercent: 78,
      fuelConsumptionLph: 7.2,
      defLevelPercent: 88,
      batteryVoltage: 27.6,
      engineCoolantTempC: 86,
      hydraulicOilTempC: 72,
      lastCommunication: new Date().toISOString(),
      geofenceStatus: "inside",
      geofenceName: "Polígono Cantera Km 22",
      serviceCountdownHours: 14.4, // Next service at 1500h (Preventive 500h)
      faultCodes: [],
      immobilizerActive: false,
      canBusHealth: "optimal"
    },
    {
      id: "ll-liugong-002",
      vin: "LG922E2026DOM002",
      name: "LiuGong 922E HD (Ficha #04)",
      brand: "LiuGong",
      model: "922E-HD-CARIBBEAN",
      serialNumber: "LG922E-441092-RD",
      customerName: "Lic. Manuel Henríquez",
      customerCompany: "Agregados & Minería del Sur",
      customerEmail: "mhenriquez@agregadosdelsur.do",
      location: {
        lat: 18.4167,
        lng: -70.1000,
        address: "Cantera San Cristóbal - Tramo Yaguate",
        province: "San Cristóbal"
      },
      status: "running",
      horometerHours: 2890.2,
      fuelLevelPercent: 42,
      fuelConsumptionLph: 16.8,
      defLevelPercent: 65,
      batteryVoltage: 26.8,
      engineCoolantTempC: 98,
      hydraulicOilTempC: 84,
      lastCommunication: new Date().toISOString(),
      geofenceStatus: "inside",
      geofenceName: "Zona de Extracción Cantera Sur",
      serviceCountdownHours: 109.8,
      faultCodes: [
        {
          code: "SPN 100 FMI 1",
          system: "Motor Diesel",
          severity: "critical",
          description: "Presión baja de aceite de motor diésel Cummins QSB6.7 (Por debajo de 1.2 bar en ralentí)",
          spnFmi: "100-01",
          timestamp: new Date().toISOString(),
          active: true
        }
      ],
      immobilizerActive: false,
      canBusHealth: "warning"
    },
    {
      id: "ll-jcb-003",
      vin: "JCB220X2026DOM003",
      name: "JCB 220X Heavy Excavator (Ficha #12)",
      brand: "JCB",
      model: "220X-LC-HD",
      serialNumber: "JCB220X-901442-RD",
      customerName: "Ing. Carlos Mendoza",
      customerCompany: "Infraestructuras Viales del Este",
      customerEmail: "cmendoza@vialesdeleste.do",
      location: {
        lat: 18.5601,
        lng: -68.3725,
        address: "Bulevar Turístico del Este, Punta Cana",
        province: "La Altagracia"
      },
      status: "idle",
      horometerHours: 940.0,
      fuelLevelPercent: 91,
      fuelConsumptionLph: 3.4,
      defLevelPercent: 95,
      batteryVoltage: 28.2,
      engineCoolantTempC: 78,
      hydraulicOilTempC: 64,
      lastCommunication: new Date().toISOString(),
      geofenceStatus: "inside",
      geofenceName: "Proyecto Hotelero Cap Cana Fase II",
      serviceCountdownHours: 60.0,
      faultCodes: [],
      immobilizerActive: false,
      canBusHealth: "optimal"
    },
    {
      id: "ll-kubota-004",
      vin: "KUBM7172DOM004",
      name: "Kubota M7-172 Premium KVT (Ficha #07)",
      brand: "Kubota",
      model: "M7172-KVT-4WD",
      serialNumber: "KUBM7-331092-RD",
      customerName: "Don Fernando Valerio",
      customerCompany: "Agropecuaria del Valle San Juan",
      customerEmail: "fvalerio@agrivalle.do",
      location: {
        lat: 18.8059,
        lng: -71.2299,
        address: "Valle de San Juan - Sector Las Matas",
        province: "San Juan"
      },
      status: "running",
      horometerHours: 512.4,
      fuelLevelPercent: 63,
      fuelConsumptionLph: 11.5,
      defLevelPercent: 80,
      batteryVoltage: 27.4,
      engineCoolantTempC: 84,
      hydraulicOilTempC: 70,
      lastCommunication: new Date().toISOString(),
      geofenceStatus: "inside",
      geofenceName: "Finca Arrocera San Juan",
      serviceCountdownHours: 237.6,
      faultCodes: [],
      immobilizerActive: false,
      canBusHealth: "optimal"
    },
    {
      id: "ll-ammann-005",
      vin: "AMMASC110DOM005",
      name: "Ammann ASC 110 Compactador (Ficha #09)",
      brand: "Ammann",
      model: "ASC110-TIER3",
      serialNumber: "AMMASC-771239-RD",
      customerName: "Ing. Ramón Batista",
      customerCompany: "Consorcio Autopistas del Cibao",
      customerEmail: "rbatista@autopistascibao.do",
      location: {
        lat: 19.4517,
        lng: -70.6970,
        address: "Circunvalación Norte, Santiago de los Caballeros",
        province: "Santiago"
      },
      status: "stopped",
      horometerHours: 1980.5,
      fuelLevelPercent: 35,
      fuelConsumptionLph: 0.0,
      defLevelPercent: 50,
      batteryVoltage: 25.8,
      engineCoolantTempC: 45,
      hydraulicOilTempC: 40,
      lastCommunication: new Date().toISOString(),
      geofenceStatus: "inside",
      geofenceName: "Tramo Pavimentación Santiago",
      serviceCountdownHours: 19.5,
      faultCodes: [
        {
          code: "SPN 94 FMI 1",
          system: "Motor Diesel",
          severity: "warning",
          description: "Restricción en filtro de combustible primario Fleetguard",
          spnFmi: "94-01",
          timestamp: new Date().toISOString(),
          active: true
        }
      ],
      immobilizerActive: false,
      canBusHealth: "warning"
    }
  ];

  // LiveLink Fleet List Endpoint
  app.get("/api/telematics/livelink/fleet", (_req, res) => {
    res.json({
      success: true,
      provider: "JCB LiveLink Telematics API v2.4 (TMD Dominicana Gateway)",
      fleetCount: livelinkFleet.length,
      units: livelinkFleet,
      timestamp: new Date().toISOString()
    });
  });

  // LiveLink Telemetry Summary Endpoint
  app.get("/api/telematics/livelink/summary", (_req, res) => {
    const running = livelinkFleet.filter(u => u.status === "running").length;
    const idle = livelinkFleet.filter(u => u.status === "idle").length;
    const stopped = livelinkFleet.filter(u => u.status === "stopped").length;
    const offline = livelinkFleet.filter(u => u.status === "offline").length;
    const criticalAlerts = livelinkFleet.reduce((acc, u) => acc + u.faultCodes.filter(f => f.severity === "critical").length, 0);
    const avgConsumption = livelinkFleet.reduce((acc, u) => acc + u.fuelConsumptionLph, 0) / livelinkFleet.length;

    res.json({
      success: true,
      summary: {
        totalUnits: livelinkFleet.length,
        runningUnits: running,
        idleUnits: idle,
        stoppedUnits: stopped,
        offlineUnits: offline,
        criticalAlertsCount: criticalAlerts,
        avgFleetFuelConsumption: Number(avgConsumption.toFixed(1)),
        fleetHealthScore: criticalAlerts > 0 ? 88 : 98
      }
    });
  });

  // LiveLink Single Unit Endpoint
  app.get("/api/telematics/livelink/unit/:id", (req, res) => {
    const unit = livelinkFleet.find(u => u.id === req.params.id || u.vin === req.params.id || u.serialNumber === req.params.id);
    if (!unit) {
      res.status(404).json({ success: false, error: "Unidad LiveLink no encontrada" });
      return;
    }
    res.json({ success: true, unit });
  });

  // LiveLink Remote Command Execution
  app.post("/api/telematics/livelink/command", (req, res) => {
    const { unitId, command, parameters } = req.body;
    const unit = livelinkFleet.find(u => u.id === unitId);
    if (!unit) {
      res.status(404).json({ success: false, error: "Unidad no encontrada" });
      return;
    }

    if (command === "toggle_immobilizer") {
      unit.immobilizerActive = !unit.immobilizerActive;
      res.json({
        success: true,
        command: "toggle_immobilizer",
        immobilizerActive: unit.immobilizerActive,
        message: `Inmovilizador remoto ${unit.immobilizerActive ? "ACTIVADO" : "DESACTIVADO"} para ${unit.name}`
      });
      return;
    }

    if (command === "ping_horn_lights") {
      res.json({
        success: true,
        command: "ping_horn_lights",
        message: `Señal de localización acústica y luminosa enviada a ${unit.name} en ${unit.location.address}`
      });
      return;
    }

    if (command === "clear_fault_code") {
      const codeToClear = parameters?.code;
      if (codeToClear) {
        unit.faultCodes = unit.faultCodes.filter(f => f.code !== codeToClear);
      } else {
        unit.faultCodes = [];
      }
      unit.canBusHealth = "optimal";
      res.json({
        success: true,
        message: "Códigos de diagnóstico DTC reseteados exitosamente."
      });
      return;
    }

    res.status(400).json({ success: false, error: "Comando telemático desconocido" });
  });

  // =========================================================================
  // FULLBAY HEAVY-DUTY SHOP MANAGEMENT API ROUTES
  // =========================================================================

  const fullbayTechnicians = [
    {
      id: "tech-01",
      name: "Ing. Marcos Peña",
      title: "Master Diagnostic Technician Cummins & JCB",
      specialty: "Inyección Electrónica y Calibración CAN Bus",
      assignedMobileUnit: "Camión Taller Móvil #01 (F-550)",
      currentOrderId: "FB-2026-4412",
      efficiencyRating: 98,
      certifications: ["Cummins Certified Master", "JCB LiveLink Telematics Pro", "LiuGong Hydraulic Specialist"],
      phone: "(809) 560-1234 ext 104",
      status: "working"
    },
    {
      id: "tech-02",
      name: "Téc. Ysidro Rosario",
      title: "Especialista en Hidráulica Pesada y Banqueo",
      specialty: "Bombas Kawasaki K3V y Motores de Giro",
      assignedMobileUnit: "Taller Central Km 22 - Bahía Hidráulica",
      currentOrderId: null,
      efficiencyRating: 95,
      certifications: ["Rexroth / Kawasaki Certified", "Dana Spicer Transmissions"],
      phone: "(809) 560-1234 ext 108",
      status: "available"
    },
    {
      id: "tech-03",
      name: "Téc. Rafael Almonte",
      title: "Técnico de Servicio Móvil 24/7 Cibao",
      specialty: "Mantenimiento Preventivo y Rescate en Campo",
      assignedMobileUnit: "Camión Taller Móvil #03 (Santiago / Cibao)",
      currentOrderId: "FB-2026-4415",
      efficiencyRating: 94,
      certifications: ["Kubota Agricultural Specialist", "Donaldson Clean Fuel Tech"],
      phone: "(809) 580-4422",
      status: "in_field"
    }
  ];

  let fullbayWorkOrders: any[] = [
    {
      id: "fb-wo-001",
      fullbayOrderNumber: "FB-2026-4412",
      customerId: "cust-cibao-01",
      customerName: "Ing. Alejandro Santos",
      customerCompany: "Constructora del Cibao S.A.S.",
      customerPhone: "(809) 580-4422",
      unitFicha: "Ficha #01",
      unitVin: "JCB3CX2026DOM001",
      unitModel: "JCB 3CX Eco 4x4",
      unitBrand: "JCB",
      unitHorometer: 1485,
      status: "in_progress",
      priority: "urgent",
      serviceDepartment: "Taller Central Km 22",
      assignedTechnicianId: "tech-01",
      assignedTechnicianName: "Ing. Marcos Peña",
      technicianClockStatus: "clocked_in",
      technicianLaborHours: 4.5,
      laborRateUsd: 65,
      complaint: "Mantenimiento preventivo programado de 1,500 Horas detectado por JCB LiveLink + Revisión de holgura en bujes de pluma.",
      cause: "Cumplimiento del intervalo de servicio recomendado por fabricante.",
      correction: "Cambio de kit de filtros Donaldson de motor y combustible, sustitución de aceite hidráulico ISO 46 y ajuste de calces en pluma.",
      partsRequired: [
        {
          partNumber: "P550440",
          name: "Filtro de Aceite Lubricante Donaldson",
          brand: "Donaldson",
          quantity: 1,
          unitCostUsd: 28.50,
          totalCostUsd: 28.50,
          status: "allocated",
          binLocation: "Pasillo A - Estante 03"
        },
        {
          partNumber: "FS19732",
          name: "Filtro Separador Fleetguard",
          brand: "Fleetguard",
          quantity: 1,
          unitCostUsd: 46.00,
          totalCostUsd: 46.00,
          status: "allocated",
          binLocation: "Pasillo A - Estante 05"
        }
      ],
      totalLaborUsd: 292.50,
      totalPartsUsd: 74.50,
      totalAmountUsd: 367.00,
      totalAmountDop: 22020.00,
      ncfType: "B01_CREDITO_FISCAL",
      ncfNumber: "B0100008492",
      livelinkSynced: true,
      livelinkFaultCodeRef: "PREVENTIVE_1500H",
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "fb-wo-002",
      fullbayOrderNumber: "FB-2026-4415",
      customerId: "cust-sur-02",
      customerName: "Lic. Manuel Henríquez",
      customerCompany: "Agregados & Minería del Sur",
      customerPhone: "(809) 528-9900",
      unitFicha: "Ficha #04",
      unitVin: "LG922E2026DOM002",
      unitModel: "LiuGong 922E HD",
      unitBrand: "LiuGong",
      unitHorometer: 2890,
      status: "scheduled",
      priority: "emergency",
      serviceDepartment: "Unidad Móvil Campo 24/7",
      assignedTechnicianId: "tech-01",
      assignedTechnicianName: "Ing. Marcos Peña",
      technicianClockStatus: "clocked_out",
      technicianLaborHours: 0,
      laborRateUsd: 75,
      complaint: "Alerta crítica telemática LiveLink: SPN 100 FMI 1 - Presión de aceite baja en motor Cummins QSB6.7 en cantera San Cristóbal.",
      cause: "Posible obstrucción en sensor de presión o fuga en línea de lubricación.",
      correction: "Despacho de camión taller móvil con escáner Cummins INSITE y kit de manómetros analógicos para prueba de presión hidrostática.",
      partsRequired: [
        {
          partNumber: "P550440",
          name: "Filtro de Aceite Lubricante Donaldson",
          brand: "Donaldson",
          quantity: 2,
          unitCostUsd: 28.50,
          totalCostUsd: 57.00,
          status: "allocated",
          binLocation: "Camión Taller Móvil #01"
        }
      ],
      totalLaborUsd: 300.00,
      totalPartsUsd: 57.00,
      totalAmountUsd: 357.00,
      totalAmountDop: 21420.00,
      ncfType: "B01_CREDITO_FISCAL",
      ncfNumber: "B0100008493",
      livelinkSynced: true,
      livelinkFaultCodeRef: "SPN 100 FMI 1",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Fullbay Authentication Login Endpoint
  app.post("/api/shop/fullbay/auth/login", (req, res) => {
    const { apiKey, apiSecret, shopId } = req.body;
    res.json({
      success: true,
      token: `fb_jwt_${Date.now()}_tmd_caribbean`,
      shopId: shopId || "TMD-DOM-KM22-01",
      shopName: "TECNOMAQUINARIAS DIESEL S.R.L. - Sede Central Km 22",
      role: "shop_administrator",
      expiresIn: 86400,
      timestamp: new Date().toISOString()
    });
  });

  // Fullbay Authentication Status Endpoint
  app.get("/api/shop/fullbay/auth/status", (_req, res) => {
    res.json({
      success: true,
      authenticated: true,
      shopId: "TMD-DOM-KM22-01",
      shopName: "TECNOMAQUINARIAS DIESEL S.R.L.",
      environment: "production_bridge"
    });
  });

  // Fullbay Work Orders List Endpoint
  app.get("/api/shop/fullbay/work-orders", (_req, res) => {
    res.json({
      success: true,
      provider: "Fullbay Heavy-Duty Shop Management API (TMD Dominicana Hub)",
      workOrders: fullbayWorkOrders,
      totalCount: fullbayWorkOrders.length,
      timestamp: new Date().toISOString()
    });
  });

  // Fullbay Technicians Endpoint
  app.get("/api/shop/fullbay/technicians", (_req, res) => {
    res.json({
      success: true,
      technicians: fullbayTechnicians,
      totalCount: fullbayTechnicians.length
    });
  });

  // Fullbay Create Work Order Endpoint
  app.post("/api/shop/fullbay/work-orders", (req, res) => {
    const body = req.body;
    const newId = `fb-wo-${Date.now()}`;
    const orderNum = `FB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: newId,
      fullbayOrderNumber: orderNum,
      customerId: body.customerId || "cust-direct",
      customerName: body.customerName || "Cliente TMD",
      customerCompany: body.customerCompany || "Empresa Constructora",
      customerPhone: body.customerPhone || "(809) 560-1234",
      unitFicha: body.unitFicha || "Unidad #01",
      unitVin: body.unitVin || `VIN-${Date.now()}`,
      unitModel: body.unitModel || "Equipo Pesado TMD",
      unitBrand: body.unitBrand || "TMD",
      unitHorometer: Number(body.unitHorometer || 0),
      status: body.status || "triage",
      priority: body.priority || "routine",
      serviceDepartment: body.serviceDepartment || "Taller Central Km 22",
      assignedTechnicianId: body.assignedTechnicianId || "tech-01",
      assignedTechnicianName: body.assignedTechnicianName || "Ing. Marcos Peña",
      technicianClockStatus: "clocked_out",
      technicianLaborHours: Number(body.technicianLaborHours || 0),
      laborRateUsd: Number(body.laborRateUsd || 65),
      complaint: body.complaint || "Solicitud de servicio general",
      cause: body.cause || "",
      correction: body.correction || "",
      partsRequired: Array.isArray(body.partsRequired) ? body.partsRequired : [],
      totalLaborUsd: Number(body.totalLaborUsd || 0),
      totalPartsUsd: Number(body.totalPartsUsd || 0),
      totalAmountUsd: Number(body.totalAmountUsd || 0),
      totalAmountDop: Number(body.totalAmountDop || 0),
      ncfType: body.ncfType || "B01_CREDITO_FISCAL",
      ncfNumber: `B010000${Math.floor(1000 + Math.random() * 9000)}`,
      livelinkSynced: Boolean(body.livelinkSynced),
      livelinkFaultCodeRef: body.livelinkFaultCodeRef || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fullbayWorkOrders.unshift(newOrder);

    res.json({
      success: true,
      message: `Orden de servicio ${orderNum} generada exitosamente en Fullbay`,
      workOrder: newOrder
    });
  });

  // Fullbay Update Work Order Status / Progress
  app.patch("/api/shop/fullbay/work-orders/:id", (req, res) => {
    const order = fullbayWorkOrders.find(o => o.id === req.params.id || o.fullbayOrderNumber === req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: "Orden de servicio no encontrada" });
      return;
    }

    const { status, technicianLaborHours, correction, technicianClockStatus, partsRequired } = req.body;

    if (status) order.status = status;
    if (typeof technicianLaborHours === "number") {
      order.technicianLaborHours = technicianLaborHours;
      order.totalLaborUsd = technicianLaborHours * order.laborRateUsd;
    }
    if (correction) order.correction = correction;
    if (technicianClockStatus) order.technicianClockStatus = technicianClockStatus;
    if (Array.isArray(partsRequired)) {
      order.partsRequired = partsRequired;
      order.totalPartsUsd = partsRequired.reduce((acc: number, p: any) => acc + (p.totalCostUsd || (p.unitCostUsd * p.quantity)), 0);
    }

    order.totalAmountUsd = order.totalLaborUsd + order.totalPartsUsd;
    order.totalAmountDop = order.totalAmountUsd * 60;
    order.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Orden ${order.fullbayOrderNumber} actualizada exitosamente`,
      workOrder: order
    });
  });

  // Convert LiveLink DTC Alert into Fullbay Work Order directly (1-Click Bridge)
  app.post("/api/shop/fullbay/create-from-livelink", (req, res) => {
    const { unitId, faultCode, description, customerDetails } = req.body;
    const unit = livelinkFleet.find(u => u.id === unitId);

    const orderNum = `FB-2026-${Math.floor(2000 + Math.random() * 7000)}`;
    const newOrder = {
      id: `fb-wo-${Date.now()}`,
      fullbayOrderNumber: orderNum,
      customerId: customerDetails?.id || "cust-livelink",
      customerName: unit?.customerName || customerDetails?.name || "Cliente Flota LiveLink",
      customerCompany: unit?.customerCompany || customerDetails?.company || "Constructora / Minera RD",
      customerPhone: customerDetails?.phone || "(809) 560-1234",
      unitFicha: unit?.name || "Unidad Flota",
      unitVin: unit?.vin || `VIN-${Date.now()}`,
      unitModel: unit?.model || "Equipo Pesado",
      unitBrand: unit?.brand || "JCB",
      unitHorometer: unit?.horometerHours || 1200,
      status: "scheduled" as const,
      priority: "emergency" as const,
      serviceDepartment: "Unidad Móvil Campo 24/7" as const,
      assignedTechnicianId: "tech-01",
      assignedTechnicianName: "Ing. Marcos Peña",
      technicianClockStatus: "clocked_out" as const,
      technicianLaborHours: 3.0,
      laborRateUsd: 75,
      complaint: `Alerta Telemática LiveLink Detectada: ${faultCode} - ${description || "Falla en sistema operativo"} en ${unit?.location?.address || "República Dominicana"}`,
      cause: "Alerta automática enviada vía telemetría CAN Bus JCB LiveLink.",
      correction: "Despacho prioritario de unidad móvil con instrumental de diagnóstico electrónico y repuestos de reemplazo en Km 22.",
      partsRequired: [
        {
          partNumber: "P550440",
          name: "Filtro de Aceite Lubricante Donaldson",
          brand: "Donaldson",
          quantity: 1,
          unitCostUsd: 28.50,
          totalCostUsd: 28.50,
          status: "allocated" as const,
          binLocation: "Almacén Km 22"
        }
      ],
      totalLaborUsd: 225.00,
      totalPartsUsd: 28.50,
      totalAmountUsd: 253.50,
      totalAmountDop: 15210.00,
      ncfType: "B01_CREDITO_FISCAL" as const,
      ncfNumber: `B010000${Math.floor(2000 + Math.random() * 7000)}`,
      livelinkSynced: true,
      livelinkFaultCodeRef: faultCode || "DTC_ALERT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fullbayWorkOrders.unshift(newOrder);

    res.json({
      success: true,
      message: `¡Orden ${orderNum} abierta exitosamente en Fullbay desde la alerta telemática LiveLink!`,
      workOrder: newOrder
    });
  });

  // Fullbay Counter Sale (E-Commerce Parts Checkout Direct to Shop Inventory)
  const fullbayCounterSales: any[] = [];

  app.post("/api/shop/fullbay/counter-sales", (req, res) => {
    const { customerId, customerName, customerCompany, customerEmail, customerPhone, rncOrCedula, items, paymentMethod } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "La venta de mostrador debe incluir al menos un repuesto." });
      return;
    }

    const saleNum = `CS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotalUsd = items.reduce((acc: number, it: any) => acc + (Number(it.unitPriceUsd || 0) * Number(it.quantity || 1)), 0);
    const itbisUsd = Number((subtotalUsd * 0.18).toFixed(2));
    const totalUsd = Number((subtotalUsd + itbisUsd).toFixed(2));
    const currentRate = cachedDopRate.rate || 60.50;
    const totalDop = Number((totalUsd * currentRate).toFixed(2));
    const hasRnc = Boolean(rncOrCedula && rncOrCedula.trim().length >= 9);
    const ncfType = hasRnc ? "B01_CREDITO_FISCAL" : "B02_CONSUMIDOR_FINAL";
    const ncfNumber = hasRnc ? `B010000${Math.floor(3000 + Math.random() * 6000)}` : `B020000${Math.floor(3000 + Math.random() * 6000)}`;

    const newSale = {
      id: `fb-cs-${Date.now()}`,
      counterSaleNumber: saleNum,
      customerId: customerId || "cust-direct-counter",
      customerName: customerName || "Cliente Mostrador TMD",
      customerCompany: customerCompany || "",
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "(809) 560-1234",
      rncOrCedula: rncOrCedula || "",
      ncfType,
      ncfNumber,
      items: items.map((it: any) => ({
        partNumber: it.partNumber || "PART-GENUINE",
        name: it.name || "Repuesto Genuino",
        brand: it.brand || "TMD",
        quantity: Number(it.quantity || 1),
        unitPriceUsd: Number(it.unitPriceUsd || 0),
        totalPriceUsd: Number(it.unitPriceUsd || 0) * Number(it.quantity || 1),
        binLocation: it.binLocation || "Almacén Central Km 22 - Pasillo A"
      })),
      subtotalUsd,
      itbisUsd,
      totalUsd,
      totalDop,
      paymentMethod: paymentMethod || "bank_transfer",
      paymentStatus: "paid",
      warehouseOrigin: "Almacén Central Km 22 Autopista Duarte",
      createdAt: new Date().toISOString()
    };

    fullbayCounterSales.unshift(newSale);

    res.json({
      success: true,
      message: `Venta de mostrador Fullbay #${saleNum} generada con NCF ${ncfNumber}`,
      counterSale: newSale
    });
  });

  app.get("/api/shop/fullbay/counter-sales", (_req, res) => {
    res.json({
      success: true,
      counterSales: fullbayCounterSales,
      totalCount: fullbayCounterSales.length
    });
  });

  // Fullbay Estimate Digital Approval / Denial by Client
  app.post("/api/shop/fullbay/work-orders/:id/approve-estimate", (req, res) => {
    const { id } = req.params;
    const { approved, approvedBy, notes } = req.body;

    const order = fullbayWorkOrders.find(o => o.id === id || o.fullbayOrderNumber === id);
    if (!order) {
      res.status(404).json({ success: false, error: "Orden de servicio no encontrada en Fullbay." });
      return;
    }

    order.estimateApproved = Boolean(approved);
    order.estimateApprovedBy = approvedBy || order.customerName;
    order.estimateApprovedAt = new Date().toISOString();
    order.estimateApprovedNotes = notes || (approved ? "Presupuesto aprobado digitalmente por el cliente." : "Presupuesto rechazado para ajuste de alcance.");

    if (approved) {
      if (order.status === "triage" || order.status === "scheduled") {
        order.status = "in_progress";
      }
    }

    order.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: approved ? `Presupuesto de Orden #${order.fullbayOrderNumber} APROBADO digitalmente.` : `Presupuesto rechazado/en revisión.`,
      workOrder: order
    });
  });

  // Fullbay Inbound Webhook Listener
  app.post("/api/webhooks/fullbay", (req, res) => {
    const event = req.body;
    console.log("[Fullbay Webhook Event Received]:", event?.eventType, event?.orderNumber);

    if (event?.orderNumber && event?.status) {
      const order = fullbayWorkOrders.find(o => o.fullbayOrderNumber === event.orderNumber);
      if (order) {
        order.status = event.status;
        if (event.laborHours) order.technicianLaborHours = event.laborHours;
        order.updatedAt = new Date().toISOString();
      }
    }

    res.json({ received: true, timestamp: new Date().toISOString() });
  });

  // Standardized AEMP 2.0 / ISO 15143-3 Multi-Brand Telematics Endpoint
  app.get("/api/telematics/aemp/fleet", (_req, res) => {
    const aempFeed = livelinkFleet.map(u => ({
      EquipmentHeader: {
        OEMName: u.brand,
        Model: u.model,
        EquipmentID: u.name,
        SerialNumber: u.serialNumber,
        PIN: u.vin
      },
      Location: {
        Latitude: u.location.lat,
        Longitude: u.location.lng,
        AltitudeMeters: 45.0,
        AddressText: `${u.location.address}, ${u.location.province}, República Dominicana`,
        DateTime: u.lastCommunication
      },
      CumulativeOperatingHours: {
        Hour: u.horometerHours,
        DateTime: u.lastCommunication
      },
      FuelRemaining: {
        Percent: u.fuelLevelPercent,
        DateTime: u.lastCommunication
      },
      DEFRemainingPercent: u.defLevelPercent,
      EngineCoolantTemperatureC: u.engineCoolantTempC,
      HydraulicOilTemperatureC: u.hydraulicOilTempC,
      BatteryPotentialVolts: u.batteryVoltage,
      EngineStatus: u.status === "running" ? "Operating" : u.status === "idle" ? "Idling" : "Off",
      ActiveFaultCodes: u.faultCodes.map(f => ({
        SPN: f.spnFmi ? Number(f.spnFmi.split("-")[0]) : 0,
        FMI: f.spnFmi ? Number(f.spnFmi.split("-")[1]) : 0,
        Severity: f.severity,
        Description: f.description,
        Occurrences: 1
      }))
    }));

    res.json({
      standard: "ISO 15143-3 / AEMP 2.0",
      version: "2.0.1",
      provider: "TMD Dominicana Telematics Bridge",
      generatedAt: new Date().toISOString(),
      fleetCount: aempFeed.length,
      Fleet: aempFeed
    });
  });

  // API Integrations Health Monitoring Endpoint for Executive Dashboard
  app.get("/api/admin/integrations/health", (_req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        cloudRun: {
          status: "operational",
          uptimeHours: 348.5,
          memoryMb: 245,
          latencyMs: 12
        },
        fullbayConnect: {
          status: "operational",
          latencyMs: 84,
          activeShopId: "TMD-DOM-KM22-01",
          lastSyncTime: new Date().toISOString()
        },
        jcbLiveLink: {
          status: "operational",
          unitsOnline: livelinkFleet.filter(u => u.brand === "JCB").length,
          latencyMs: 142,
          feedStandard: "ISO 15143-3 (AEMP 2.0)"
        },
        kubotaAemp: {
          status: "operational",
          unitsOnline: livelinkFleet.filter(u => u.brand === "Kubota").length,
          latencyMs: 165,
          standard: "KubotaNOW / AEMP 2.0"
        },
        geminiAi: {
          status: hasKey ? "operational" : "fallback_ready",
          model: "gemini-3.8-flash",
          latencyMs: hasKey ? 320 : 15
        },
        dgiiFiscalService: {
          status: "operational",
          activeSequenceYear: 2026
        }
      }
    });
  });

  // Currency Exchange Rate API (USD to DOP) with Server-Side In-Memory Caching & Failover
  let cachedDopRate: {
    rate: number;
    lastUpdated: string;
    source: string;
    isLive: boolean;
  } = {
    rate: 60.50,
    lastUpdated: new Date().toISOString(),
    source: "Official TMD Baseline (BCRD Benchmark)",
    isLive: false
  };
  let lastRateFetchTime = 0;
  const RATE_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

  app.get("/api/currency/rate", async (_req, res) => {
    const now = Date.now();
    if (now - lastRateFetchTime < RATE_CACHE_TTL_MS && cachedDopRate.isLive) {
      res.json({ success: true, ...cachedDopRate, cached: true });
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const extRes = await fetch("https://open.er-api.com/v6/latest/USD", {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (extRes.ok) {
        const data = await extRes.json();
        const dopRate = data?.rates?.DOP;
        if (typeof dopRate === "number" && dopRate >= 45 && dopRate <= 85) {
          cachedDopRate = {
            rate: Number(dopRate.toFixed(2)),
            lastUpdated: new Date().toISOString(),
            source: "BCRD / Open Exchange Gateway",
            isLive: true
          };
          lastRateFetchTime = now;
          res.json({ success: true, ...cachedDopRate, cached: false });
          return;
        }
      }
    } catch (err) {
      console.warn("Server currency fetch warning, fallback to cached baseline:", err);
    }

    // Graceful fallback to baseline or existing cached rate
    res.json({ success: true, ...cachedDopRate, cached: true });
  });

  // Chatbot Gemini API Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        res.status(400).json({ error: "El mensaje no puede estar vacío." });
        return;
      }

      const client = getGeminiClient();

      // If no API key configured, use our rich local knowledge fallback
      if (!client) {
        const fallbackAnswer = generateSmartFallback(message);
        res.json({
          reply: fallbackAnswer,
          isFallback: true,
          mode: "knowledge_base"
        });
        return;
      }

      // Build contents array for Gemini 3.8 Flash
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.text) {
            contents.push({
              role: item.role === "assistant" || item.role === "model" ? "model" : "user",
              parts: [{ text: String(item.text) }]
            });
          }
        }
      }

      contents.push({
        role: "user",
        parts: [{ text: message.trim() }]
      });

      const geminiResponse = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents,
        config: {
          systemInstruction: TMD_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const replyText = geminiResponse.text?.trim() || generateSmartFallback(message);

      res.json({
        reply: replyText,
        isFallback: false,
        mode: "gemini"
      });
    } catch (error) {
      console.error("Error in /api/chat Gemini endpoint:", error);
      // Graceful fallback so user never encounters a blank screen or raw crash
      const userMessage = req.body?.message || "";
      const fallbackReply = generateSmartFallback(userMessage);
      res.json({
        reply: fallbackReply,
        isFallback: true,
        mode: "fallback_recovery",
        errorInfo: process.env.NODE_ENV !== "production" ? String(error) : undefined
      });
    }
  });

  // Explicit route for PWA Web App Manifest with correct application/manifest+json MIME type
  app.get("/manifest.json", (_req, res) => {
    const manifestPath = path.join(process.cwd(), "public", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.sendFile(manifestPath);
    } else {
      res.status(404).json({ error: "Manifest not found" });
    }
  });

  // Serve static assets from public/ directory with byte-range support for video and audio
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (filePath.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
      }
    }
  }));

  // Determine production mode reliably for both Cloud Run container deployments and preview
  const possibleDistPaths = [
    path.join(process.cwd(), "dist"),
    path.resolve(process.cwd()),
    typeof __dirname !== "undefined" ? __dirname : "",
    typeof __dirname !== "undefined" ? path.join(__dirname, "dist") : "",
  ].filter(Boolean);

  let distPath = path.join(process.cwd(), "dist");
  for (const p of possibleDistPaths) {
    if (fs.existsSync(path.join(p, "index.html"))) {
      distPath = p;
      break;
    }
  }

  const isCjsBundle = (typeof __filename !== "undefined" && typeof __filename === "string" && __filename.endsWith(".cjs")) ||
                      Boolean(process.argv[1]?.endsWith(".cjs"));
  const isProduction = process.env.NODE_ENV === "production" || isCjsBundle;

  // Vite middleware for development; static fallback for production deployments
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const targetIndex = path.join(distPath, "index.html");
      if (fs.existsSync(targetIndex)) {
        res.sendFile(targetIndex);
      } else {
        res.status(200).send("<!DOCTYPE html><html><head><title>TMD Dominicana</title></head><body><div id='root'></div><script type='module' src='/src/main.tsx'></script></body></html>");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TMD Dominicana Server running on http://localhost:${PORT}`);
  });
}

startServer();
