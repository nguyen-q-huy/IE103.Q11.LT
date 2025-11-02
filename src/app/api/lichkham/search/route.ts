import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';
import sql from 'mssql';

export async function GET(req: Request) {
  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';
    const { searchParams } = new URL(req.url);
    const ngay = searchParams.get('ngay');
    const q = searchParams.get('q')?.toLowerCase() || '';

    if (!ngay) {
      return new Response(
        JSON.stringify({ error: 'Thiếu tham số ngày' }),
        { status: 400 }
      );
    }

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      const request = db.request();

      let query = `
        SELECT L.MaLichKham, L.NgayKham, BN.TenBenhNhan, BN.NgaySinh, B.TenBacSi
        FROM LichKham L
        INNER JOIN BacSi B ON B.MaBacSi = L.MaBacSi
        INNER JOIN BenhNhan BN ON BN.MaBenhNhan = L.MaBenhNhan
        WHERE CONVERT(date, L.NgayKham) = @ngay
      `;

      request.input('ngay', sql.Date, ngay);

      if (q) {
        query += `
          AND (
            LOWER(BN.TenBenhNhan) LIKE '%' + @q + '%' OR
            LOWER(B.TenBacSi) LIKE '%' + @q + '%'
          )
        `;
        request.input('q', sql.NVarChar, q);
      }

      const result = await request.query(query);
      return new Response(JSON.stringify(result.recordset), { status: 200 });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const filter: any = {
        NgayKham: { $eq: new Date(ngay) }
      };

      if (q) {
        filter.$or = [
          { TenBenhNhan: { $regex: q, $options: 'i' } },
          { TenBacSi: { $regex: q, $options: 'i' } }
        ];
      }

      const data = await db
        .collection('LichKham')
        .aggregate([
          { $match: filter },
          {
            $lookup: {
              from: 'BenhNhan',
              localField: 'MaBenhNhan',
              foreignField: 'MaBenhNhan',
              as: 'benhnhan'
            }
          },
          { $unwind: '$benhnhan' },
          {
            $lookup: {
              from: 'BacSi',
              localField: 'MaBacSi',
              foreignField: 'MaBacSi',
              as: 'bacsi'
            }
          },
          { $unwind: '$bacsi' },
          {
            $project: {
              MaLichKham: 1,
              NgayKham: 1,
              TenBenhNhan: '$benhnhan.TenBenhNhan',
              NgaySinh: '$benhnhan.NgaySinh',
              TenBacSi: '$bacsi.TenBacSi'
            }
          }
        ])
        .toArray();

      return new Response(JSON.stringify(data), { status: 200 });
    }

  } catch (error: any) {
    console.error('Lỗi khi lấy lịch khám:', error);
    return new Response(
      JSON.stringify({ error: 'Không thể lấy lịch khám', details: error.message }),
      { status: 500 }
    );
  }
}
