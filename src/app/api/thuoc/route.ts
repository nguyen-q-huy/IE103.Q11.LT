import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';
import sql from 'mssql';

export async function GET(req: Request) {
  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      const query = `
        SELECT MaThuoc, TenThuoc
        FROM Thuoc
        ORDER BY TenThuoc
      `;
      const result = await db.request().query(query);
      return new Response(JSON.stringify(result.recordset), { status: 200 });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const data = await db
        .collection('Thuoc')
        .find({}, { projection: { _id: 0, MaThuoc: 1, TenThuoc: 1 } })
        .sort({ TenThuoc: 1 })
        .toArray();

      return new Response(JSON.stringify(data), { status: 200 });
    }

  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách thuốc:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Lỗi server khi lấy thuốc' }),
      { status: 500 }
    );
  }
}
