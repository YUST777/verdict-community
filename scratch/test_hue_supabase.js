const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jokgfcglqqrzfitfnynu.supabase.co';
const supabaseKey = 'sb_publishable_-Nt-MrEXsytqITnY0GAe9Q_lArPek6x';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: '8241043@horus.edu.eg',
        password: 'wrong-password'
    });
    console.log('Error:', error?.message);
}

test();
