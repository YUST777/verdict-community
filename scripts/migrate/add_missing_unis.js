import pg from 'pg';
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 8000,
});

const unis = [
    ['Damietta University', 'damietta', 'du.edu.eg', 'DU', 'public'],
    ['Port Said University', 'portsaid', 'psu.edu.eg', 'PSU', 'public'],
    ['Damanhour University', 'damanhour', 'damanhour.edu.eg', 'DMU', 'public'],
    ['Aswan University', 'aswan', 'aswu.edu.eg', 'ASWU', 'public'],
    ['Luxor University', 'luxor', 'luxor.edu.eg', 'LU', 'public'],
    ['New Valley University', 'newvalley', 'nvu.edu.eg', 'NVU', 'public'],
    ['Matrouh University', 'matrouh', 'mau.edu.eg', 'MAU', 'public'],
    ['Arish University', 'arish', 'aru.edu.eg', 'ARU', 'public'],
    ['Sohag University', 'sohag', 'sohag.edu.eg', 'SHU', 'public'],
    ['Ahram Canadian University', 'acu', 'acu.edu.eg', 'ACU', 'private'],
    ['Egyptian Russian University', 'eru', 'eru.edu.eg', 'ERU', 'private'],
    ['Sinai University', 'sinai', 'sinai.edu.eg', 'SiU', 'private'],
    ['Delta University', 'delta', 'deltauniv.edu.eg', 'DUS', 'private'],
    ['Deraya University', 'deraya', 'deraya.edu.eg', 'DRU', 'private'],
    ['King Salman International University', 'ksiu', 'ksiu.edu.eg', 'KSIU', 'private'],
    ['Galala University', 'galala', 'gu.edu.eg', 'GU', 'private'],
    ['New Giza University', 'ngu-uni', 'ngu.edu.eg', 'NGU', 'private'],
    ['Alamein International University', 'aiu', 'aiu.edu.eg', 'AIU', 'private'],
    ['El Shorouk Academy', 'sha', 'sha.edu.eg', 'SHA', 'private'],
    ['Canadian International College', 'cic', 'cic-cairo.edu.eg', 'CIC', 'private'],
    ['Higher Technological Institute', 'hti', 'hti.edu.eg', 'HTI', 'civil'],
    ['Institute of Aviation Engineering', 'iaet', 'iaet.edu.eg', 'IAET', 'civil'],
    ['Higher Institute of Engineering', 'hie', 'hie.edu.eg', 'HIE', 'civil'],
    ['Sadat Academy', 'sams', 'sams.edu.eg', 'SAMS', 'civil'],
    ['Egyptian E-Learning University', 'eelu', 'eelu.edu.eg', 'EELU', 'civil'],
    ['Egypt-Japan University', 'ejust', 'ejust.edu.eg', 'E-JUST', 'special'],
    ['Canadian International College Alexandria', 'cica', 'cic-alexandria.edu.eg', 'CICA', 'civil'],
    ['Workers University', 'wu', 'wu.edu.eg', 'WU', 'civil'],
    ['University of Science and Technology at Zewail City', 'ustc', 'ustc.edu.eg', 'USTC', 'special'],
];

let added = 0;
for (const [name, slug, domain, shortName, type] of unis) {
    try {
        const r = await pool.query(
            `INSERT INTO universities (name, slug, email_domain, short_name, type, is_active)
             VALUES ($1, $2, $3, $4, $5, true)
             ON CONFLICT (email_domain) DO NOTHING RETURNING id`,
            [name, slug, domain, shortName, type]
        );
        if (r.rows.length > 0) added++;
    } catch (e) {
        console.log('Skip', name, e.message);
    }
}

// Fix AUC domain
await pool.query("UPDATE universities SET email_domain = 'aucegypt.edu' WHERE name = 'American University in Cairo' AND email_domain = 'aucegypt.edu.eg'");

// Fix AAST domain
await pool.query("UPDATE universities SET email_domain = 'aast.edu' WHERE name LIKE '%Arab Academy%' AND email_domain = 'aast.edu.eg'");

const r = await pool.query('SELECT COUNT(*) FROM universities');
console.log(`Added ${added} new. Total: ${r.rows[0].count} universities`);

// Auto-create rooms
await pool.query(`
    INSERT INTO university_rooms (university_id, slug, description)
    SELECT u.id, u.slug, 'Official training room for ' || u.name
    FROM universities u WHERE u.is_active = true AND u.slug IS NOT NULL
    ON CONFLICT (university_id) DO NOTHING
`);

const r2 = await pool.query('SELECT COUNT(*) FROM university_rooms');
console.log(`Total rooms: ${r2.rows[0].count}`);

await pool.end();
