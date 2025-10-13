import { formatDate, tinhTuoi } from '@/utils/date';

type LichKham = {
  NgayKham: string;
  TenBenhNhan: string;
  NgaySinh: string;
  TenBacSi: string;
};

interface ReportTableProps {
  data: LichKham[];
  loading: boolean;
}

export default function ReportTable({ data, loading }: ReportTableProps) {
  if (loading) {
    return <p className="text-blue-600 font-semibold">Đang tải dữ liệu...</p>;
  }

  if (data.length === 0) {
    return <p className="text-gray-500 italic">Không có người khám</p>;
  }

  return (
    <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
      <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <tr>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Ngày khám</th>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Tên bệnh nhân</th>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Tuổi</th>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Tên bác sĩ</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          >
            <td className="py-2 px-4 border-b border-gray-200">{formatDate(item.NgayKham)}</td>
            <td className="py-2 px-4 border-b border-gray-200">{item.TenBenhNhan}</td>
            <td className="py-2 px-4 border-b border-gray-200">{tinhTuoi(item.NgaySinh)}</td>
            <td className="py-2 px-4 border-b border-gray-200">{item.TenBacSi}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
