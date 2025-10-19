'use client';

import { useEffect, useState } from 'react';
import KhamBenhTable, { LichKham } from '@components/khambenh';

export default function KhamBenhPage() {
  const [ngay, setNgay] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<LichKham[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/lichkham/search?ngay=${ngay}&q=${encodeURIComponent(searchTerm)}`
    );
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [ngay, searchTerm]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 border-b pb-2 mb-6">
        🧾 Danh sách khám bệnh
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Chọn ngày */}
        <label className="flex items-center space-x-3">
          <span className="text-gray-700 font-semibold min-w-[90px]">Chọn ngày:</span>
          <input
            type="date"
            value={ngay}
            onChange={(e) => setNgay(e.target.value)}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 w-44"
            spellCheck={false}
          />
        </label>

        {/* Tìm kiếm */}
        <input
          type="text"
          placeholder="🔍 Tìm theo tên bệnh nhân, bác sĩ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[250px] p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500"
        />
      </div>

      <KhamBenhTable data={data} loading={loading} />
    </div>
  );
}
