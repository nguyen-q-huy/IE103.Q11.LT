'use client';

import { useEffect, useState } from 'react';
import KhamBenhTable, { LichKham } from '@components/khambenh';

export default function KhamBenhPage() {
  const [ngay, setNgay] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [data, setData] = useState<LichKham[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/lichkham/search?ngay=${ngay}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [ngay]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 border-b pb-2 mb-6">
        🧾 Danh sách khám bệnh
      </h1>

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center space-x-3">
          <span className="text-gray-700 font-semibold min-w-[90px]">Chọn ngày:</span>
          <input
            type="date"
            value={ngay}
            onChange={(e) => setNgay(e.target.value)}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-44"
          />
        </label>
      </div>

      {/* 💡 Gọi bảng từ component */}
      <KhamBenhTable data={data} loading={loading} />
    </div>
  );
}
