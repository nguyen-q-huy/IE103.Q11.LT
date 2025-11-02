// src/app/api/lichkham/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';
import sql from 'mssql';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const maLichKham = parseInt(id, 10);

  if (isNaN(maLichKham)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();

      const result = await db
        .request()
        .input('MaLichKham', sql.Int, maLichKham)
        .query(`
          SELECT 
            lk.MaLichKham,
            lk.NgayKham,
            bn.TenBenhNhan,
            bn.NgaySinh,
            bn.GioiTinh,
            bs.TenBacSi
          FROM LichKham lk
          INNER JOIN BenhNhan bn ON lk.MaBenhNhan = bn.MaBenhNhan
          INNER JOIN BacSi bs ON lk.MaBacSi = bs.MaBacSi
          WHERE lk.MaLichKham = @MaLichKham
        `);

      if (result.recordset.length === 0) {
        return NextResponse.json({ error: 'Không tìm thấy lịch khám' }, { status: 404 });
      }

      return NextResponse.json(result.recordset[0], { status: 200 });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      console.log(maLichKham)
      const lichKham = await db.collection('LichKham').aggregate([
        { $match: { MaLichKham: maLichKham } },
        {
          $lookup: {
            from: 'BenhNhan',
            localField: 'MaBenhNhan',
            foreignField: 'MaBenhNhan',
            as: 'benhNhan'
          }
        },
        { $unwind: '$benhNhan' },
        {
          $lookup: {
            from: 'BacSi',
            localField: 'MaBacSi',
            foreignField: 'MaBacSi',
            as: 'bacSi'
          }
        },
        { $unwind: '$bacSi' },
        {
          $project: {
            _id: 0,
            MaLichKham: 1,
            NgayKham: 1,
            'TenBenhNhan': '$benhNhan.TenBenhNhan',
            'NgaySinh': '$benhNhan.NgaySinh',
            'GioiTinh': '$benhNhan.GioiTinh',
            'TenBacSi': '$bacSi.TenBacSi'
          }
        }
      ]).toArray();

      if (lichKham.length === 0) {
        return NextResponse.json({ error: 'Không tìm thấy lịch khám' }, { status: 404 });
      }

      return NextResponse.json(lichKham[0], { status: 200 });
    }
  } catch (error: any) {
    console.error('Lỗi lấy lịch khám:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      maLichKham, 
      chanDoan, 
      ghiChu, 
      thuoc, // [{ maThuoc: number, soLuong: number }, ...]
      dichVu // [{ maDichVu: number, soLuong: number }, ...]
    } = await req.json();

    // Validate cơ bản
    if (!maLichKham || !chanDoan || !ghiChu || !Array.isArray(thuoc) || !Array.isArray(dichVu)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ hoặc thiếu.' }, { status: 400 });
    }

    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      const request = db.request();

      // TVP thuốc
      const tvpThuoc = new sql.Table();
      tvpThuoc.columns.add('MaThuoc', sql.Int);
      tvpThuoc.columns.add('SoLuong', sql.Int);
      thuoc.forEach(t => {
        const ma = parseInt(t.maThuoc);
        const sl = parseInt(t.soLuong);
        if (!isNaN(ma) && !isNaN(sl)) tvpThuoc.rows.add(ma, sl);
      });

      // TVP dịch vụ
      const tvpDichVu = new sql.Table();
      tvpDichVu.columns.add('MaDichVu', sql.Int);
      tvpDichVu.columns.add('SoLan', sql.Int);
      dichVu.forEach(dv => {
        const ma = parseInt(dv.maDichVu);
        const sl = parseInt(dv.soLuong);
        if (!isNaN(ma) && !isNaN(sl)) tvpDichVu.rows.add(ma, sl);
      });

      request
        .input('MaLichKham', sql.Int, maLichKham)
        .input('ChanDoan', sql.NVarChar(255), chanDoan)
        .input('GhiChu', sql.NVarChar(255), ghiChu)
        .input('Thuoc', tvpThuoc)
        .input('DichVu', tvpDichVu);

      await request.execute('sp_CapNhatLichKhamVaChiTiet');

      return NextResponse.json({ success: true, message: 'Cập nhật thành công.' });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();

      // Cập nhật LichKham
      const updateLichKhamResult = await db.collection('LichKham').updateOne(
        { MaLichKham: maLichKham },
        { $set: { ChanDoan: chanDoan, GhiChu: ghiChu } }
      );

      if (updateLichKhamResult.matchedCount === 0) {
        return NextResponse.json({ error: 'Không tìm thấy lịch khám.' }, { status: 404 });
      }

      // Cập nhật thuốc: xóa cũ, thêm mới
      await db.collection('KeThuoc').deleteMany({ MaLichKham: maLichKham });
      if (thuoc.length > 0) {
        const thuocDocs = thuoc.map(t => ({
          MaLichKham: maLichKham,
          MaThuoc: parseInt(t.maThuoc),
          SoLuong: parseInt(t.soLuong)
        }));
        await db.collection('KeThuoc').insertMany(thuocDocs);
      }

      // Cập nhật dịch vụ: xóa cũ, thêm mới
      await db.collection('ChiDinh').deleteMany({ MaLichKham: maLichKham });
      if (dichVu.length > 0) {
        const dichVuDocs = dichVu.map(dv => ({
          MaLichKham: maLichKham,
          MaDichVu: parseInt(dv.maDichVu),
          SoLan: parseInt(dv.soLuong)
        }));
        await db.collection('ChiDinh').insertMany(dichVuDocs);
      }

      return NextResponse.json({ success: true, message: 'Cập nhật thành công.' });
    }
  } catch (error: any) {
    console.error('Lỗi cập nhật chi tiết khám:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật.', error: error.message },
      { status: 500 }
    );
  }
}