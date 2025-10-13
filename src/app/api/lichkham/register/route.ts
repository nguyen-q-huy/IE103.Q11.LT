import { getConnection } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET() {
  return NextResponse.json({ status: 'OK' });
}

export async function POST(req: NextRequest) {
  try {
    const {
      maBacSi,
      tenBenhNhan,
      ngaySinh,
      gioiTinh,
      diaChi,
      ngayKham,
      ghiChu,
    } = await req.json();

    // Validate bắt buộc
    if (!maBacSi || !tenBenhNhan || !ngaySinh || !gioiTinh || !ngayKham) {
      console.log(maBacSi, tenBenhNhan, ngaySinh, gioiTinh, ngayKham)
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc.' }, { status: 400 });
    }

    const db = await getConnection();
    const request = db.request();

    // Truyền các tham số vào stored procedure
    request
      .input('MaBacSi', sql.Int, maBacSi)
      .input('TenBenhNhan', sql.NVarChar(100), tenBenhNhan)
      .input('NgaySinh', sql.Date, new Date(ngaySinh))
      .input('GioiTinh', sql.NVarChar(10), gioiTinh)
      .input('DiaChi', sql.NVarChar(200), diaChi || null)
      .input('NgayKham', sql.Date, new Date(ngayKham))
      .input('GhiChu', sql.NVarChar(255), ghiChu || null);

    // Gọi stored procedure
    await request.execute('sp_DangKyLichKham');

    return NextResponse.json({ success: true, message: 'Đăng ký lịch khám thành công.' });
  } catch (error: any) {
    console.error('Lỗi đăng ký khám:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi đăng ký khám.', error: error.message },
      { status: 500 }
    );
  }
}
