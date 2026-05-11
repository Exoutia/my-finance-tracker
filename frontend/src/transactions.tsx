import { useEffect, useState } from "react";
import { columns, type Payment } from "@/src/columns.tsx";
import { DataTable } from "@/src/data-table.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
const BASE_URL = "/api";

async function apiRequest(endpoint, options = {}) {
  // Get the password from session storage or state (for Phase 2)
  const dbPassword = sessionStorage.getItem("db_password");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // If we have a password, we attach the header
  if (dbPassword) {
    headers["X-DB-Password"] = dbPassword;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "API request failed");
  }

  return response.json();
}

async function getFinanceData() {
  try {
    const data = await apiRequest("/");
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
    return null;
  }
}

function getData(): Payment[] {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ];
}

export default function DemoPage() {
  const [data1, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getFinanceData();
      if (result) {
        setData(result);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const data = getData();
  console.log(data1, loading);
  return (
    <>
      <div className="max-w-3xl">
        <DataTable columns={columns} data={data} />
      </div>

      <div>
        <Table>
          <TableHeader className="font-heading">
            <TableRow className="bg-secondary-background text-foreground">
              <TableHead>A</TableHead>
              <TableHead>B</TableHead>
              <TableHead>C</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-secondary-background text-foreground data-[state=selected]:bg-main data-[state=selected]:text-main-foreground">
              <TableCell className="px-4 py-2">1</TableCell>
              <TableCell className="px-4 py-2">2</TableCell>
              <TableCell className="px-4 py-2">3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}
