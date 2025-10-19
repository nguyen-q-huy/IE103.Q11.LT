import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const maBenhNhan = Number(id);
  if (isNaN(maBenhNhan)) {
    return NextResponse.json({ error: 'ID bệnh nhân không hợp lệ' }, { status: 400 });
  }

  // Lấy query tìm kiếm từ URL
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  try {
    const db = await getConnection();

    // Chuẩn bị câu truy vấn với điều kiện LIKE nếu có q
    let query = `
      SELECT MaLichKham, NgayKham, TenBacSi, ChanDoan, GhiChu
      FROM LichKham L
      INNER JOIN BacSi B on L.MaBacSi = B.MaBacSi
      WHERE MaBenhNhan = @MaBenhNhan
    `;

    if (q) {
      query += `
        AND (
          TenBacSi LIKE @search OR
          ChanDoan LIKE @search OR
          GhiChu LIKE @search OR
          CONVERT(varchar, NgayKham, 23) LIKE @search
        )
      `;
    }

    const request = db.request();
    request.input('MaBenhNhan', sql.Int, maBenhNhan);
    if (q) {
      request.input('search', sql.NVarChar, `%${q}%`);
    }

    const result = await request.query(query);

    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('Lỗi lấy lịch khám:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

interface Params {
  maBenhNhan: string;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const maBenhNhan = Number(id);
    console.log(isNaN(maBenhNhan))
    
    if (isNaN(maBenhNhan)) {
      return NextResponse.json({ error: 'Mã bệnh nhân không hợp lệ.' }, { status: 400 });
    }

    const { ngayKham, MaBacSi, ghiChu } = await req.json();

    console.log(ngayKham,MaBacSi,ghiChu)

    // Validate bắt buộc
    if (!ngayKham || !MaBacSi) {
      return NextResponse.json({ error: 'Vui lòng cung cấp ngày khám và bác sĩ.' }, { status: 400 });
    }
    console.log("aaaaaaaaaaddddddđ")

    const db = await getConnection();
    const request = db.request();

    request
      .input('MaBenhNhan', sql.Int, maBenhNhan)
      .input('MaBacSi', sql.Int, MaBacSi)
      .input('NgayKham', sql.Date, new Date(ngayKham))
      .input('GhiChu', sql.NVarChar(255), ghiChu || null);

    // Giả sử bạn có stored procedure tương ứng, ví dụ: sp_DangKyLichKhamTheoBenhNhan
    await request.execute('sp_DangKyLichKhamTheoBenhNhan');

    return NextResponse.json({ success: true, message: 'Đăng ký lịch khám thành công.' });
  } catch (error: any) {
    console.error('Lỗi đăng ký lịch khám:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi đăng ký lịch khám.', error: error.message },
      { status: 500 }
    );
  }
}
