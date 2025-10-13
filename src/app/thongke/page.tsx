import LuotKhamBacSiChart from '@components/luotkhambacsichart';

export default function ThongKePage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 border-b pb-2 mb-6">
        📊 Thống kê lượt khám
      </h1>
      <LuotKhamBacSiChart />
    </div>
  );
}
