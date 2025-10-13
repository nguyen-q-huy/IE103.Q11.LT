import { formatDate, tinhTuoi } from '@/utils/date';

type ChiTietKhamProps = {
  maLichKham: number;
};

export default async function ChiTietKham({ maLichKham }: ChiTietKhamProps) {
  const res = await fetch(`http://localhost:3000/api/lichkham/${maLichKham}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Không tìm thấy lịch khám');
  }

  const lichKham = await res.json();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-gray-600 text-sm mb-1">Ngày khám</label>
        <input
          value={formatDate(lichKham.NgayKham)}
          readOnly
          className="w-full bg-gray-100 p-3 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1">Tên bệnh nhân</label>
        <input
          value={lichKham.TenBenhNhan}
          readOnly
          className="w-full bg-gray-100 p-3 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1">Tuổi</label>
        <input
          value={tinhTuoi(lichKham.NgaySinh)}
          readOnly
          className="w-full bg-gray-100 p-3 rounded border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-gray-600 text-sm mb-1">Giới tính</label>
        <input
          value={lichKham.GioiTinh}
          readOnly
          className="w-full bg-gray-100 p-3 rounded border border-gray-300"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-gray-600 text-sm mb-1">Bác sĩ</label>
        <input
          value={lichKham.TenBacSi}
          readOnly
          className="w-full bg-gray-100 p-3 rounded border border-gray-300"
        />
      </div>
    </div>
  );
}
