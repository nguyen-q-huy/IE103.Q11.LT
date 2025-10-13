'use client';

import { useEffect, useState } from 'react';
import { getToday } from '@utils/date';

type BacSi = {
    MaBacSi: number;
    TenBacSi: string;
};

interface LichKhamFormProps {
    ngayKham: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function LichKhamForm({
    ngayKham,
    onSuccess,
    onCancel,
}: LichKhamFormProps) {
    const [dsBacSi, setDsBacSi] = useState<BacSi[]>([]);
    const [form, setForm] = useState({
        ngayKham: getToday(),    // thêm ngày khám mặc định hôm nay
        maBacSi: '',
        tenBenhNhan: '',
        ngaySinh: '',
        gioiTinh: '',
        ghiChu: '',
    });

    useEffect(() => {
        const fetchBacSi = async () => {
            const res = await fetch(`/api/bacsi`);
            const json = await res.json();
            setDsBacSi(json);
        };

        fetchBacSi();
    }, [ngayKham]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const body = {
            ngayKham,
            maBacSi: Number(form.maBacSi),
            tenBenhNhan: form.tenBenhNhan,
            ngaySinh: form.ngaySinh,
            gioiTinh: form.gioiTinh,
            ghiChu: form.ghiChu,
        };

        const res = await fetch(`/api/lichkham/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const result = await res.json();

        if (res.ok && result.success) {
            alert('Đăng ký thành công!');
            onSuccess();
        } else {
            alert(result.message || result.error || 'Có lỗi xảy ra khi đăng ký.');
        }

    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-6"
        >
            <div className="grid grid-cols-2 gap-6">
                {/* Cột 1 */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold text-gray-700">Ngày khám</label>
                    <input
                        required
                        type="date"
                        value={form.ngayKham}
                        onChange={(e) => setForm({ ...form, ngayKham: e.target.value })}
                        className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 font-semibold text-gray-700">Bác sĩ</label>
                    <select
                        required
                        value={form.maBacSi}
                        onChange={(e) => setForm({ ...form, maBacSi: e.target.value })}
                        className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    >
                        <option value="">-- Chọn bác sĩ --</option>
                        {dsBacSi.map((bs) => (
                            <option key={bs.MaBacSi} value={bs.MaBacSi}>
                                {bs.TenBacSi}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cột 2 */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold text-gray-700">Tên bệnh nhân</label>
                    <input
                        required
                        type="text"
                        value={form.tenBenhNhan}
                        onChange={(e) => setForm({ ...form, tenBenhNhan: e.target.value })}
                        className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                        placeholder="Nhập tên bệnh nhân"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 font-semibold text-gray-700">Ngày sinh</label>
                    <input
                        required
                        type="date"
                        value={form.ngaySinh}
                        onChange={(e) => setForm({ ...form, ngaySinh: e.target.value })}
                        className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                </div>

                {/* Thêm các trường khác bạn muốn xếp 2 cột */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold text-gray-700">Giới tính</label>
                    <select
                        required
                        value={form.gioiTinh}
                        onChange={(e) => setForm({ ...form, gioiTinh: e.target.value })}
                        className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>

                <div className="flex flex-col col-span-2">
                    <label className="mb-2 font-semibold text-gray-700">Ghi chú</label>
                    <textarea
                        value={form.ghiChu}
                        onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                        className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition resize-none"
                        rows={3}
                    />
                </div>
            </div>

            <div className="flex gap-4 justify-end">
                <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded shadow-md transition"
                >
                    Xác nhận
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded shadow-md transition"
                >
                    Hủy
                </button>
            </div>
        </form>



    );
}
