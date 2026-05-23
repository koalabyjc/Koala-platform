const fs = require('fs');
const text = fs.readFileSync('API Keys _ Settings _ Koala By JC _ HG DesignPR _ Supabase.mhtml', 'utf8');
const noBreaks = text.replace(/=\r?\n/g, ''); // remove soft line breaks
const matches = noBreaks.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g);

if (matches) {
    const unique = [...new Set(matches)];
    console.log('Tokens found:', unique.filter(k => k.length > 50));
} else {
    console.log('No tokens found.');
}
