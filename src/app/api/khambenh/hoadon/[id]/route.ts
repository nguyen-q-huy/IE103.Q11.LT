import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@lib/db';
import sql from 'mssql';
import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs/promises';
import path from 'path';

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
    const db = await getConnection();
    const requestDb = db.request().input('MaLichKham', sql.Int, maLichKhamNum);
    const result = await requestDb.execute('sp_BaoCaoLichKhamTheoMa_API');

    const lichKham = result.recordsets ?? [];
    const tongchiDinh = result.recordsets ?? [];
    const tongkeThuoc = result.recordsets ?? [];

    if (lichKham.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy lịch khám' }, { status: 404 });
    }

    const info = lichKham[0][0];
    const chiDinh = tongchiDinh[1] || [];
    const keThuoc = tongkeThuoc[2] || [];

    const tongChiPhi =
      (chiDinh.reduce((sum: number, i: any) => sum + i.SoLan * i.DonGia, 0) || 0) +
      (keThuoc.reduce((sum: number, i: any) => sum + i.SoLuong * i.DonGia, 0) || 0);

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
    y = drawText(`Bác sĩ: ${info.TenBacSi} - ${info.TenChuyenKhoa ?? ''}`, 50, y, page, fontSizeNormal, customFont);
    y = drawText(`Bệnh nhân: ${info.TenBenhNhan}`, 50, y, page, fontSizeNormal, customFont);
    y = drawText(`Chẩn đoán: ${info.ChanDoan ?? ''}`, 50, y, page, fontSizeNormal, customFont);
    y = drawText(`Ghi chú: ${info.GhiChu ?? ''}`, 50, y, page, fontSizeNormal, customFont);

    y -= 10;
    y = drawText(`Danh sách chỉ định dịch vụ:`, 50, y, page, fontSizeNormal, customFont);
    chiDinh.forEach((dv: any) => {
      y = drawText(`- ${dv.TenDichVu}: ${dv.SoLan} lần`, 60, y, page, fontSizeNormal, customFont);
    });

    y -= 10;
    y = drawText(`Danh sách thuốc kê:`, 50, y, page, fontSizeNormal, customFont);
    keThuoc.forEach((t: any) => {
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
