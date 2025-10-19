import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@lib/db';
import sql from 'mssql';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hoTen, ngaySinh, gioiTinh, diaChi } = body;

    if (!hoTen || !ngaySinh || !gioiTinh ) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    console.log("ssss")

    const db = await getConnection();
    const result = await db
      .request()
      .input('TenBenhNhan', sql.NVarChar(100), hoTen)
      .input('NgaySinh', sql.Date, ngaySinh)
      .input('GioiTinh', sql.NVarChar(10), gioiTinh)
      .input('DiaChi', sql.NVarChar(200), diaChi)
      .query(`
        INSERT INTO BenhNhan (TenBenhNhan, NgaySinh, GioiTinh, DiaChi)
        VALUES (@TenBenhNhan, @NgaySinh, @GioiTinh, @DiaChi)
      `);

    return NextResponse.json({ message: 'Thêm bệnh nhân thành công' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server khi thêm bệnh nhân' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  let search = req.nextUrl.searchParams.get('search') || '';
  search = search.trim();

  try {
    const db = await getConnection();

    if (!search) {
      // Nếu search rỗng thì lấy hết
      const result = await db
        .request()
        .query(`
          SELECT * FROM BenhNhan
          ORDER BY MaBenhNhan DESC
        `);
      return NextResponse.json(result.recordset);
    } else {
      // Có search thì lấy theo search
      const searchLike = `%${search}%`;

      const result = await db
        .request()
        .input('Search', sql.NVarChar, search)
        .input('SearchLike', sql.NVarChar, searchLike)
        .query(`
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
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
