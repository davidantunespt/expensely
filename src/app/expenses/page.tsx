"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  CreditCard,
  Receipt as ReceiptIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Receipt, ReceiptFilters } from "@/types/receipt";
import { ReceiptDetailModal } from "@/components/Layout/ReceiptDetailModal";
import { ExpensesHeader } from "@/components/Expenses/ExpensesHeader";
import { ToastContainer, useToast } from "@/components/UI/Toast";
import { DeleteReceiptModal } from "@/components/UI/DeleteReceiptModal";
import { Input } from "@/components/UI/input";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectWithLabel,
} from "@/components/UI/select";
import { DatePicker } from "@/components/UI/DatePicker";
import { CurrencyInput } from "@/components/UI/CurrencyInput";
import { Button } from "@/components/UI/Button";
import { cn } from "@/lib/utils";

// API Response Types
interface ApiResponse {
  success: boolean;
  data: {
    receipts: Receipt[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalExpenses: number;
      deductibleExpenses: number;
      receiptCount: number;
    };
  };
  error?: string;
}

const categories = [
  { label: "All", value: "All" },
  { label: "Meals", value: "MEALS" },
  { label: "Office Supplies", value: "OFFICE_SUPPLIES" },
  { label: "Transportation", value: "TRANSPORTATION" },
  { label: "Utilities", value: "UTILITIES" },
  { label: "Marketing", value: "MARKETING" },
  { label: "Travel", value: "TRAVEL" },
];

const paymentMethods = [
  { label: "All", value: "All" },
  { label: "Cash", value: "Cash" },
  { label: "Credit Card", value: "Credit Card" },
  { label: "Debit Card", value: "Debit Card" },
  { label: "Digital Wallet", value: "Digital Wallet" },
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "Check", value: "Check" },
];

type SortField = "date" | "vendor" | "amount" | "category";
type SortDirection = "asc" | "desc";

export default function ExpensesPage() {
  const { currentOrganization } = useOrganization();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // State
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    deductibleExpenses: 0,
    receiptCount: 0,
  });

  const [filters, setFilters] = useState<ReceiptFilters>({
    search: "",
    category: "All",
    paymentMethod: "All",
    isDeductible: null,
    dateFrom: "",
    dateTo: "",
    minAmount: null,
    maxAmount: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [deleteReceipt, setDeleteReceipt] = useState<Receipt | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // API Functions
  const fetchReceipts = useCallback(async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortField,
        sortDirection,
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== "All" && { category: filters.category }),
        ...(filters.paymentMethod !== "All" && {
          paymentMethod: filters.paymentMethod,
        }),
        ...(filters.isDeductible !== null && {
          isDeductible: filters.isDeductible.toString(),
        }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.minAmount !== null && {
          minAmount: filters.minAmount.toString(),
        }),
        ...(filters.maxAmount !== null && {
          maxAmount: filters.maxAmount.toString(),
        }),
      });

      const response = await fetch(`/api/receipts?${queryParams}`, {
        headers: {
          "x-organization-id": currentOrganization.id,
        },
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setReceipts(result.data.receipts);
        setPagination(result.data.pagination);
        setSummary(result.data.summary);
      } else {
        showError("Failed to fetch receipts", result.error);
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
      showError("Failed to fetch receipts", "Please try again later");
    } finally {
      setLoading(false);
    }
  }, [
    currentOrganization?.id,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
    filters.search,
    filters.category,
    filters.paymentMethod,
    filters.isDeductible,
    filters.dateFrom,
    filters.dateTo,
    filters.minAmount,
    filters.maxAmount,
  ]);

  // Handle successful deletion - refresh receipts list
  const handleReceiptDeleted = () => {
    setDeleteReceipt(null);
    fetchReceipts();
  };

  // Fetch receipts when dependencies change
  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Filtered receipts are handled by the API
  const filteredReceipts = receipts;

  // Pagination is handled by API
  const paginatedReceipts = filteredReceipts;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "All",
      paymentMethod: "All",
      isDeductible: null,
      dateFrom: "",
      dateTo: "",
      minAmount: null,
      maxAmount: null,
    });
    setCurrentPage(1);
  };

  if (!currentOrganization) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <ReceiptIcon className="w-16 h-16 text-secondary-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary">
            No Organization Selected
          </h3>
          <p className="text-text-secondary">
            Please select an organization to view expenses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <ExpensesHeader
          title="Expenses"
          description="Manage and review all your receipt expenses"
          totalAmount={summary.totalExpenses}
          onActionClick={() => {
            // Handle export functionality
            showSuccess(
              "Export feature",
              "Export functionality will be implemented soon"
            );
          }}
        />

        {/* Search and Filters */}
        <div className="bg-bg-primary rounded-2xl border border-border-primary p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                type="text"
                placeholder="Search by vendor, description, or document ID..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 h-12 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 text-text-primary bg-bg-primary focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter className="w-5 h-5" />}
              className={cn(
                "px-6 py-3 h-12 rounded-xl transition-all duration-200 border-accent text-accent hover:bg-accent hover:text-text-inverse",
                showFilters && "bg-accent text-text-inverse border-accent"
              )}
            >
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <SelectWithLabel
                  label="Category"
                  value={filters.category}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value })
                  }
                >
                  <SelectTrigger className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-text-primary bg-bg-primary focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>

                <SelectWithLabel
                  label="Payment Method"
                  value={filters.paymentMethod}
                  onValueChange={(value) =>
                    setFilters({ ...filters, paymentMethod: value })
                  }
                >
                  <SelectTrigger className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-text-primary bg-bg-primary focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWithLabel>

                <SelectWithLabel
                  label="Tax Deductible"
                  value={
                    filters.isDeductible === null
                      ? "All"
                      : filters.isDeductible.toString()
                  }
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      isDeductible:
                        value === "All"
                          ? null
                          : value === "true",
                    })
                  }
                >
                  <SelectTrigger className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-text-primary bg-bg-primary focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent">
                    <SelectValue placeholder="Select tax status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="true">Deductible</SelectItem>
                    <SelectItem value="false">Non-deductible</SelectItem>
                  </SelectContent>
                </SelectWithLabel>

                <DatePicker
                  label="Date From"
                  value={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onChange={(date) =>
                    setFilters({ 
                      ...filters, 
                      dateFrom: date ? date.toISOString().split('T')[0] : "" 
                    })
                  }
                  placeholder="Select start date"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <DatePicker
                  label="Date To"
                  value={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onChange={(date) =>
                    setFilters({ 
                      ...filters, 
                      dateTo: date ? date.toISOString().split('T')[0] : "" 
                    })
                  }
                  placeholder="Select end date"
                />

                <CurrencyInput
                  label="Min Amount"
                  value={filters.minAmount}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      minAmount: value,
                    })
                  }
                  placeholder="0.00"
                  min={0}
                />

                <CurrencyInput
                  label="Max Amount"
                  value={filters.maxAmount}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      maxAmount: value,
                    })
                  }
                  placeholder="0.00"
                  min={0}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-text-secondary">
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading expenses...</span>
              </div>
            ) : (
              `Showing ${
                (pagination.page - 1) * pagination.limit + 1
              }-${Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )} of ${pagination.total} expenses`
            )}
          </div>
          <div className="text-sm text-text-muted">
            {summary.deductibleExpenses > 0 &&
              `€${summary.deductibleExpenses.toFixed(2)} tax deductible`}
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-bg-primary rounded-2xl border border-border-primary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border-primary">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center space-x-2 text-sm font-semibold text-text-secondary hover:text-accent transition-colors"
                    >
                      <span>Date</span>
                      {getSortIcon("date")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("vendor")}
                      className="flex items-center space-x-2 text-sm font-semibold text-text-secondary hover:text-accent transition-colors"
                    >
                      <span>Vendor</span>
                      {getSortIcon("vendor")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("category")}
                      className="flex items-center space-x-2 text-sm font-semibold text-text-secondary hover:text-accent transition-colors"
                    >
                      <span>Category</span>
                      {getSortIcon("category")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("amount")}
                      className="flex items-center space-x-2 text-sm font-semibold text-text-secondary hover:text-accent transition-colors"
                    >
                      <span>Amount</span>
                      {getSortIcon("amount")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedReceipts.length > 0 ? (
                  paginatedReceipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(receipt.date)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {receipt.documentId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {receipt.vendor}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-48">
                          {receipt.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {receipt.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(receipt.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Tax: {formatCurrency(receipt.taxAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {receipt.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {receipt.isDeductible ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-success-green" />
                              <span className="text-xs font-medium text-success-green">
                                Deductible
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-text-muted" />
                              <span className="text-xs text-text-muted">
                                Non-deductible
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedReceipt(receipt)}
                            className="p-2 text-text-muted hover:text-accent hover:bg-bg-accent rounded-lg transition-all duration-200 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-muted rounded-lg transition-all duration-200 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteReceipt(receipt)}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <ReceiptIcon className="w-12 h-12 text-text-muted mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                          No expenses found
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {filters.search ||
                          filters.category !== "All" ||
                          filters.paymentMethod !== "All" ||
                          filters.isDeductible !== null ||
                          filters.dateFrom ||
                          filters.dateTo ||
                          filters.minAmount !== null ||
                          filters.maxAmount !== null
                            ? "Try adjusting your filters to see more results."
                            : "Start by uploading your first receipt to track expenses."}
                        </p>
                        {(filters.search ||
                          filters.category !== "All" ||
                          filters.paymentMethod !== "All" ||
                          filters.isDeductible !== null ||
                          filters.dateFrom ||
                          filters.dateTo ||
                          filters.minAmount !== null ||
                          filters.maxAmount !== null) && (
                          <button
                            onClick={resetFilters}
                            className="mt-4 px-4 py-2 bg-accent text-text-inverse rounded-lg hover:bg-accent-dark transition-all duration-200 text-sm"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-accent hover:bg-bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPage === page
                              ? "bg-accent text-text-inverse"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(pagination.totalPages, currentPage + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 text-gray-400 hover:text-accent hover:bg-bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <ReceiptDetailModal
          receipt={selectedReceipt}
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onDeleted={fetchReceipts} // Refresh the receipts list after deletion
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteReceiptModal
        receipt={deleteReceipt}
        isOpen={!!deleteReceipt}
        onClose={() => setDeleteReceipt(null)}
        onDeleted={handleReceiptDeleted}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
