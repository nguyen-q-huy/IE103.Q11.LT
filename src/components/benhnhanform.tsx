'use client';

import { useState } from 'react';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BenhNhanForm({ onSuccess, onCancel }: Props) {
  const [hoTen, setHoTen] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [gioiTinh, setGioiTinh] = useState('Nam');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/benhnhan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hoTen,
          ngaySinh,
          gioiTinh,
          soDienThoai,
          diaChi,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message || 'Thêm bệnh nhân thất bại');
        return;
      }

      alert('Thêm bệnh nhân thành công');
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white border border-gray-200 rounded p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">Thêm bệnh nhân</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Họ tên</label>
          <input
            type="text"
            value={hoTen}
            onChange={(e) => setHoTen(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Ngày sinh</label>
          <input
            type="date"
            value={ngaySinh}
            onChange={(e) => setNgaySinh(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Giới tính</label>
          <select
            value={gioiTinh}
            onChange={(e) => setGioiTinh(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Địa chỉ</label>
          <textarea
            value={diaChi}
            onChange={(e) => setDiaChi(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border hover:bg-gray-100"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
