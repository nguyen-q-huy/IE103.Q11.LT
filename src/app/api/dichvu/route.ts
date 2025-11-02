import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';

export async function GET(req: Request) {
  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      const query = `
        SELECT MaDichVu, TenDichVu FROM DichVu
      `;
      const request = db.request();
      const result = await request.query(query);
      return new Response(JSON.stringify(result.recordset), { status: 200 });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const data = await db
        .collection('DichVu')
        .find({}, { projection: { _id: 0, MaDichVu: 1, TenDichVu: 1 } })
        .toArray();

      return new Response(JSON.stringify(data), { status: 200 });
    }

  } catch (error: any) {
    console.error('Lỗi lấy danh sách dịch vụ:', error);
    return new Response(
      JSON.stringify({
        error: 'Không thể lấy danh sách dịch vụ',
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
