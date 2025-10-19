import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db'; // hàm lấy connection MSSQL của bạn
import sql from 'mssql';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const maBenhNhan = parseInt(id, 10);

  if (isNaN(maBenhNhan)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const db = await getConnection();

    const result = await db
      .request()
      .input('MaBenhNhan', sql.Int, maBenhNhan)
      .query(`
        SELECT MaBenhNhan, TenBenhNhan, NgaySinh, GioiTinh, DiaChi
        FROM BenhNhan
        WHERE MaBenhNhan = @MaBenhNhan
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bệnh nhân' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error: any) {
    console.error('Lỗi lấy thông tin bệnh nhân:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const maBenhNhan = parseInt(params.id, 10);

  if (isNaN(maBenhNhan)) {
    return NextResponse.json(
      { success: false, message: 'ID không hợp lệ' },
      { status: 400 }
    );
  }

  try {
    const { TenBenhNhan, NgaySinh, GioiTinh, DiaChi } = await req.json();

    if (!TenBenhNhan || !NgaySinh || !GioiTinh ) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin cập nhật' },
        { status: 400 }
      );
    }

    const db = await getConnection();
    const request = db.request();

    request.input('MaBenhNhan', sql.Int, maBenhNhan);
    request.input('TenBenhNhan', sql.NVarChar(100), TenBenhNhan);
    request.input('NgaySinh', sql.Date, NgaySinh);
    request.input('GioiTinh', sql.NVarChar(10), GioiTinh);
    request.input('DiaChi', sql.NVarChar(200), DiaChi);

    await request.query(`
      UPDATE BenhNhan
      SET TenBenhNhan = @TenBenhNhan,
          NgaySinh = @NgaySinh,
          GioiTinh = @GioiTinh,
          DiaChi = @DiaChi
      WHERE MaBenhNhan = @MaBenhNhan
    `);

    return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
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
