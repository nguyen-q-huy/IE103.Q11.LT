import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getMongoConnection } from '@/lib/mongo';
import sql from 'mssql';
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const maLichKhamNum = parseInt(id, 10);

  if (!id || isNaN(maLichKhamNum)) {
    return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });
  }

  try {
    const dbType = process.env.DB_TYPE || 'sqlserver';

    let info: any;
    let chiDinh: any[] = [];
    let keThuoc: any[] = [];

    if (dbType === 'sqlserver') {
      const db = await getConnection();
      const requestDb = db.request().input('MaLichKham', sql.Int, maLichKhamNum);
      const result = await requestDb.execute('sp_BaoCaoLichKhamTheoMa_API');

      if (!result.recordsets || result.recordsets.length === 0) {
        return NextResponse.json({ error: 'Không tìm thấy lịch khám' }, { status: 404 });
      }

      info = result.recordsets[0][0];
      chiDinh = result.recordsets[1] ?? [];
      keThuoc = result.recordsets[2] ?? [];
    }

    if (dbType === 'mongodb') {
      const db = await getMongoConnection();

      info = await db.collection('LichKham').aggregate([
        { $match: { MaLichKham: maLichKhamNum } },
        {
          $lookup: {
            from: 'BenhNhan',
            localField: 'MaBenhNhan',
            foreignField: 'MaBenhNhan',
            as: 'benhNhan'
          }
        },
        {
          $lookup: {
            from: 'BacSi',
            localField: 'MaBacSi',
            foreignField: 'MaBacSi',
            as: 'bacSi'
          }
        },
        { $unwind: '$benhNhan' },
        { $unwind: '$bacSi' },
        {
          $project: {
            MaLichKham: 1,
            NgayKham: 1,
            ChanDoan: 1,
            GhiChu: 1,
            TenBenhNhan: '$benhNhan.TenBenhNhan',
            TenBacSi: '$bacSi.TenBacSi'
          }
        }
      ]).toArray();

      if (!info || info.length === 0) {
        return NextResponse.json({ error: 'Không tìm thấy lịch khám' }, { status: 404 });
      }
      info = info[0];

      chiDinh = await db.collection('ChiDinh').aggregate([
        { $match: { MaLichKham: maLichKhamNum } },
        {
          $lookup: {
            from: 'DichVu',
            localField: 'MaDichVu',
            foreignField: 'MaDichVu',
            as: 'dv'
          }
        },
        { $unwind: '$dv' },
        {
          $project: {
            MaDichVu: 1,
            TenDichVu: '$dv.TenDichVu',
            SoLan: 1,
            DonGia: '$dv.DonGia'
          }
        }
      ]).toArray();

      keThuoc = await db.collection('KeThuoc').aggregate([
        { $match: { MaLichKham: maLichKhamNum } },
        {
          $lookup: {
            from: 'Thuoc',
            localField: 'MaThuoc',
            foreignField: 'MaThuoc',
            as: 't'
          }
        },
        { $unwind: '$t' },
        {
          $project: {
            MaThuoc: 1,
            TenThuoc: '$t.TenThuoc',
            SoLuong: 1,
            DonGia: '$t.DonGia'
          }
        }
      ]).toArray();
    }

    const tongChiPhi =
      (chiDinh.reduce((sum, i) => sum + (i.SoLan || 0) * (i.DonGia || 0), 0) || 0) +
      (keThuoc.reduce((sum, i) => sum + (i.SoLuong || 0) * (i.DonGia || 0), 0) || 0);

    // Tạo PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontPath = path.resolve(process.cwd(), 'public/fonts/NotoSans-Regular.ttf');
    const fontBytes = await fs.readFile(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSizeNormal = 12;
    let y = height - 50;

    const drawText = (
      text: string,
      x: number,
      yPos: number,
      page: PDFPage,
      size: number,
      font: any,
      color: any = rgb(0, 0, 0)
    ) => {
      page.drawText(text, { x, y: yPos, size, font, color });
      return yPos - size - 5;
    };

    y = drawText(`Ngày khám: ${new Date(info.NgayKham).toLocaleDateString()}`, 50, y, page, fontSizeNormal, customFont);
    y = drawText(`Bác sĩ: ${info.TenBacSi}`, 50, y, page, fontSizeNormal, customFont);
    y = drawText(`Bệnh nhân: ${info.TenBenhNhan}`, 50, y, page, fontSizeNormal, customFont);
    y = drawText(`Chẩn đoán: ${info.ChanDoan ?? ''}`, 50, y, page, fontSizeNormal, customFont);
    y = drawText(`Ghi chú: ${info.GhiChu ?? ''}`, 50, y, page, fontSizeNormal, customFont);

    y -= 10;
    y = drawText(`Danh sách chỉ định dịch vụ:`, 50, y, page, fontSizeNormal, customFont);
    chiDinh.forEach(dv => {
      y = drawText(`- ${dv.TenDichVu}: ${dv.SoLan} lần`, 60, y, page, fontSizeNormal, customFont);
    });

    y -= 10;
    y = drawText(`Danh sách thuốc kê:`, 50, y, page, fontSizeNormal, customFont);
    keThuoc.forEach(t => {
      y = drawText(`- ${t.TenThuoc}: ${t.SoLuong} viên`, 60, y, page, fontSizeNormal, customFont);
    });

    y -= 10;
    drawText(`Tổng chi phí: ${tongChiPhi.toLocaleString()} VND`, 50, y, page, fontSizeNormal, customFont, rgb(0.8, 0, 0));

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BaoCao_LichKham_${id}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Lỗi server khi tạo file PDF' }, { status: 500 });
  }
}
