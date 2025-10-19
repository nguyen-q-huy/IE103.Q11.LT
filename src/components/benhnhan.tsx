'use client';

import { useRouter } from 'next/navigation';

type BenhNhan = {
  MaBenhNhan: number;
  TenBenhNhan: string;
  NgaySinh: string;
  GioiTinh: string;
  DiaChi: string;
};

export default function BenhNhanTable({ data, loading }: { data: BenhNhan[], loading: boolean }) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="text-center py-6">Đang tải dữ liệu...</div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-6">Không có bệnh nhân nào.</div>
    );
  }

  return (
    <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
      <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <tr>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Mã</th>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Tên</th>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Ngày sinh</th>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Giới tính</th>
          <th className="py-3 px-4 text-left uppercase tracking-wider">Địa chỉ</th>
        </tr>
      </thead>
      <tbody>
        {data.map((bn) => (
          <tr
            key={bn.MaBenhNhan}
            className="hover:bg-gray-100 cursor-pointer transition"
            onClick={() => router.push(`/benhnhan/${bn.MaBenhNhan}`)}
          >
            <td className="py-2 px-4 border-b border-gray-200">{bn.MaBenhNhan}</td>
            <td className="py-2 px-4 border-b border-gray-200">{bn.TenBenhNhan}</td>
            <td className="py-2 px-4 border-b border-gray-200">{new Date(bn.NgaySinh).toLocaleDateString()}</td>
            <td className="py-2 px-4 border-b border-gray-200">{bn.GioiTinh}</td>
            <td className="py-2 px-4 border-b border-gray-200">{bn.DiaChi}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
