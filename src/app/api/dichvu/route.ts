import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db'; // Đường dẫn đến hàm kết nối
import sql from 'mssql';

export async function GET() {
  try {
    const db = await getConnection();
    const result = await db.request().query(`
      SELECT MaDichVu, TenDichVu FROM DichVu
    `);

    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('Lỗi lấy danh sách dịch vụ:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách dịch vụ', details: error.message },
      { status: 500 }
    );
  }
}
