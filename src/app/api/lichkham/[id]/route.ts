// src/app/api/lichkham/[id]/route.ts

import { getConnection } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const db = await getConnection();

    const result = await db
      .request()
      .input('MaLichKham', sql.Int, parseInt(id))
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
      return new Response(JSON.stringify({ error: 'Không tìm thấy lịch khám' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result.recordset[0]), {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || 'Lỗi server' }), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      maLichKham, 
      chanDoan, 
      ghiChu, 
      thuoc, // [{ maThuoc: number, soLuong: number }, ...]
      dichVu
    } = await req.json();

    // Validate
    if (!maLichKham || !chanDoan || !ghiChu || !Array.isArray(thuoc) || !Array.isArray(dichVu)) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ hoặc thiếu.' }, 
        { status: 400 }
      );
    }

    const db = await getConnection();
    const request = db.request();

    // Tạo TVP (table-valued parameter) cho danh sách thuốc
    const tvpThuoc = new sql.Table();

    tvpThuoc.columns.add('MaThuoc', sql.Int);
    tvpThuoc.columns.add('SoLuong', sql.Int);

    for (const t of thuoc) {
      // Chuyển dữ liệu an toàn, có thể kiểm tra ở đây
      const ma = parseInt(t.maThuoc);
      const sl = parseInt(t.soLuong);
      if (!isNaN(ma) && !isNaN(sl)) {
        tvpThuoc.rows.add(ma, sl);
      }
    }

    const tvpDichVu = new sql.Table();

    for (const dv of dichVu) {
      const ma = parseInt(dv.maDichVu);
      const sl = parseInt(dv.soLuong);
      if (!isNaN(ma) && !isNaN(sl)) {
        tvpDichVu.rows.add(ma, sl);
      }
    }

    request
      .input('MaLichKham', sql.Int, maLichKham)
      .input('ChanDoan', sql.NVarChar(255), chanDoan)
      .input('GhiChu', sql.NVarChar(255), ghiChu)
      .input('Thuoc', tvpThuoc)
      .input('DichVu', tvpDichVu);

    await request.execute('sp_CapNhatLichKhamVaChiTiet');

    return NextResponse.json({ success: true, message: 'Cập nhật thành công.' });
  } catch (error: any) {
    console.error('Lỗi cập nhật:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật.', error: error.message },
      { status: 500 }
    );
  }
}
