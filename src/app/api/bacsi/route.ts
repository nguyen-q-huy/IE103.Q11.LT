import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';

export async function GET(req: Request) {
  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      let query = 'SELECT MaBacSi, TenBacSi FROM '
        + 'BacSi ';
      const request = db.request();
      const result = await request.query(query);
      return new Response(JSON.stringify(result.recordset), { status: 200 });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const data = await db
        .collection('BacSi')
        .find({}, { projection: { _id: 0, MaBacSi: 1, TenBacSi: 1 } })
        .toArray();

      return new Response(JSON.stringify(data), { status: 200 });
    }


  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}