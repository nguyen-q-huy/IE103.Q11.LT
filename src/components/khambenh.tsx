import { useRouter } from 'next/navigation';
import { formatDate, tinhTuoi } from '@/utils/date';

export type LichKham = {
    MaLichKham: number;
    NgayKham: string;
    TenBenhNhan: string;
    NgaySinh: string;
    TenBacSi: string;
};

type Props = {
    data: LichKham[];
    loading: boolean;
};

export default function KhamBenhTable({ data, loading }: Props) {
    const router = useRouter();

    const renderTableBody = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={4} className="text-center py-6">
                        Đang tải dữ liệu...
                    </td>
                </tr>
            );
        }

        if (data.length === 0) {
            return (
                <tr>
                    <td colSpan={4} className="text-center py-6">
                        Không có lịch khám
                    </td>
                </tr>
            );
        }

        return data.map((item, index) => (
            <tr
                key={index}  // key tự tăng bằng index của phần tử trong mảng
                className="hover:bg-gray-100 cursor-pointer transition"
                onClick={() => router.push(`/khambenh/${item.MaLichKham}`)}
            >
                <td className="py-2 px-4 border-b border-gray-200">{formatDate(item.NgayKham)}</td>
                <td className="py-2 px-4 border-b border-gray-200">{item.TenBenhNhan}</td>
                <td className="py-2 px-4 border-b border-gray-200">{tinhTuoi(item.NgaySinh)}</td>
                <td className="py-2 px-4 border-b border-gray-200">{item.TenBacSi}</td>
            </tr>
        ));

    };

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
            <tbody>{renderTableBody()}</tbody>
        </table>
    );
}
