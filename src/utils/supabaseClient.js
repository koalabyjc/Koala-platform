import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yyljoovaunkwpktadpxz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bGpvb3ZhdW5rd3BrdGFkcHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDgyMTgsImV4cCI6MjA5NDY4NDIxOH0.qyC5M3RPiKJ4RCaBlrltznmcfsc74lWqZ_h6K34Ylrs';

const createBaseClient = (adminToken = null) => {
  const options = {};
  if (adminToken) {
    options.global = {
      headers: {
        'x-admin-token': adminToken
      }
    };
  }
  return createClient(supabaseUrl, supabaseKey, options);
};

// Client caches to avoid creating client objects repeatedly
const anonClient = createBaseClient();
let adminClient = null;

// Transparent Proxy that dynamically forwards calls to the correct client based on current session
export const supabase = new Proxy({}, {
  get(target, prop) {
    const isAdmin = localStorage.getItem('koala_auth_session') === 'true';
    let client;
    
    if (isAdmin) {
      if (!adminClient) {
        adminClient = createBaseClient('KoalaAdminSecretToken3062');
      }
      client = adminClient;
    } else {
      client = anonClient;
    }
    
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

