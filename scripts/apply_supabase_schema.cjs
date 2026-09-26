process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connStrings = [
  'postgres://postgres.thxpgtkeszcfxiqypklq:rwI2JxWwgm5186kc@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  'postgres://postgres.thxpgtkeszcfxiqypklq:rwI2JxWwgm5186kc@aws-0-us-east-1.pooler.supabase.com:5432/postgres'
];

async function run() {
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260926_tmd_v9_master_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  let connected = false;
  let client = null;

  for (const connStr of connStrings) {
    console.log(`Connecting to: ${connStr.split('@')[1]}...`);
    client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log('✓ Successfully connected to Supabase PostgreSQL database!');
      connected = true;
      break;
    } catch (err) {
      console.log(`Connection attempt failed: ${err.message}`);
    }
  }

  if (!connected) {
    console.error('Could not connect to Supabase.');
    process.exit(1);
  }

  console.log('Executing master schema migration...');
  try {
    await client.query(sql);
    console.log('✓ Master schema and RLS policies applied successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\nVerified public tables in Supabase:');
    res.rows.forEach(r => console.log(`  ✓ ${r.table_name}`));

    await client.end();
  } catch (err) {
    console.error('SQL Execution Error:', err.message);
    await client.end();
    process.exit(1);
  }
}

run();
