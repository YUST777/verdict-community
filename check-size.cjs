const pg = require('pg');
const fs = require('fs');
const env = fs.readFileSync('/home/ubuntu/verdict/.env','utf8');
const url = env.match(/DATABASE_URL=(.*)/)[1];
const pool = new pg.Pool({connectionString:url,ssl:{rejectUnauthorized:false}});
pool.query("SELECT length(script::text) as size FROM video_shares WHERE id = $1", ['20a67c62-f412-4348-a015-2a8e015b7019']).then(r=>{
    console.log('Script JSON size:', (r.rows[0].size/1024).toFixed(0),'KB');
    pool.end();
});
