'use client';

import { useState, useEffect } from 'react';

interface Props {
    maBenhNhan: number;
    onSuccess?: () => void;
}

interface BacSi {
    MaBacSi: number;
    TenBacSi: string;
}

export default function DangKyLichKham({ maBenhNhan, onSuccess }: Props) {
    const today = new Date().toISOString().split('T')[0];
    const [ngayKham, setNgayKham] = useState(today);
    const [MaBacSi, setMaBacSi] = useState('');
    const [ghiChu, setGhiChu] = useState('');
    const [loading, setLoading] = useState(false);
    const [danhSachBacSi, setDanhSachBacSi] = useState<BacSi[]>([]);

    // Gọi API lấy danh sách bác sĩ khi component mount
    useEffect(() => {
        const fetchBacSi = async () => {
            try {
                const res = await fetch('/api/bacsi');
                const data = await res.json();
                setDanhSachBacSi(data);
            } catch (error) {
                console.error('Lỗi khi tải danh sách bác sĩ:', error);
            }
        };

        fetchBacSi();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ngayKham || !MaBacSi) {
            alert('Vui lòng chọn ngày khám và bác sĩ');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/benhnhan/${maBenhNhan}/lichkham`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ngayKham,
                    MaBacSi: parseInt(MaBacSi, 10),
                    ghiChu,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.message || 'Đăng ký lịch khám thất bại');
                return;
            }

            alert('Đăng ký lịch khám thành công');
            setNgayKham('');
            setMaBacSi('');
            setGhiChu('');
            onSuccess?.();
        } catch (error) {
            alert('Lỗi khi gửi đăng ký lịch khám');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-8 p-4 bg-white w-full"
        >
            <h2 className="text-xl font-semibold mb-4">📝 Đăng ký lịch khám mới</h2>

            <div className="mb-4">
                <label htmlFor="ngayKham" className="block mb-1 font-medium">Ngày khám</label>
                <input
                    type="date"
                    id="ngayKham"
                    value={ngayKham}
                    onChange={(e) => setNgayKham(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="MaBacSi" className="block mb-1 font-medium">Chọn bác sĩ</label>
                <select
                    id="MaBacSi"
                    value={MaBacSi}
                    onChange={(e) => setMaBacSi(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                >
                    <option value="">-- Chọn bác sĩ --</option>
                    {danhSachBacSi.map((bs) => (
                        <option key={bs.MaBacSi} value={bs.MaBacSi}>
                            {bs.TenBacSi}
                        </option>
                    ))}
                </select>

            </div>

            <div className="mb-4">
                <label htmlFor="ghiChu" className="block mb-1 font-medium">Ghi chú</label>
                <textarea
                    id="ghiChu"
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    placeholder="Ghi chú (không bắt buộc)"
                    className="w-full p-2 border rounded"
                    rows={3}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
                {loading ? 'Đang gửi...' : 'Đăng ký'}
            </button>
        </form>
    );
}
