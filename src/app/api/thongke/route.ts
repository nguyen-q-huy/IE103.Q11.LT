import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nam = searchParams.get('nam');
  const maBS = searchParams.get('maBS'); // tùy chọn

  if (!nam) {
    return new Response(JSON.stringify({ error: 'Thiếu tham số nam' }), { status: 400 });
  }

  const namNum = parseInt(nam, 10);
  if (isNaN(namNum)) {
    return new Response(JSON.stringify({ error: 'Tham số nam không hợp lệ' }), { status: 400 });
  }

  try {
    const db = await getConnection();

    let query = `
      SELECT BS.TenBacSi, COUNT(LK.MaLichKham) AS LuotKham
      FROM LichKham LK
      INNER JOIN BacSi BS ON LK.MaBacSi = BS.MaBacSi
      WHERE YEAR(LK.NgayKham) = @Nam
    `;

    const request = db.request().input('Nam', sql.Int, namNum);

    if (maBS && maBS !== '0') {
      query += ' AND LK.MaBacSi = @MaBS';
      request.input('MaBS', sql.Int, Number(maBS));
    }

    query += `
      GROUP BY BS.TenBacSi
      ORDER BY LuotKham DESC
    `;

    const result = await request.query(query);

    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
