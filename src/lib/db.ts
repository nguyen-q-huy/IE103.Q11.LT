
import sql from 'mssql';

const config: sql.config = {
  user: 'qltt',
  password: '1',
  server: 'localhost',
  database: 'QLBenhVien',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null


export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

