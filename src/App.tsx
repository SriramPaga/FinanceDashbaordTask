import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// This should match the column headers in your Excel file.
interface FinancialRecord {
  Company: string;
  Metric: "SALES" | "EBITDA" | "PAT";
  Year: number;
  Value: number; // in millions USD
}

const companies = [
  "HCL Technologies Ltd.",
  "Infosys Ltd.",
  "Tata Consultancy Services Ltd.",
  "Wipro Ltd.",
  "Tech Mahindra Ltd.",
];
const metrics: ("SALES" | "EBITDA" | "PAT")[] = ["SALES", "EBITDA", "PAT"];

// --- APP COMPONENT ---
const App: React.FC = () => {
  // State for user selections
  const [selectedCompany, setSelectedCompany] = useState<string>(companies[0]);

  const [selectedMetric, setSelectedMetric] = useState<
    "SALES" | "EBITDA" | "PAT"
  >(metrics[0]);

  type ChartData = {
    year: number;
    value: number;
  }[];
  // State for data and UI
  const [allFinancialData, setAllFinancialData] = useState<FinancialRecord[]>(
    []
  );
  // const [chartData, setChartData] = useState<any[]>([]);

  const [chartData, setChartData] = useState<ChartData>([]);
  const [chartTitle, setChartTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("use effect called");
      try {
        // Fetch from the local backend server API endpoint
       const response = await fetch('/api/data');

        if (!response.ok) {
          throw new Error(
            "Network response was not ok. Is the backend server running?"
          );
        }
        const data: FinancialRecord[] = await response.json();
        console.log("Data fetched successfully:", data);
        setAllFinancialData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Failed to fetch data: ${err.message}`);
        } else {
          setError("An unknown error occurred.");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); 
  // Effect to filter and update chart data when selections or data change
  useEffect(() => {
    if (selectedCompany && selectedMetric && allFinancialData.length > 0) {
      console.log(allFinancialData);
      const filteredData = allFinancialData.filter(
        (record) =>
          record.Company === selectedCompany && record.Metric === selectedMetric
      );
      console.log("Filtered Data:", filteredData);
      // Map data to the format Recharts expects (data and year)
      const formattedChartData = filteredData.map((record) => ({
        year: record.Year,
        value: record.Value,
      }));
      setChartData(formattedChartData);
      setChartTitle(`${selectedMetric} for ${selectedCompany}`);
    }
  }, [selectedCompany, selectedMetric, allFinancialData]);

  // Formatter for Y-axis ticks
  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
      return `$${(tickItem / 1000).toFixed(1)}B`;
    }
    return `$${tickItem}M`;
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Financial Metrics Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Select a company and metric to visualize performance over time.
          </p>
        </header>
        <h1 className="text-3xl font-bold text-blue-600">Hello Tailwind!</h1>
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Controls / Sidebar */}
          <aside className="w-full lg:w-1/4 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-cyan-300 border-b border-slate-600 pb-2">
                Company
              </h2>
              <div className="flex flex-wrap gap-2">
                {companies.map((company) => (
                  <button
                    key={company}
                    onClick={() => setSelectedCompany(company)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${
                      selectedCompany === company
                        ? "bg-cyan-500 text-white shadow-md"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-cyan-300 border-b border-slate-600 pb-2">
                Metric
              </h2>
              <div className="flex flex-wrap gap-2">
                {metrics.map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 ${
                      selectedMetric === metric
                        ? "bg-cyan-500 text-white shadow-md"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Chart Display */}
          <main
            className="w-full lg:w-3/4 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center justify-center"
            style={{ minHeight: "450px" }}
          >
            {isLoading ? (
              <p className="text-slate-400 text-lg animate-pulse">
                Loading data from server...
              </p>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-400 text-lg font-semibold">Error</p>
                <p className="text-red-300 mt-2">{error}</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="w-full h-full">
                <h2 className="text-2xl font-bold text-center mb-4">
                  {chartTitle}
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis
                      dataKey="year"
                      stroke="#94a3b8"
                      tick={{ fill: "#e2e8f0" }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tickFormatter={formatYAxis}
                      tick={{ fill: "#e2e8f0" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        color: "#e2e8f0",
                      }}
                      labelStyle={{ color: "#cbd5e1" }}
                      formatter={(value: number) => [
                        `$${value.toLocaleString()}M`,
                        selectedMetric,
                      ]}
                    />
                    <Legend wrapperStyle={{ color: "#e2e8f0" }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={selectedMetric}
                      stroke="#22d3ee"
                      strokeWidth={2}
                      activeDot={{ r: 8, fill: "#22d3ee", stroke: "#0e7490" }}
                      dot={{ r: 4, fill: "#22d3ee" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-400">
                No data available for the selected criteria.
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
