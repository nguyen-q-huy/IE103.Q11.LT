'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Danh Sách Bệnh Nhân', href: '/benhnhan' },
    { name: 'Lịch khám', href: '/' },
    { name: 'Thống kê', href: '/thongke' },
  ];

    // Hàm gọi API và tải file JSON về
  async function handleExport() {
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Lỗi khi tải dữ liệu');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Tạo thẻ <a> để tải file
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Xuất dữ liệu thất bại: ' + error.message);
    }
  }

  return (
    <aside className="w-80 bg-white fixed top-0 left-0 h-screen border-r p-4 shadow-sm z-10">
      <h2 className="text-2xl font-bold mb-6 tracking-tight">
        📋 QUẢN LÝ BỆNH VIỆN
      </h2>

      <ul className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
              flex items-center px-4 py-2 rounded-lg transition
              ${isActive
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'}
            `}
              >
                {/* Icon nếu có (giả sử có icon: item.icon) */}
                <span className="mr-2">📄</span>
                {item.name}
              </Link>
            </li>
          );
        })}

        {/* Nút Xuất JSON */}
        <li>
          <button
            onClick={handleExport}
            className="w-full text-left flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <span className="mr-2">⬇️</span>
            Xuất dữ liệu JSON
          </button>
        </li>
      </ul>
    </aside>

  );
}
