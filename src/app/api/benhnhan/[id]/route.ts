import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';
import sql from 'mssql';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const maBenhNhan = Number(id);

  if (isNaN(maBenhNhan)) {
    return NextResponse.json({ error: 'ID bệnh nhân không hợp lệ' }, { status: 400 });
  }

  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();

      const query = `
        SELECT MaBenhNhan, TenBenhNhan, NgaySinh, GioiTinh, DiaChi
        FROM BenhNhan
        WHERE MaBenhNhan = @MaBenhNhan
      `;

      const request = db.request();
      request.input('MaBenhNhan', sql.Int, maBenhNhan);

      const result = await request.query(query);

      if (result.recordset.length === 0) {
        return NextResponse.json({ error: 'Không tìm thấy bệnh nhân' }, { status: 404 });
      }

      return NextResponse.json(result.recordset[0]);
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const data = await db
        .collection('BenhNhan')
        .findOne({ MaBenhNhan: maBenhNhan }, { projection: { _id: 0 } });

      if (!data) {
        return NextResponse.json({ error: 'Không tìm thấy bệnh nhân' }, { status: 404 });
      }

      return NextResponse.json(data);
    }

  } catch (error: any) {
    console.error('Lỗi lấy thông tin bệnh nhân:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const maBenhNhan = Number(params.id);

  if (isNaN(maBenhNhan)) {
    return NextResponse.json(
      { success: false, message: 'ID bệnh nhân không hợp lệ' },
      { status: 400 }
    );
  }

  try {
    const { TenBenhNhan, NgaySinh, GioiTinh, DiaChi } = await req.json();

    if (!TenBenhNhan || !NgaySinh || !GioiTinh) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin cập nhật' },
        { status: 400 }
      );
    }

    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      const request = db.request();

      request.input('MaBenhNhan', sql.Int, maBenhNhan);
      request.input('TenBenhNhan', sql.NVarChar(100), TenBenhNhan);
      request.input('NgaySinh', sql.Date, NgaySinh);
      request.input('GioiTinh', sql.NVarChar(10), GioiTinh);
      request.input('DiaChi', sql.NVarChar(200), DiaChi ?? null);

      const result = await request.query(`
        UPDATE BenhNhan
        SET TenBenhNhan = @TenBenhNhan,
            NgaySinh = @NgaySinh,
            GioiTinh = @GioiTinh,
            DiaChi = @DiaChi
        WHERE MaBenhNhan = @MaBenhNhan
      `);

      if (result.rowsAffected[0] === 0) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy bệnh nhân' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const updateResult = await db.collection('BenhNhan').updateOne(
        { MaBenhNhan: maBenhNhan },
        {
          $set: {
            TenBenhNhan,
            NgaySinh,
            GioiTinh,
            ...(DiaChi && { DiaChi }),
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy bệnh nhân' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    }
  } catch (error: any) {
    console.error('Lỗi cập nhật bệnh nhân:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi server khi cập nhật bệnh nhân',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
