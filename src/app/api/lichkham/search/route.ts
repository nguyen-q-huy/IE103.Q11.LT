import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ngay = searchParams.get('ngay');
  const maBS = searchParams.get('maBS'); // tùy chọn

  try {
    const db = await getConnection();

    let query = 'SELECT MaLichKham, NgayKham, TenBenhNhan, NgaySinh,TenBacSi FROM '
        + 'LichKham L '
        + 'INNER JOIN BacSi B ON L.MaBacSi = B.MaBacSi '
        + 'INNER JOIN BenhNhan N ON L.MaBenhNhan = N.MaBenhNhan '
        + 'WHERE NgayKham = @Ngay';
    const request = db.request().input('Ngay', sql.Date, new Date(ngay!));

    if (maBS && maBS !== '0') {
      query += ' AND MaBacSi = @MaBS';
      request.input('MaBS', sql.Int, Number(maBS));
    }

    const result = await request.query(query);
    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}