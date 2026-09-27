const fs = require('fs');
const path = require('path');

const filePath = 'src/data/partsCatalog410.ts';
let content = fs.readFileSync(filePath, 'utf8');

function resolvePartImage(category, name) {
  const cat = (category || '').toLowerCase();
  const n = (name || '').toLowerCase();

  // 1. Filtros
  if (cat.includes('filtro') || n.includes('filtro')) {
    if (n.includes('combustible') || n.includes('separador') || n.includes('diesel') || n.includes('trampa')) {
      return '/assets/parts/jcb_fuel_filter_oem.jpg';
    }
    if (n.includes('aceite') || n.includes('hidr') || n.includes('lubricante')) {
      return '/assets/parts/heavy_oil_filter.jpg';
    }
    return '/assets/parts/oil_filter_spinon.jpg';
  }

  // 2. Motor Diesel
  if (cat.includes('motor') || n.includes('motor') || n.includes('turbo') || n.includes('inyector') || n.includes('bomba')) {
    if (n.includes('turbo') || n.includes('sobrealiment')) {
      return '/assets/parts/turbocharger_holset.jpg';
    }
    if (n.includes('inyector') || n.includes('common rail') || n.includes('tobera')) {
      return '/assets/parts/cummins_diesel_injector_common_rail.jpg';
    }
    if (n.includes('bomba') && (n.includes('inyecc') || n.includes('combustible'))) {
      return '/assets/parts/engine_injection_pump.jpg';
    }
    if (n.includes('junta') || n.includes('empaque') || n.includes('reten') || n.includes('gasket')) {
      return '/assets/parts/engine_gaskets_overhaul_kit.jpg';
    }
    return '/assets/parts/cummins_qsb_engine_powertrain.jpg';
  }

  // 3. Hidráulica
  if (cat.includes('hidr') || n.includes('hidr') || n.includes('cilindro') || n.includes('valvula') || n.includes('vÃ¡lvula')) {
    if (n.includes('sello') || n.includes('kit de sellos') || n.includes('vastago') || n.includes('vÃ¡stago') || n.includes('cilindro')) {
      return '/assets/parts/hydraulic_cylinder_rod_seals.jpg';
    }
    if (n.includes('solenoide') || n.includes('valvula') || n.includes('vÃ¡lvula') || n.includes('distribuidor')) {
      return '/assets/parts/hydraulic_solenoid_valve_proportional.jpg';
    }
    if (n.includes('bomba') || n.includes('pistones')) {
      return '/assets/parts/bosch_high_pressure_pump.jpg';
    }
    if (n.includes('presion') || n.includes('manometro') || n.includes('diagnostico')) {
      return '/assets/parts/hydraulic_diagnostics_gauge.jpg';
    }
    return '/assets/parts/hydraulic_control_valve_bench.jpg';
  }

  // 4. Tren de Rodaje
  if (cat.includes('rodaje') || n.includes('oruga') || n.includes('cadena') || n.includes('rodillo') || n.includes('sprocket')) {
    if (n.includes('goma') || n.includes('caucho') || n.includes('rubber')) {
      return '/assets/parts/excavator_rubber_track.jpg';
    }
    if (n.includes('rodillo') || n.includes('rueda guia') || n.includes('idler')) {
      return '/assets/parts/track_bottom_roller_idler.jpg';
    }
    if (n.includes('cadena') || n.includes('zapata') || n.includes('sprocket') || n.includes('eslabon')) {
      return '/assets/parts/steel_track_chain_sprocket.jpg';
    }
    return '/assets/parts/rubber_track_camso.jpg';
  }

  // 5. Desgaste y Balde
  if (cat.includes('desgaste') || cat.includes('balde') || n.includes('diente') || n.includes('cuchilla') || n.includes('punta') || n.includes('balde') || n.includes('cucharon')) {
    if (n.includes('diente') || n.includes('punta') || n.includes('adaptador') || n.includes('seguro')) {
      return '/assets/parts/bucket_tooth_monotooth.jpg';
    }
    if (n.includes('cuchilla') || n.includes('cucharon') || n.includes('balde')) {
      return '/assets/machinery/JCB_Extra_heavy_duty_bucket.jpg';
    }
    return '/assets/parts/bucket_tooth_monotooth.jpg';
  }

  // 6. Lubricantes
  if (cat.includes('lubricante') || n.includes('aceite') || n.includes('grasa') || n.includes('fluido') || n.includes('refrigerante')) {
    return '/assets/parts/heavy_oil_filter.jpg';
  }

  // 7. Extinción de Incendios
  if (cat.includes('incendio') || cat.includes('extin') || n.includes('afex') || n.includes('extintor')) {
    return '/assets/parts/afex_fire_suppression_system.jpg';
  }

  // 8. Concreto
  if (cat.includes('concreto') || n.includes('trompo') || n.includes('hormig') || n.includes('imer')) {
    return '/assets/parts/imer_concrete_mixer_exploded_diagram.jpg';
  }

  return '/assets/parts/heavy_oil_filter.jpg';
}

let updatedCount = 0;
const updatedContent = content.replace(
  /(\{\s*"id":\s*"([^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"category":\s*"([^"]+)",[\s\S]*?"image":\s*")([^"]+)(")/g,
  (fullMatch, prefix, id, name, category, oldImage, suffix) => {
    const newImage = resolvePartImage(category, name);
    updatedCount++;
    return prefix + newImage + suffix;
  }
);

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Successfully updated', updatedCount, 'parts in', filePath);

// Verify all new paths exist in public/
const verifyMatches = updatedContent.match(/"image":\s*"([^"]+)"/g) || [];
const uniqueImages = new Set(verifyMatches.map(m => m.replace(/"image":\s*"/, '').replace(/"/, '')));
console.log('\nUnique images assigned across 410 parts:', uniqueImages.size);
let missing = 0;
uniqueImages.forEach(img => {
  const p = path.join('public', img);
  const exists = fs.existsSync(p);
  console.log(' - ' + img + ' -> exists: ' + exists + (exists ? ' (' + Math.round(fs.statSync(p).size/1024) + ' KB)' : ''));
  if (!exists) missing++;
});

if (missing === 0) {
  console.log('\n🎉 ALL 410 PARTS NOW USE VERIFIED LOCAL OEM ASSETS WITH ZERO MISSING FILES!');
} else {
  console.log('\n⚠️ Warning: missing files count:', missing);
}
