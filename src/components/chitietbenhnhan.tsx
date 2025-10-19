'use client';

import { useEffect, useState } from 'react';

type BenhNhan = {
  MaBenhNhan: number;
  TenBenhNhan: string;
  NgaySinh: string;
  GioiTinh: string;
  DiaChi: string;
  SDT: string;
};

interface Props {
  id: Number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BenhNhanForm({ id, onSuccess, onCancel }: Props) {
  const [benhNhan, setBenhNhan] = useState<BenhNhan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy dữ liệu bệnh nhân
  useEffect(() => {
    async function fetchBenhNhan() {
      setLoading(true);
      try {
        const res = await fetch(`/api/benhnhan/${id}`);
        if (!res.ok) throw new Error('Không tìm thấy bệnh nhân');
        const data = await res.json();
        setBenhNhan(data);
      } catch (error) {
        alert('Lỗi khi tải thông tin bệnh nhân');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchBenhNhan();
  }, [id]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!benhNhan) return <div>Không tìm thấy thông tin bệnh nhân.</div>;

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/benhnhan/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(benhNhan),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert('Cập nhật thành công!');
        onSuccess?.();
      } else {
        alert(result.message || 'Có lỗi xảy ra khi cập nhật.');
      }
    } catch (error) {
      alert('Lỗi khi gửi dữ liệu cập nhật.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Xử lý thay đổi input
  const handleChange = (field: keyof BenhNhan, value: string) => {
    setBenhNhan((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-gray-600 text-sm mb-1" htmlFor="hoTen">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          id="hoTen"
          type="text"
          value={benhNhan.TenBenhNhan || ''}
          onChange={(e) => handleChange('TenBenhNhan', e.target.value)}
          required
          className="w-full p-3 rounded border border-gray-300"
          placeholder="Nhập họ và tên"
        />

      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1" htmlFor="ngaySinh">
          Ngày sinh <span className="text-red-500">*</span>
        </label>
        <input
          id="ngaySinh"
          type="date"
          value={(benhNhan.NgaySinh || '').slice(0, 10)}
          onChange={(e) => handleChange('NgaySinh', e.target.value)}
          required
          className="w-full p-3 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1" htmlFor="gioiTinh">
          Giới tính <span className="text-red-500">*</span>
        </label>
        <select
          id="gioiTinh"
          value={benhNhan.GioiTinh || ''}
          onChange={(e) => handleChange('GioiTinh', e.target.value)}
          required
          className="w-full p-3 rounded border border-gray-300"
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-gray-600 text-sm mb-1" htmlFor="diaChi">
          Địa chỉ
        </label>

        <input
          id="diaChi"
          type="text"
          value={benhNhan.DiaChi || ''}
          onChange={(e) => handleChange('DiaChi', e.target.value)}
          className="w-full p-3 rounded border border-gray-300"
          placeholder="Nhập địa chỉ"
        />
      </div>
      {/* 
      <div className="md:col-span-2">
        <label className="block text-gray-600 text-sm mb-1" htmlFor="sdt">
          Số điện thoại
        </label>
        <input
          id="sdt"
          type="tel"
          value={benhNhan.SDT}
          onChange={(e) => handleChange('SDT', e.target.value)}
          className="w-full p-3 rounded border border-gray-300"
          placeholder="Nhập số điện thoại"
        />
      </div> */}

      <div className="md:col-span-2 flex justify-start mt-4 gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="bg-gray-400 text-white px-6 py-2 rounded shadow hover:bg-gray-500 disabled:opacity-50"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
