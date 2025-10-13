import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: NextRequest) {
  try {
    const db = await getConnection();
    const result = await db.request().query(`
      SELECT MaThuoc, TenThuoc
      FROM Thuoc
      ORDER BY TenThuoc
    `);

    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('API /api/thuoc error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi server khi lấy thuốc' },
      { status: 500 }
    );
  }
}
