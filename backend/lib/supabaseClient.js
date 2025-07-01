// backend/lib/supabaseClient.js
// This file sets up the Supabase client for future use in the backend.
// Usage example:
// const supabase = require('./supabaseClient');
// supabase.from('table').select('*');

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase; 