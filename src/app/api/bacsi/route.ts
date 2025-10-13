import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: Request) {

  try {
    const db = await getConnection();

    let query = 'SELECT MaBacSi, TenBacSi FROM '
        + 'BacSi ';
    const request = db.request();

    const result = await request.query(query);
    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}