<?php
// Load from environment variables (set in Vercel dashboard or .env locally)
define('SUPABASE_URL',         getenv('SUPABASE_URL')         ?: '');
define('SUPABASE_ANON_KEY',    getenv('SUPABASE_ANON_KEY')    ?: '');
define('SUPABASE_SERVICE_KEY', getenv('SUPABASE_SERVICE_KEY') ?: '');
define('OPENAI_API_KEY',       getenv('OPENAI_API_KEY')       ?: '');
define('JWT_SECRET',           getenv('JWT_SECRET')           ?: 'change-me-in-production');
define('APP_ENV',              getenv('APP_ENV')              ?: 'production');
define('DEMO_FAMILY_ID',       'demo-family-00000000-0000-0000-0000-000000000000');
