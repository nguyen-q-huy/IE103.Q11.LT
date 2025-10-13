'use client';

import { useEffect, useState } from 'react';

type Thuoc = {
  MaThuoc: number;
  TenThuoc: string;
};

type DichVu = {
  MaDichVu: number;
  TenDichVu: string;
};

type ThuocDaChon = {
  maThuoc: number;
  soLuong: number;
};

type DichVuDaChon = {
  maDichVu: number;
  soLan: number;
};

interface Props {
  maLichKham: number;
  onSuccess?: () => void;
}

export default function ChiTietKhamForm({ maLichKham, onSuccess }: Props) {
  const [chanDoan, setChanDoan] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [dsThuoc, setDsThuoc] = useState<Thuoc[]>([]);
  const [dsDichVu, setDsDichVu] = useState<DichVu[]>([]);

  const [thuocDaChon, setThuocDaChon] = useState<ThuocDaChon[]>([]);
  const [dichVuDaChon, setDichVuDaChon] = useState<DichVuDaChon[]>([]);

  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu chi tiết khám bệnh
  useEffect(() => {
    const fetchChiTietKham = async () => {
      try {
        const res = await fetch(`/api/khambenh/${maLichKham}`);
        if (!res.ok) throw new Error('Lấy chi tiết khám thất bại');
        const data = await res.json();

        setChanDoan(data.chanDoan || '');
        setGhiChu(data.ghiChu || '');

        setThuocDaChon(
          Array.isArray(data.thuoc)
            ? data.thuoc.map((t: any) => ({
              maThuoc: t.MaThuoc,
              soLuong: t.SoLuong,
            }))
            : []
        );

        setDichVuDaChon(
          Array.isArray(data.dichVu)
            ? data.dichVu.map((d: any) => ({
              maDichVu: d.MaDichVu,
              soLan: d.SoLan,
            }))
            : []
        );
      } catch (error) {
        alert('Không tải được dữ liệu khám bệnh.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChiTietKham();
  }, [maLichKham]);

  // Fetch thuốc và dịch vụ
  useEffect(() => {
    const fetchThuocVaDichVu = async () => {
      try {
        const [thuocRes, dichVuRes] = await Promise.all([
          fetch('/api/thuoc'),
          fetch('/api/dichvu'),
        ]);

        if (!thuocRes.ok || !dichVuRes.ok) {
          throw new Error('Lỗi tải thuốc hoặc dịch vụ');
        }

        const thuocData = await thuocRes.json();
        const dichVuData = await dichVuRes.json();

        setDsThuoc(thuocData);
        setDsDichVu(dichVuData);
      } catch (error) {
        alert('Không tải được danh sách thuốc/dịch vụ.');
        console.error(error);
      }
    };

    fetchThuocVaDichVu();
  }, []);

  const handleAddThuoc = () => {
    setThuocDaChon([...thuocDaChon, { maThuoc: 0, soLuong: 1 }]);
  };

  const handleRemoveThuoc = (index: number) => {
    setThuocDaChon((prev) => prev.filter((_, i) => i !== index));
  };

  const handleThuocChange = (
    index: number,
    field: 'maThuoc' | 'soLuong',
    value: string | number
  ) => {
    const updated = [...thuocDaChon];
    updated[index] = {
      ...updated[index],
      [field]: parseInt(value as string) || 0,
    };
    setThuocDaChon(updated);
  };

  const handleAddDichVu = () => {
    setDichVuDaChon([...dichVuDaChon, { maDichVu: 0, soLan: 1 }]);
  };

  const handleRemoveDichVu = (index: number) => {
    setDichVuDaChon((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDichVuChange = (
    index: number,
    field: 'maDichVu' | 'soLan',
    value: string | number
  ) => {
    const updated = [...dichVuDaChon];
    updated[index] = {
      ...updated[index],
      [field]: parseInt(value as string) || 0,
    };
    setDichVuDaChon(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/khambenh/${maLichKham}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chanDoan,
          ghiChu,
          thuoc: thuocDaChon,
          dichVu: dichVuDaChon,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert('Cập nhật thành công!');
        onSuccess?.();
      } else {
        alert(result.message || result.error || 'Có lỗi xảy ra khi cập nhật.');
      }
    } catch (error) {
      alert('Lỗi khi gửi dữ liệu cập nhật.');
      console.error(error);
    }
  };

  const handlePrintPDF = async () => {
    try {
      // 1. Gửi dữ liệu POST để lưu thông tin
      const saveResponse = await fetch(`/api/khambenh/${maLichKham}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chanDoan,
          ghiChu,
          thuoc: thuocDaChon,
          dichVu: dichVuDaChon,
        }),
      });

      const saveResult = await saveResponse.json();
      if (!saveResponse.ok || !saveResult.success) {
        alert(saveResult.message || 'Lỗi khi lưu thông tin');
        return;
      }

      // 2. Fetch file PDF dạng Blob từ API GET
      const pdfResponse = await fetch(`/api/khambenh/hoadon/${maLichKham}`);

      if (!pdfResponse.ok) {
        alert('Không thể tải file PDF');
        return;
      }

      const pdfBlob = await pdfResponse.blob();

      // 3. Tạo URL Blob từ file PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // 4. Mở tab mới với URL Blob
      window.open(pdfUrl, '_blank');

      // 5. Giải phóng URL sau 1 phút để tránh rò rỉ bộ nhớ
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60 * 1000);

    } catch (error) {
      alert('Lỗi khi tạo hóa đơn');
      console.error(error);
    }
  };



  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Chẩn đoán */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-gray-700 font-medium">Chẩn đoán</label>
          <textarea
            rows={3}
            value={chanDoan}
            onChange={(e) => setChanDoan(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded resize-none"
            placeholder="Nhập chẩn đoán..."
          />
        </div>

        {/* Ghi chú */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-gray-700 font-medium">Ghi chú</label>
          <textarea
            rows={3}
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded resize-none"
            placeholder="Nhập ghi chú..."
          />
        </div>
      </div>

      {/* Dịch vụ */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🧪 Chỉ định dịch vụ</h3>
        {dichVuDaChon.map((item, index) => (
          <div key={index} className="flex items-center gap-4 mb-3">
            <select
              value={item.maDichVu}
              onChange={(e) => handleDichVuChange(index, 'maDichVu', e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded"
              required
            >
              <option value={0}>-- Chọn dịch vụ --</option>
              {dsDichVu.map((d) => (
                <option key={d.MaDichVu} value={d.MaDichVu}>
                  {d.TenDichVu}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={item.soLan}
              onChange={(e) => handleDichVuChange(index, 'soLan', e.target.value)}
              className="w-1/4 p-2 border border-gray-300 rounded"
              required
            />
            <button
              type="button"
              onClick={() => handleRemoveDichVu(index)}
              className="text-red-500 border border-red-500 rounded px-2 py-1 hover:bg-red-100"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddDichVu}
          className="text-sm text-indigo-600 hover:underline"
        >
          + Thêm dịch vụ
        </button>
      </div>

      {/* Thuốc */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">💊 Kê thuốc</h3>
        {thuocDaChon.map((item, index) => (
          <div key={index} className="flex items-center gap-4 mb-3">
            <select
              value={item.maThuoc}
              onChange={(e) => handleThuocChange(index, 'maThuoc', e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded"
              required
            >
              <option value={0}>-- Chọn thuốc --</option>
              {dsThuoc.map((t) => (
                <option key={t.MaThuoc} value={t.MaThuoc}>
                  {t.TenThuoc}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={item.soLuong}
              onChange={(e) => handleThuocChange(index, 'soLuong', e.target.value)}
              className="w-1/4 p-2 border border-gray-300 rounded"
              required
            />
            <button
              type="button"
              onClick={() => handleRemoveThuoc(index)}
              className="text-red-500 border border-red-500 rounded px-2 py-1 hover:bg-red-100"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddThuoc}
          className="text-sm text-indigo-600 hover:underline"
        >
          + Thêm thuốc
        </button>
      </div>

      {/* Submit */}
      <div className="flex justify-left gap-4 pt-6 border-t mt-8">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700"
        >
          Lưu thông tin
        </button>
        <button
          type="button"
          onClick={handlePrintPDF}
          className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
        >
          Lưu & In PDF
        </button>
      </div>
    </form>
  );
}
