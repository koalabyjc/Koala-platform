import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yyljoovaunkwpktadpxz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bGpvb3ZhdW5rd3BrdGFkcHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDgyMTgsImV4cCI6MjA5NDY4NDIxOH0.qyC5M3RPiKJ4RCaBlrltznmcfsc74lWqZ_h6K34Ylrs';

export const supabase = createClient(supabaseUrl, supabaseKey);
