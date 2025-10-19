import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const db = await getConnection();

    const [benhnhan, bacsi, loaidichvu, dichvu, thuoc, lichkham, kethuocthuoc, chidinh] = await Promise.all([
      db.request().query('SELECT * FROM BenhNhan'),
      db.request().query('SELECT * FROM BacSi'),
      db.request().query('SELECT * FROM LoaiDichVu'),
      db.request().query('SELECT * FROM DichVu'),
      db.request().query('SELECT * FROM Thuoc'),
      db.request().query('SELECT * FROM LichKham'),
      db.request().query('SELECT * FROM KeThuoc'),
      db.request().query('SELECT * FROM ChiDinh'),
    ]);

    // Convert NgayKham trong lichkham sang Date object
    const lichkhamConverted = lichkham.recordset.map(item => ({
      ...item,
      NgayKham: item.NgayKham ? new Date(item.NgayKham) : null,
    }));

    const data = {
      benhnhan: benhnhan.recordset,
      bacsi: bacsi.recordset,
      loaidichvu: loaidichvu.recordset,
      dichvu: dichvu.recordset,
      thuoc: thuoc.recordset,
      lichkham: lichkhamConverted,
      kethuocthuoc: kethuocthuoc.recordset,
      chidinh: chidinh.recordset,
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Lỗi khi lấy dữ liệu:', error);
    return NextResponse.json(
      { error: 'Không thể lấy dữ liệu export', details: error.message },
      { status: 500 }
    );
  }
}
