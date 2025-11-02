import BenchmarkChart from "@/components/benchmarkChart";

export default function ThongKePage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 border-b pb-2 mb-6">
        📊 So sánh tốc độ SQL Server vs MongoDB
      </h1>
      <BenchmarkChart />
    </div>
  );
}
