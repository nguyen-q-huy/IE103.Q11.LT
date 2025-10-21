import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';  // hàm lấy connection MSSQL của bạn
import sql from 'mssql';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const maLichKham = parseInt(id, 10);

  if (isNaN(maLichKham)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const db = await getConnection();

    // 1. Lấy chẩn đoán và ghi chú
    const lichKhamRequest = db.request();
    lichKhamRequest.input('MaLichKham', sql.Int, maLichKham);

    const lichKhamResult = await lichKhamRequest.query(`
      SELECT ChanDoan, GhiChu
      FROM LichKham
      WHERE MaLichKham = @MaLichKham
    `);

    if (lichKhamResult.recordset.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy lịch khám' }, { status: 404 });
    }

    const { ChanDoan, GhiChu } = lichKhamResult.recordset[0];

    // 2. Lấy thuốc kê
    const thuocResult = await db.request()
      .input('MaLichKham', sql.Int, maLichKham)
      .query(`
        SELECT MaThuoc, SoLuong
        FROM KeThuoc
        WHERE MaLichKham = @MaLichKham
      `);

    // 3. Lấy dịch vụ chỉ định
    const dichVuResult = await db.request()
      .input('MaLichKham', sql.Int, maLichKham)
      .query(`
        SELECT MaDichVu, SoLan
        FROM ChiDinh
        WHERE MaLichKham = @MaLichKham
      `);

    return NextResponse.json({
      chanDoan: ChanDoan,
      ghiChu: GhiChu,
      thuoc: thuocResult.recordset,
      dichVu: dichVuResult.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy chi tiết khám:', error);
    return NextResponse.json(
      { error: 'Lỗi server', details: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const maLichKham = req.nextUrl.pathname.split('/').pop();

    if (!maLichKham) {
      return NextResponse.json({ success: false, message: 'Thiếu MaLichKham' }, { status: 400 });
    }

    const { chanDoan, ghiChu, thuoc, dichVu } = await req.json();

    // Validate danh sách thuốc
    if (!Array.isArray(thuoc)) {
      return NextResponse.json({ success: false, message: 'Danh sách thuốc không hợp lệ' }, { status: 400 });
    }

    // Validate danh sách dịch vụ
    if (!Array.isArray(dichVu)) {
      return NextResponse.json({ success: false, message: 'Danh sách dịch vụ không hợp lệ' }, { status: 400 });
    }

    const db = await getConnection();
    const request = db.request();

    // Tạo TVP cho thuốc
    const thuocTable = new sql.Table('ThuocTableType');
    thuocTable.columns.add('MaThuoc', sql.Int);
    thuocTable.columns.add('SoLuong', sql.Int);
    thuoc.forEach((t: any) => {
      thuocTable.rows.add(t.maThuoc, t.soLuong);
    });

    // Tạo TVP cho dịch vụ
    const dvTable = new sql.Table('DichVuTableType');
    dvTable.columns.add('MaDichVu', sql.Int);
    dvTable.columns.add('SoLan', sql.Int);
    dichVu.forEach((d: any) => {
      dvTable.rows.add(d.maDichVu, d.soLan);
    });

    // Truyền tham số
    request.input('MaLichKham', sql.Int, Number(maLichKham));
    request.input('ChanDoan', sql.NVarChar(255), chanDoan);
    request.input('GhiChu', sql.NVarChar(255), ghiChu);
    request.input('Thuoc', thuocTable);
    request.input('DichVu', dvTable);

    // Gọi stored procedure
    await request.execute('sp_CapNhatLichKhamVaChiTiet');

    return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error: any) {
    console.error('Lỗi cập nhật chi tiết khám:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật chi tiết khám.', error: error.message },
      { status: 500 }
    );
  }
}
