import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@lib/db';
import { getMongoConnection, getMaxValue } from '@/lib/mongo';
import sql from 'mssql';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hoTen, ngaySinh, gioiTinh, diaChi } = body;

    if (!hoTen || !ngaySinh || !gioiTinh) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      const request = db.request();

      request.input('TenBenhNhan', sql.NVarChar(100), hoTen);
      request.input('NgaySinh', sql.Date, ngaySinh);
      request.input('GioiTinh', sql.NVarChar(10), gioiTinh);
      request.input('DiaChi', sql.NVarChar(200), diaChi ?? null);

      await request.query(`
        INSERT INTO BenhNhan (TenBenhNhan, NgaySinh, GioiTinh, DiaChi)
        VALUES (@TenBenhNhan, @NgaySinh, @GioiTinh, @DiaChi)
      `);

      return NextResponse.json({ message: 'Thêm bệnh nhân thành công' });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const maBenhNhan = await getMaxValue('BenhNhan',"MaBenhNhan");
      const insertResult = await db.collection('BenhNhan').insertOne({
        MaBenhNhan: maBenhNhan === null?0:maBenhNhan + 1,
        TenBenhNhan: hoTen,
        NgaySinh: ngaySinh,
        GioiTinh: gioiTinh,
        ...(diaChi && { DiaChi: diaChi }),
      });

      return NextResponse.json({
        message: 'Thêm bệnh nhân thành công',
        insertedId: insertResult.insertedId,
      });
    }
  } catch (err: any) {
    console.error('Lỗi thêm bệnh nhân:', err);
    return NextResponse.json(
      { error: 'Lỗi server khi thêm bệnh nhân', details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  let search = req.nextUrl.searchParams.get('search') || '';
  search = search.trim();

  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();

      if (!search) {
        const result = await db
          .request()
          .query(`
            SELECT * FROM BenhNhan
            ORDER BY MaBenhNhan DESC
          `);
        return NextResponse.json(result.recordset);
      } else {
        const searchLike = `%${search}%`;
        const request = db.request();
        request.input('Search', sql.NVarChar, search);
        request.input('SearchLike', sql.NVarChar, searchLike);

        const result = await request.query(`
          SELECT * FROM BenhNhan
          WHERE
            CAST(MaBenhNhan AS NVARCHAR) LIKE @SearchLike OR
            TenBenhNhan LIKE @SearchLike OR
            DiaChi LIKE @SearchLike OR
            GioiTinh LIKE @SearchLike OR
            FORMAT(NgaySinh, 'yyyy-MM-dd') LIKE @SearchLike
          ORDER BY
            CASE
              WHEN CAST(MaBenhNhan AS NVARCHAR) = @Search THEN 0
              WHEN CAST(MaBenhNhan AS NVARCHAR) LIKE @SearchLike THEN 1
              WHEN TenBenhNhan LIKE @SearchLike THEN 2
              WHEN FORMAT(NgaySinh, 'yyyy-MM-dd') LIKE @SearchLike THEN 3
              WHEN DiaChi LIKE @SearchLike THEN 4
              ELSE 5
            END,
            MaBenhNhan DESC
        `);

        return NextResponse.json(result.recordset);
      }
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const filter: any = {};
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { MaBenhNhan: { $regex: regex } },
          { TenBenhNhan: { $regex: regex } },
          { DiaChi: { $regex: regex } },
          { GioiTinh: { $regex: regex } },
          { NgaySinh: { $regex: regex } }, // Ngày sinh lưu string hoặc ISODate
        ];
      }

      const data = await db
        .collection('BenhNhan')
        .find(filter, { projection: { _id: 0 } })
        .sort({ MaBenhNhan: -1 })
        .toArray();

      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.error('Lỗi lấy danh sách bệnh nhân:', err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
