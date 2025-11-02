import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getMongoConnection, getMaxValue } from '@/lib/mongo';

/**
 * Benchmark với nhiều kích thước dữ liệu khác nhau
 * Trả về mảng kết quả [{records, sqlInsert, mongoInsert, ...}]
 */
export async function GET() {
  const sizes = [500, 1000, 3000, 5000]; // các quy mô test
  const sample = {
    TenBenhNhan: 'Nguyen Van Test',
    NgaySinh: '1990-01-01',
    GioiTinh: 'Nam',
    DiaChi: 'Hà Nội',
  };

  const allResults: any[] = [];

  try {
    const sqlPool = await getConnection();
    const db = await getMongoConnection();
    const coll = db.collection('BenhNhan');

    // chạy lần lượt từng cỡ dữ liệu
    for (const N of sizes) {
      const result = {
        records: N,
        sqlInsert: 0,
        sqlRead: 0,
        sqlModify: 0,
        sqlDelete: 0,
        mongoInsert: 0,
        mongoRead: 0,
        mongoModify: 0,
        mongoDelete: 0,
      };

      console.log(`🔹 Benchmark ${N} records...`);

      /** ========================
       * 🧩 SQL SERVER
       * ======================== */
      // 1️⃣ Ghi dữ liệu
      const sqlInsertStart = performance.now();
      for (let i = 0; i < N; i++) {
        await sqlPool
          .request()
          .input('TenBenhNhan', sample.TenBenhNhan)
          .input('NgaySinh', sample.NgaySinh)
          .input('GioiTinh', sample.GioiTinh)
          .input('DiaChi', sample.DiaChi)
          .query(`
            INSERT INTO BenhNhan (TenBenhNhan, NgaySinh, GioiTinh, DiaChi)
            VALUES (@TenBenhNhan, @NgaySinh, @GioiTinh, @DiaChi)
          `);
      }
      result.sqlInsert = performance.now() - sqlInsertStart;

      // 2️⃣ Đọc dữ liệu
      const sqlReadStart = performance.now();
      const res = await sqlPool.request().query(`
        SELECT TOP ${N} MaBenhNhan FROM BenhNhan ORDER BY MaBenhNhan DESC
      `);
      result.sqlRead = performance.now() - sqlReadStart;

      const ids = res.recordset.map((r: any) => r.MaBenhNhan);

      // 3️⃣ Cập nhật dữ liệu
      if (ids.length > 0) {
        const sqlModifyStart = performance.now();
        await sqlPool
          .request()
          .query(
            `UPDATE BenhNhan SET DiaChi = N'Hồ Chí Minh' WHERE MaBenhNhan IN (${ids.join(',')})`
          );
        result.sqlModify = performance.now() - sqlModifyStart;
      }

      // 4️⃣ Xóa dữ liệu
      if (ids.length > 0) {
        const sqlDeleteStart = performance.now();
        await sqlPool
          .request()
          .query(`DELETE FROM BenhNhan WHERE MaBenhNhan IN (${ids.join(',')})`);
        result.sqlDelete = performance.now() - sqlDeleteStart;
      }

      /** ========================
       * 🧩 MONGODB
       * ======================== */
      const insertedIds: number[] = [];

      // 1️⃣ Ghi dữ liệu
      const mongoInsertStart = performance.now();
      for (let i = 0; i < N; i++) {
        const maBenhNhan = (await getMaxValue('BenhNhan', 'MaBenhNhan')) ?? 0;
        const newDoc = {
          MaBenhNhan: maBenhNhan + 1,
          ...sample,
        };
        await coll.insertOne(newDoc);
        insertedIds.push(newDoc.MaBenhNhan);
      }
      result.mongoInsert = performance.now() - mongoInsertStart;

      // 2️⃣ Đọc dữ liệu
      const mongoReadStart = performance.now();
      await coll.find({ MaBenhNhan: { $in: insertedIds } }).limit(N).toArray();
      result.mongoRead = performance.now() - mongoReadStart;

      // 3️⃣ Cập nhật dữ liệu
      const mongoModifyStart = performance.now();
      await coll.updateMany(
        { MaBenhNhan: { $in: insertedIds } },
        { $set: { DiaChi: 'Hồ Chí Minh' } }
      );
      result.mongoModify = performance.now() - mongoModifyStart;

      // 4️⃣ Xóa dữ liệu
      const mongoDeleteStart = performance.now();
      await coll.deleteMany({ MaBenhNhan: { $in: insertedIds } });
      result.mongoDelete = performance.now() - mongoDeleteStart;

      allResults.push(result);
    }

    return NextResponse.json({ benchmarks: allResults });
  } catch (err) {
    console.error('Benchmark error:', err);
    return NextResponse.json(
      { error: 'Benchmark failed', details: String(err) },
      { status: 500 }
    );
  }
}
