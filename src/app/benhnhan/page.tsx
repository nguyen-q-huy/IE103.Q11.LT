'use client';

import { useEffect, useState } from 'react';
import BenhNhanTable from '@components/benhnhan';
import BenhNhanForm from '@components/benhnhanform';

export default function BenhNhanPage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/benhnhan?search=${search}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 border-b pb-2 mb-6">
        👨‍⚕️ Danh sách bệnh nhân
      </h1>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {/* Tìm kiếm theo tên */}
        <input
          type="text"
          placeholder="Tìm theo tên bệnh nhân..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 w-64"
          spellCheck="false"
        />

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          {showForm ? 'Đóng' : 'Thêm bệnh nhân'}
        </button>
      </div>

      {showForm && (
        <BenhNhanForm
          onSuccess={() => {
            setShowForm(false);
            fetchData(); // Reload danh sách bệnh nhân
          }}
          onCancel={() => setShowForm(false)}
        />
      )}


      <BenhNhanTable data={data} loading={loading} />
    </div>
  );
}
