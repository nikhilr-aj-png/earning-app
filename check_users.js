const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, name, is_premium, premium_until')
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    console.log("USERS DATA:");
    users.forEach(u => {
        console.log(`ID: ${u.id} | Name: ${u.name} | Premium: ${u.is_premium} (${typeof u.is_premium}) | Until: ${u.premium_until}`);
    });
}

check();
