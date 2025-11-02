'use client';

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function BenchmarkChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleBenchmark() {
    setLoading(true);
    try {
      const res = await fetch('/api/benchmark');
      const json = await res.json();
      setData(json.benchmarks);
    } catch (err) {
      alert('Lỗi khi chạy benchmark');
    } finally {
      setLoading(false);
    }
  }

  const labels = data.map((b) => b.records);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'SQL Insert',
        data: data.map((b) => b.sqlInsert),
        borderColor: 'rgba(54,162,235,0.8)',
        backgroundColor: 'rgba(54,162,235,0.3)',
      },
      {
        label: 'Mongo Insert',
        data: data.map((b) => b.mongoInsert),
        borderColor: 'rgba(255,99,132,0.8)',
        backgroundColor: 'rgba(255,99,132,0.3)',
      },
      {
        label: 'SQL Read',
        data: data.map((b) => b.sqlRead),
        borderColor: 'rgba(54,235,162,0.8)',
        backgroundColor: 'rgba(54,235,162,0.3)',
        borderDash: [5, 5],
      },
      {
        label: 'Mongo Read',
        data: data.map((b) => b.mongoRead),
        borderColor: 'rgba(255,206,86,0.8)',
        backgroundColor: 'rgba(255,206,86,0.3)',
        borderDash: [5, 5],
      },
      {
        label: 'SQL Modify',
        data: data.map((b) => b.sqlModify),
        borderColor: 'rgba(153,102,255,0.8)',
      },
      {
        label: 'Mongo Modify',
        data: data.map((b) => b.mongoModify),
        borderColor: 'rgba(255,159,64,0.8)',
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">

      <button
        onClick={handleBenchmark}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Đang chạy benchmark...' : 'Chạy benchmark'}
      </button>

      {data.length > 0 && (
        <div className="mt-8">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Thời gian thực thi (ms) theo số lượng bản ghi',
                },
                legend: { position: 'bottom' },
              },
              scales: { y: { beginAtZero: true } },
            }}
          />

          <div className="mt-6">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border-b text-left">Records</th>
                  <th className="py-2 px-3 border-b text-center">SQL Insert</th>
                  <th className="py-2 px-3 border-b text-center">SQL Read</th>
                  <th className="py-2 px-3 border-b text-center">SQL Modify</th>
                  <th className="py-2 px-3 border-b text-center">SQL Delete</th>
                  <th className="py-2 px-3 border-b text-center">Mongo Insert</th>
                  <th className="py-2 px-3 border-b text-center">Mongo Read</th>
                  <th className="py-2 px-3 border-b text-center">Mongo Modify</th>
                  <th className="py-2 px-3 border-b text-center">Mongo Delete</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.records}>
                    <td className="py-1 px-3 border-b font-semibold">{row.records}</td>
                    <td className="py-1 px-3 border-b text-center">{row.sqlInsert.toFixed(1)}</td>
                    <td className="py-1 px-3 border-b text-center">{row.sqlRead.toFixed(1)}</td>
                    <td className="py-1 px-3 border-b text-center">{row.sqlModify.toFixed(1)}</td>
                    <td className="py-1 px-3 border-b text-center">{row.sqlDelete.toFixed(1)}</td>
                    <td className="py-1 px-3 border-b text-center">{row.mongoInsert.toFixed(1)}</td>
                    <td className="py-1 px-3 border-b text-center">{row.mongoRead.toFixed(1)}</td>
                    <td className="py-1 px-3 border-b text-center">{row.mongoModify.toFixed(1)}</td>
                    <td className="py-1 px-3 border-b text-center">{row.mongoDelete.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
