const { icpchueQuery } = require('./src/lib/db');

async function test() {
    try {
        const res = await icpchueQuery('SELECT COUNT(*) FROM users');
        console.log('HUE Users count:', res.rows[0].count);
    } catch (e) {
        console.error('HUE DB Error:', e.message);
    }
}

test();
