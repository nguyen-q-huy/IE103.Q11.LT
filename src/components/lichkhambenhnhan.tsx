'use client';

import { useEffect, useState } from 'react';
import DangKyLichKham from '@components/benhnhandangkykhamform';

interface LichKhamItem {
  MaLichKham: number;
  NgayKham: string;
  TenBacSi: string;
  ChanDoan?: string;
  GhiChu?: string;
}

interface Props {
  maBenhNhan: number;
}

export default function DanhSachLichKham({ maBenhNhan }: Props) {
  const [lichKhamList, setLichKhamList] = useState<LichKhamItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [reloadLichKham, setReloadLichKham] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : '';
      const res = await fetch(`/api/benhnhan/${maBenhNhan}/lichkham${query}`);
      if (!res.ok) throw new Error('Không tải được lịch khám');
      const data = await res.json();
      setLichKhamList(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải lịch khám');
    } finally {
      setLoading(false);
    }
  };

  // Gọi khi searchTerm hoặc reloadLichKham thay đổi
  useEffect(() => {
    fetchData();
  }, [maBenhNhan, searchTerm, reloadLichKham]);

  const onDangKySuccess = () => {
    setReloadLichKham((prev) => !prev); // Re-fetch lịch khám
    setShowForm(false); // Ẩn form sau khi đăng ký
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">🩺 Lịch khám của bệnh nhân</h2>

      {/* Nút toggle đăng ký */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="🔍 Tìm theo bác sĩ, chẩn đoán"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded mr-4"
          spellCheck={false}
        />
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
        >
          {showForm ? '⬆ Ẩn đăng ký' : '➕ Đăng ký khám'}
        </button>
      </div>

      {/* Form đăng ký */}
      {showForm && (
        <div className="mb-6 border rounded p-4">
          <DangKyLichKham maBenhNhan={maBenhNhan} onSuccess={onDangKySuccess} />
        </div>
      )}

      {/* Danh sách lịch khám */}
      {loading && <div>⏳ Đang tải lịch khám…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && lichKhamList.length === 0 && (
        <div className="text-gray-600">Không có lịch khám phù hợp.</div>
      )}

      {!loading && !error && lichKhamList.length > 0 && (
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Ngày khám</th>
              <th className="px-4 py-2">Bác sĩ</th>
              <th className="px-4 py-2">Chẩn đoán</th>
              <th className="px-4 py-2">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {lichKhamList.map((lk) => (
              <tr
                key={lk.MaLichKham}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => (window.location.href = `/khambenh/${lk.MaLichKham}`)}
              >
                <td className="px-4 py-2 border-b">{new Date(lk.NgayKham).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b">{lk.TenBacSi}</td>
                <td className="px-4 py-2 border-b">{lk.ChanDoan ?? '-'}</td>
                <td className="px-4 py-2 border-b">{lk.GhiChu ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
