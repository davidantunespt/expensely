// Mock data for Smart Receipt & Expense Tracker prototype

export interface Expense {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  category:
    | "Travel"
    | "Meals"
    | "Other"
    | "Office Supplies"
    | "Marketing"
    | "Software";
  description: string;
  isDeductible: boolean;
  isBillable: boolean;
  receiptUrl?: string;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  color: string;
}

export interface MonthlyExpenseData {
  month: string;
  amount: number;
}

// Sample expense data matching the dashboard image
export const mockExpenses: Expense[] = [
  {
    id: "1",
    vendor: "Luxe Lodging",
    amount: 450.0,
    date: "2024-04-20",
    category: "Travel",
    description: "Hotel stay for client meeting",
    isDeductible: true,
    isBillable: true,
    receiptUrl: "/receipts/hotel.jpg",
  },
  {
    id: "2",
    vendor: "City Parking",
    amount: 15.0,
    date: "2024-04-15",
    category: "Travel",
    description: "Parking for client visit",
    isDeductible: true,
    isBillable: true,
  },
  {
    id: "3",
    vendor: "Coffee Shop",
    amount: 18.0,
    date: "2024-04-10",
    category: "Meals",
    description: "Business lunch meeting",
    isDeductible: true,
    isBillable: false,
  },
  {
    id: "4",
    vendor: "Office Depot",
    amount: 125.5,
    date: "2024-04-08",
    category: "Office Supplies",
    description: "Printer paper and supplies",
    isDeductible: true,
    isBillable: false,
  },
  {
    id: "5",
    vendor: "Adobe Creative Cloud",
    amount: 52.99,
    date: "2024-04-01",
    category: "Software",
    description: "Monthly subscription",
    isDeductible: true,
    isBillable: false,
  },
];

export const mockProjects: Project[] = [
  { id: "1", name: "Website Redesign", client: "Acme Corp", color: "#6B7280" },
  { id: "2", name: "Brand Identity", client: "StartupXYZ", color: "#9CA3AF" },
  { id: "3", name: "Mobile App", client: "TechCorp", color: "#D1D5DB" },
];

// Monthly expense trend data for the chart
export const mockMonthlyData: MonthlyExpenseData[] = [
  { month: "May", amount: 1200 },
  { month: "Jun", amount: 1350 },
  { month: "Jul", amount: 1500 },
  { month: "Aug", amount: 1100 },
  { month: "Sep", amount: 1800 },
  { month: "Oct", amount: 1950 },
  { month: "Nov", amount: 2100 },
  { month: "Dec", amount: 1750 },
  { month: "Jan", amount: 1900 },
  { month: "Feb", amount: 2000 },
  { month: "Mar", amount: 2200 },
  { month: "Apr", amount: 2135.78 },
];

// Category totals with soft gray color palette
export const mockCategoryData = [
  { name: "Travel", value: 465.0, color: "#374151" },
  { name: "Meals", value: 18.0, color: "#4B5563" },
  { name: "Office Supplies", value: 125.5, color: "#6B7280" },
  { name: "Software", value: 52.99, color: "#9CA3AF" },
  { name: "Other", value: 5.25, color: "#D1D5DB" },
];

// Dashboard summary data
export const mockDashboardSummary = {
  totalExpenses: 2135.78,
  taxDeductible: 1670.5,
  currentMonth: "April",
  recentExpenses: mockExpenses.slice(0, 3).reverse(),
};
