/**
 * Script to convert CommonJS models to ES6 modules
 * Run: node convert-models-to-es6.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.join(__dirname, 'src', 'models');

const files = [
  'User.js', 'Device.js', 'Subscription.js', 
  'Ticket.js', 'Alert.js', 'MonitoringData.js', 'Billing.js'
];

console.log('🔄 Converting models to ES6...\n');
console.log(`📁 Models directory: ${modelsDir}\n`);

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - Not found, skipping`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace CommonJS imports
  content = content.replace(
    /const { createClient } = require\('@supabase\/supabase-js'\);/g,
    "import { createClient } from '@supabase/supabase-js';"
  );
  
  content = content.replace(
    /const config = require\('..\/config\/env'\);/g,
    "import env from '../config/env.js';"
  );
  
  // Replace config references
  content = content.replace(/config\.supabaseUrl/g, 'env.SUPABASE_URL');
  content = content.replace(/config\.supabaseServiceKey/g, 'env.SUPABASE_SERVICE_ROLE_KEY');
  
  // Replace CommonJS export
  content = content.replace(/module\.exports = (\w+);/g, 'export default $1;');
  
  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${file} - Converted`);
});

// Update index.js
const indexPath = path.join(modelsDir, 'index.js');
const indexContent = `/**
 * RMM Platform - Database Models
 * ES6 Module exports
 */

export { default as User } from './User.js';
export { default as Device } from './Device.js';
export { default as Subscription } from './Subscription.js';
export { default as Ticket } from './Ticket.js';
export { default as Alert } from './Alert.js';
export { default as MonitoringData } from './MonitoringData.js';
export { default as Billing } from './Billing.js';
`;

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ index.js - Updated\n');

console.log('✨ All models converted to ES6!');
console.log('\n📝 Next steps:');
console.log('   1. Ensure package.json has "type": "module"');
console.log('   2. Test imports: import { User } from "./src/models/index.js"');