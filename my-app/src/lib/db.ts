import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // 你部署環境變數
});

export default pool;
