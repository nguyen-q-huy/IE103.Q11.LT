import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';
import sql from 'mssql';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const maLichKham = parseInt(id, 10);

  if (isNaN(maLichKham)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
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
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();

      // 1. Lấy chẩn đoán và ghi chú
      const lichKham = await db.collection('LichKham').findOne(
        { MaLichKham: maLichKham },
        { projection: { _id: 0, ChanDoan: 1, GhiChu: 1 } }
      );

      if (!lichKham) {
        return NextResponse.json({ error: 'Không tìm thấy lịch khám' }, { status: 404 });
      }

      // 2. Lấy thuốc kê
      const thuoc = await db
        .collection('KeThuoc')
        .find({ MaLichKham: maLichKham }, { projection: { _id: 0 } })
        .toArray();

      // 3. Lấy dịch vụ chỉ định
      const dichVu = await db
        .collection('ChiDinh')
        .find({ MaLichKham: maLichKham }, { projection: { _id: 0 } })
        .toArray();

      return NextResponse.json({
        chanDoan: lichKham.ChanDoan,
        ghiChu: lichKham.GhiChu,
        thuoc,
        dichVu,
      });
    }
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
    const maLichKhamStr = req.nextUrl.pathname.split('/').pop();
    if (!maLichKhamStr) {
      return NextResponse.json(
        { success: false, message: 'Thiếu MaLichKham' },
        { status: 400 }
      );
    }

    const maLichKham = parseInt(maLichKhamStr, 10);
    if (isNaN(maLichKham)) {
      return NextResponse.json(
        { success: false, message: 'MaLichKham không hợp lệ' },
        { status: 400 }
      );
    }

    const { chanDoan, ghiChu, thuoc, dichVu } = await req.json();

    if (!Array.isArray(thuoc)) {
      return NextResponse.json(
        { success: false, message: 'Danh sách thuốc không hợp lệ' },
        { status: 400 }
      );
    }

    if (!Array.isArray(dichVu)) {
      return NextResponse.json(
        { success: false, message: 'Danh sách dịch vụ không hợp lệ' },
        { status: 400 }
      );
    }

    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
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

      // Truyền tham số và gọi stored procedure
      request.input('MaLichKham', sql.Int, maLichKham);
      request.input('ChanDoan', sql.NVarChar(255), chanDoan);
      request.input('GhiChu', sql.NVarChar(255), ghiChu);
      request.input('Thuoc', thuocTable);
      request.input('DichVu', dvTable);

      await request.execute('sp_CapNhatLichKhamVaChiTiet');

      return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();

      // Cập nhật chẩn đoán và ghi chú
      await db.collection('LichKham').updateOne(
        { MaLichKham: maLichKham },
        { $set: { ChanDoan: chanDoan, GhiChu: ghiChu } }
      );

      // Cập nhật thuốc: xóa cũ và insert mới
      await db.collection('KeThuoc').deleteMany({ MaLichKham: maLichKham });
      if (thuoc.length > 0) {
        const thuocDocs = thuoc.map((t: any) => ({
          MaLichKham: maLichKham,
          MaThuoc: t.maThuoc,
          SoLuong: t.soLuong,
        }));
        await db.collection('KeThuoc').insertMany(thuocDocs);
      }

      // Cập nhật dịch vụ: xóa cũ và insert mới
      await db.collection('ChiDinh').deleteMany({ MaLichKham: maLichKham });
      if (dichVu.length > 0) {
        const dvDocs = dichVu.map((d: any) => ({
          MaLichKham: maLichKham,
          MaDichVu: d.maDichVu,
          SoLan: d.soLan,
        }));
        await db.collection('ChiDinh').insertMany(dvDocs);
      }

      return NextResponse.json({ success: true, message: 'Cập nhật thành công (MongoDB)' });
    }
  } catch (error: any) {
    console.error('Lỗi cập nhật chi tiết khám:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật chi tiết khám.', error: error.message },
      { status: 500 }
    );
  }
}
