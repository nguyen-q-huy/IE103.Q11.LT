import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ngay = searchParams.get('ngay');
  const q = searchParams.get('q')?.toLowerCase() || '';

  const db = await getConnection();
  const request = db.request();

  let query = `
    SELECT MaLichKham, NgayKham, TenBenhNhan, NgaySinh, TenBacSi
    FROM LichKham L
    INNER JOIN BacSi B ON B.MaBacSi = L.MaBacSi
    INNER JOIN BenhNhan BN ON BN.MaBenhNhan = BN.MaBenhNhan
    WHERE CONVERT(date, NgayKham) = @ngay
  `;

  request.input('ngay', sql.Date, ngay);

  if (q) {
    query += `
      AND (
        LOWER(TenBenhNhan) LIKE '%' + @q + '%' OR
        LOWER(TenBacSi) LIKE '%' + @q + '%'
      )
    `;
    request.input('q', sql.NVarChar, q);
  }

  const result = await request.query(query);
  return new Response(JSON.stringify(result.recordset), { status: 200 });
}
