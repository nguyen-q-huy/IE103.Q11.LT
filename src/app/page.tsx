'use client';

import { useEffect, useState } from 'react';
import ReportTable from '@components/lichkham';
import LichKhamForm from '@components/lichkhamForm';

type LichKham = {
  NgayKham: string;
  TenBenhNhan: string;
  NgaySinh: string;
  TenBacSi: string;
};

export default function HomePage() {
  const [ngay, setNgay] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [data, setData] = useState<LichKham[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/lichkham/search?ngay=${ngay}`);
    const json = await res.json();
    console.log(json);
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [ngay]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 border-b pb-2 mb-6">
        🗓️ Báo cáo lịch khám
      </h1>


      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {/* Chọn ngày */}
        <label className="flex items-center space-x-3">
          <span className="text-gray-700 font-semibold min-w-[90px]">Chọn ngày:</span>
          <input
            type="date"
            value={ngay}
            onChange={(e) => setNgay(e.target.value)}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-44"
          />
        </label>

        {/* Nút kế bên */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          {showForm ? 'Đóng' : 'Đăng ký khám'}
        </button>
      </div>

      {showForm && (
        <LichKhamForm
          ngayKham={ngay}
          onSuccess={() => {
            setShowForm(false);
            fetchData(); // reload lại bảng sau khi thêm
          }}
          onCancel={() => setShowForm(false)}
        />
      )}


      <ReportTable data={data} loading={loading} />
    </div>
  );
}
