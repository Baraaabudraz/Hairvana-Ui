const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is missing. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };