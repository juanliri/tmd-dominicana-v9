const fs = require('fs');

const mappings = {
  'jcb-3ts-8t-teleskid': '/assets/machinery/JCB_3TS-8T.jpg',
  'jcb-215-skid': '/assets/machinery/JCB_215.jpg',
  'jcb-270-skid': '/assets/machinery/JCB_270.jpg',
  'jcb-220x-excavator': '/assets/machinery/JCB_220X.jpg',
  'jcb-150x-excavator': '/assets/machinery/JCB_150X.jpg',
  'jcb-370x-excavator': '/assets/machinery/JCB_370X.jpg',
  'jcb-18z-1': '/assets/machinery/JCB_18Z-1.jpg',
  'jcb-50z-1': '/assets/machinery/JCB_50Z-1.jpg',
  'jcb-540-170-loadall': '/assets/machinery/jcb_loadall_531_70_telescopic_handler.jpg',
  'jcb-427-wheel-loader': '/assets/machinery/JCB_427.jpg',
  'liugong-835t': '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg',
  'liugong-856t': '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg',
  'liugong-922e': '/assets/machinery/LiuGong_922E_Excavator_Official_Photo.jpg',
  'liugong-925e': '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg',
  'liugong-4180d': '/assets/machinery/fleet_of_yellow_earthmoving_excavators_lined.jpg',
  'liugong-b160cl': '/assets/machinery/LiuGong_922E_Long_Reach_Official_Photo.jpg',
  'kubota-bx23s': '/assets/machinery/Kubota_Main-Category-Utility-Tractor-Implements.jpg',
  'kubota-l4701': '/assets/machinery/Kubota_Professional-Implements-1632x918.jpg',
  'kubota-m5-091': '/assets/machinery/Kubota_Professional-Implements-1024x576.jpg',
  'kubota-kx033-4': '/assets/machinery/Kubota_Main-Category-Excavators-2048x1152.jpg',
  'kubota-svl75-2s': '/assets/machinery/Kubota_Industry-construction-1360x765.jpg',
  'ls-mt225s': '/assets/machinery/heavy_blue_agricultural_tractor_ls_mt7.jpg',
  'ls-mt240e': '/assets/machinery/high_horsepower_blue_ls_tractor_mt7.jpg',
  'ls-mt573cps': '/assets/machinery/ls_tractor_mt7_agricultural_heavy_tractor.jpg',
  'yanmar-yt235': '/assets/machinery/modern_high_performance_farm_tractor_with.jpg',
  'yanmar-yt359': '/assets/machinery/rugged_utility_farm_tractor_with_heavy.jpg',
  'yanmar-ag600': '/assets/machinery/modern_high_performance_farm_tractor_with.jpg',
  'ammann-ars70': '/assets/machinery/Ammann_ASC_150_Heavy_Compactor_Official_Photo.jpg',
  'ammann-arx26': '/assets/machinery/ammann_asphalt_vibratory_tandem_roller_machine.jpg',
  'ammann-apf30-65': '/assets/machinery/Ammann_ARR1575_Trench_Roller_Official_Photo.jpg',
  'imer-mcbp30': '/assets/machinery/imer_group_commercial_concrete_batching_and.jpg',
  'imer-mc1200': '/assets/machinery/imer_group_commercial_concrete_batching_and.jpg',
  'afex-midex': '/assets/machinery/certified_diesel_injection_common_rail_testing.jpg'
};

const filePath = 'src/data/officialCatalogs.ts';
let content = fs.readFileSync(filePath, 'utf8');

let updatedCount = 0;
for (const [id, localImg] of Object.entries(mappings)) {
  // Regex to match machine entry by id and replace its image field
  const blockRegex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?image:\\s*)['"][^'"]+['"]`, 'm');
  if (blockRegex.test(content)) {
    content = content.replace(blockRegex, `$1'${localImg}'`);
    updatedCount++;
    console.log(`Updated [${id}] -> ${localImg}`);
  } else {
    console.warn(`Could not find id: ${id}`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nSuccessfully mapped ${updatedCount} machines to local official HD assets!`);
