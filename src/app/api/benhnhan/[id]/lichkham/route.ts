import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getMongoConnection, getMaxValue } from '@/lib/mongo';
import sql from 'mssql';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const maBenhNhan = Number(id);

  if (isNaN(maBenhNhan)) {
    return NextResponse.json({ error: 'ID bệnh nhân không hợp lệ' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();

      let query = `
        SELECT L.MaLichKham, L.NgayKham, B.TenBacSi, L.ChanDoan, L.GhiChu
        FROM LichKham L
        INNER JOIN BacSi B ON L.MaBacSi = B.MaBacSi
        WHERE L.MaBenhNhan = @MaBenhNhan
      `;

      if (q) {
        query += `
          AND (
            B.TenBacSi LIKE @search OR
            L.ChanDoan LIKE @search OR
            L.GhiChu LIKE @search OR
            CONVERT(varchar, L.NgayKham, 23) LIKE @search
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
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();

      const matchFilter: any = { MaBenhNhan: maBenhNhan };

      const pipeline: any[] = [
        { $match: matchFilter },
        {
          $lookup: {
            from: 'BacSi',
            localField: 'MaBacSi',
            foreignField: 'MaBacSi',
            as: 'bacsi'
          }
        },
        { $unwind: { path: '$bacsi', preserveNullAndEmptyArrays: true } }
      ];

      // Thêm tìm kiếm nếu q có giá trị
      if (q) {
        pipeline.push({
          $match: {
            $or: [
              { 'bacsi.TenBacSi': { $regex: q, $options: 'i' } },
              { ChanDoan: { $regex: q, $options: 'i' } },
              { GhiChu: { $regex: q, $options: 'i' } },
              { NgayKham: { $regex: q, $options: 'i' } }
            ]
          }
        });
      }

      pipeline.push({
        $project: {
          _id: 0,
          MaLichKham: 1,
          NgayKham: 1,
          TenBacSi: '$bacsi.TenBacSi',
          ChanDoan: 1,
          GhiChu: 1
        }
      });

      const data = await db.collection('LichKham').aggregate(pipeline).toArray();

      return NextResponse.json(data);
    }

  } catch (error: any) {
    console.error('Lỗi lấy lịch khám:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

interface Params {
  maBenhNhan: string;
}


export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const maBenhNhan = Number(id);

  if (isNaN(maBenhNhan)) {
    return NextResponse.json(
      { error: 'Mã bệnh nhân không hợp lệ.' },
      { status: 400 }
    );
  }

  try {
    const { ngayKham, MaBacSi, ChanDoan, ghiChu } = await req.json();

    // Validate bắt buộc
    if (!ngayKham || !MaBacSi) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ngày khám và bác sĩ.' },
        { status: 400 }
      );
    }

    const dbType = process.env.DB_TYPE || 'sqlserver';

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      const request = db.request();

      request
        .input('MaBenhNhan', sql.Int, maBenhNhan)
        .input('MaBacSi', sql.Int, MaBacSi)
        .input('NgayKham', sql.Date, new Date(ngayKham))
        .input('ChanDoan', sql.NVarChar(255), ChanDoan || null)
        .input('GhiChu', sql.NVarChar(255), ghiChu || null);

      const result = await request.execute('sp_DangKyLichKhamTheoBenhNhan');

      return NextResponse.json({
        success: true,
        message: 'Đăng ký lịch khám thành công.',
        MaLichKham: result.recordset[0]?.MaLichKham || null,
      });
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();
      const maLichKham = await getMaxValue('LichKham',"MaLichKham");
      const newLichKham = {
        MaLichKham: maLichKham === null?0:maLichKham + 1,
        MaBenhNhan: maBenhNhan,
        MaBacSi,
        NgayKham: new Date(ngayKham),
        ChanDoan: ChanDoan || null,
        GhiChu: ghiChu || null,
      };

      const insertResult = await db.collection('LichKham').insertOne(newLichKham);

      return NextResponse.json({
        success: true,
        message: 'Đăng ký lịch khám thành công.',
        MaLichKham: insertResult.insertedId,
      });
    }

    return NextResponse.json(
      { error: 'Loại cơ sở dữ liệu không được hỗ trợ.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Lỗi đăng ký lịch khám:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi đăng ký lịch khám.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
