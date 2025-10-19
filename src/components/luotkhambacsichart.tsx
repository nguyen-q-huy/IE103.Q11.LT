'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type BacSiStat = {
  TenBacSi: string;
  LuotKham: number;
};

function getYearsRange(fromYear: number, toYear: number) {
  const years = [];
  for (let y = fromYear; y <= toYear; y++) {
    years.push(y);
  }
  return years;
}

export default function LuotKhamBacSiChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<BacSiStat[]>([]);
  const [loading, setLoading] = useState(false);

  // State tìm kiếm cho bảng
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/thongke?nam=${year}`);
        if (!res.ok) throw new Error('Lỗi khi tải dữ liệu');
        const json = await res.json();
        setData(json);
      } catch (error) {
        alert('Lỗi khi tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [year]);

  // Lọc data theo searchTerm (bỏ qua chữ hoa/thường)
  const filteredData = data.filter(item =>
    item.TenBacSi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(255, 99, 255, 0.7)',
    'rgba(99, 255, 132, 0.7)'
  ];

  const backgroundColors = filteredData.map((_, index) => colors[index % colors.length]);

  const chartData = {
    labels: filteredData.map(item => item.TenBacSi),
    datasets: [
      {
        label: '',
        data: filteredData.map(item => item.LuotKham),
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Thống kê lượt khám theo bác sĩ năm ${year}`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto mt-10 p-4">
        <div className="mb-4 flex items-center gap-4 flex-wrap">
          <label htmlFor="year-select" className="font-semibold">
            Chọn năm:
          </label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded p-1"
          >
            {getYearsRange(2010, currentYear)
              .reverse()
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>
          {loading && <span className="ml-4 text-gray-500">Đang tải...</span>}
        </div>

        <Bar data={chartData} options={options} />

        {/* Input tìm kiếm cho bảng */}
        <div className="mt-6 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm p-2 border border-gray-300 rounded shadow-sm"
          />
        </div>

        {/* Bảng thống kê lượt khám */}
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
            <tr>
              <th className="py-3 px-4 text-center uppercase tracking-wider">Bác sĩ</th>
              <th className="py-3 px-4 text-center uppercase tracking-wider">Lượt khám</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center p-4">
                  Không có dữ liệu cho tìm kiếm "{searchTerm}" năm {year}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.TenBacSi}>
                  <td className="py-2 px-4 border-b border-gray-200">{item.TenBacSi}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-center">{item.LuotKham}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
