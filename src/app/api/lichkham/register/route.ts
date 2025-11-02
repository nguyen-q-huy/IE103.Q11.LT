import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';
import sql from 'mssql';

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
      console.log(maBacSi, tenBenhNhan, ngaySinh, gioiTinh, ngayKham);
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc.' },
        { status: 400 }
      );
    }

    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
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

      await request.execute('sp_DangKyLichKham');

      return NextResponse.json({ success: true, message: 'Đăng ký lịch khám thành công (SQL Server).' });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();

      // Kiểm tra tồn tại bác sĩ
      const bacSi = await db.collection('BacSi').findOne({ MaBacSi: maBacSi });
      if (!bacSi) {
        return NextResponse.json({ error: 'Bác sĩ không tồn tại.' }, { status: 400 });
      }

      // Kiểm tra bệnh nhân đã tồn tại chưa (trùng tên + ngày sinh + giới tính)
      let benhNhan = await db.collection('BenhNhan').findOne({
        TenBenhNhan: tenBenhNhan,
        NgaySinh: new Date(ngaySinh),
        GioiTinh: gioiTinh,
      });

      // Nếu chưa có thì thêm mới
      if (!benhNhan) {
        const result = await db.collection('BenhNhan').insertOne({
          TenBenhNhan: tenBenhNhan,
          NgaySinh: new Date(ngaySinh),
          GioiTinh: gioiTinh,
          DiaChi: diaChi || null,
        });
        benhNhan = { _id: result.insertedId };
      }

      // Thêm lịch khám
      await db.collection('LichKham').insertOne({
        NgayKham: new Date(ngayKham),
        MaBacSi: maBacSi,
        MaBenhNhan: benhNhan._id,
        GhiChu: ghiChu || null,
      });

      return NextResponse.json({ success: true, message: 'Đăng ký lịch khám thành công (MongoDB).' });
    }
  } catch (error: any) {
    console.error('Lỗi đăng ký khám:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi đăng ký khám.', error: error.message },
      { status: 500 }
    );
  }
}
