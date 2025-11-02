import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';
import sql from 'mssql';

export async function GET(req: Request) {
  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';
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

    if (dbType === 'sqlserver') {
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
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const match: any = {
        NgayKham: {
          $gte: new Date(`${namNum}-01-01T00:00:00.000Z`),
          $lt: new Date(`${namNum + 1}-01-01T00:00:00.000Z`)
        }
      };
      if (maBS && maBS !== '0') {
        match.MaBacSi = Number(maBS);
      }

      const data = await db
        .collection('LichKham')
        .aggregate([
          { $match: match },
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
            $group: {
              _id: '$bacsi.TenBacSi',
              LuotKham: { $sum: 1 }
            }
          },
          { $project: { TenBacSi: '$_id', LuotKham: 1, _id: 0 } },
          { $sort: { LuotKham: -1 } }
        ])
        .toArray();

      return new Response(JSON.stringify(data), { status: 200 });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
