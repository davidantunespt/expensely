'use client'

import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Download, Eye, Edit2, Trash2, 
  ChevronLeft, ChevronRight,
  X, CheckCircle, XCircle, CreditCard, Receipt as ReceiptIcon,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Receipt, ReceiptFilters } from '@/types/receipt';
import { ReceiptDetailModal } from '@/components/Layout/ReceiptDetailModal';

// Mock data for demonstration
const mockReceipts: Receipt[] = [
  {
    id: '1',
    vendor: 'PADARIA PORTUGUESA',
    date: '2023-06-04 08:40:48',
    category: 'Meals',
    description: 'Breakfast items including sandwiches and coffee',
    isDeductible: false,
    paymentMethod: 'Cash',
    taxAmount: 0.36,
    qrCode: '',
    documentType: 'Receipt',
    items: [
      { name: 'SandesCroissa', quantity: 1, tax: 13, total: 2.7 },
      { name: 'CroisBrioche', quantity: 1, tax: 13, total: 0 },
      { name: 'Mista', quantity: 1, tax: 13, total: 0 },
      { name: 'SumoNaturala', quantity: 1, tax: 6, total: 2.99 },
      { name: 'Cafe Organico', quantity: 1, tax: 13, total: 0.9 },
    ],
    totalItems: 5,
    subtotalAmount: 3.99,
    totalAmount: 3.99,
    totalTax: 0.36,
    totalDiscount: 2.6,
    issuerVatNumber: '509783065',
    buyerVatNumber: '',
    documentDate: '2023-06-04 08:40:48',
    documentId: 'F5 095/1006163',
    organizationId: '1',
    fileName: 'fatura-ma.jpg',
    fileUrl: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg',
    createdAt: new Date('2023-06-04'),
    updatedAt: new Date('2023-06-04'),
  },
  {
    id: '2',
    vendor: 'TECH SUPPLIES LTD',
    date: '2023-06-05 14:22:15',
    category: 'Office Supplies',
    description: 'Computer accessories and stationery',
    isDeductible: true,
    paymentMethod: 'Credit Card',
    taxAmount: 12.50,
    qrCode: '',
    documentType: 'Invoice',
    items: [
      { name: 'Wireless Mouse', quantity: 2, tax: 23, total: 45.00 },
      { name: 'USB Cable', quantity: 3, tax: 23, total: 15.00 },
      { name: 'Notebook', quantity: 5, tax: 23, total: 25.00 },
    ],
    totalItems: 10,
    subtotalAmount: 85.00,
    totalAmount: 97.50,
    totalTax: 12.50,
    totalDiscount: 0,
    issuerVatNumber: '123456789',
    buyerVatNumber: '987654321',
    documentDate: '2023-06-05 14:22:15',
    documentId: 'INV-2023-001',
    organizationId: '1',
    fileName: 'tech-supplies-invoice.pdf',
    fileUrl: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-05'),
  },
  {
    id: '3',
    vendor: 'FUEL STATION',
    date: '2023-06-06 09:15:30',
    category: 'Transportation',
    description: 'Fuel for business travel',
    isDeductible: true,
    paymentMethod: 'Debit Card',
    taxAmount: 8.75,
    qrCode: '',
    documentType: 'Receipt',
    items: [
      { name: 'Gasoline', quantity: 35, tax: 23, total: 38.15 },
    ],
    totalItems: 1,
    subtotalAmount: 38.15,
    totalAmount: 46.90,
    totalTax: 8.75,
    totalDiscount: 0,
    issuerVatNumber: '555666777',
    buyerVatNumber: '987654321',
    documentDate: '2023-06-06 09:15:30',
    documentId: 'FS-2023-0156',
    organizationId: '1',
    fileName: 'fuel-receipt.jpg',
    fileUrl: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg',
    createdAt: new Date('2023-06-06'),
    updatedAt: new Date('2023-06-06'),
  },
];

const categories = ['All', 'Meals', 'Office Supplies', 'Transportation', 'Utilities', 'Marketing', 'Travel'];
const paymentMethods = ['All', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check'];

type SortField = 'date' | 'vendor' | 'amount' | 'category';
type SortDirection = 'asc' | 'desc';

export default function ExpensesPage() {
  const { currentOrganization } = useOrganization();
  const [filters, setFilters] = useState<ReceiptFilters>({
    search: '',
    category: 'All',
    paymentMethod: 'All',
    isDeductible: null,
    dateFrom: '',
    dateTo: '',
    minAmount: null,
    maxAmount: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter receipts based on current organization and filters
  const filteredReceipts = useMemo(() => {
    let filtered = mockReceipts.filter(receipt => 
      receipt.organizationId === currentOrganization?.id
    );

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(receipt =>
        receipt.vendor.toLowerCase().includes(searchLower) ||
        receipt.description.toLowerCase().includes(searchLower) ||
        receipt.documentId.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category !== 'All') {
      filtered = filtered.filter(receipt => receipt.category === filters.category);
    }

    if (filters.paymentMethod !== 'All') {
      filtered = filtered.filter(receipt => receipt.paymentMethod === filters.paymentMethod);
    }

    if (filters.isDeductible !== null) {
      filtered = filtered.filter(receipt => receipt.isDeductible === filters.isDeductible);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(receipt => 
        new Date(receipt.date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(receipt => 
        new Date(receipt.date) <= new Date(filters.dateTo)
      );
    }

    if (filters.minAmount !== null) {
      filtered = filtered.filter(receipt => receipt.totalAmount >= filters.minAmount!);
    }

    if (filters.maxAmount !== null) {
      filtered = filtered.filter(receipt => receipt.totalAmount <= filters.maxAmount!);
    }

    // Sort receipts
    filtered.sort((a, b) => {
      let aValue: number | string | Date, bValue: number | string | Date;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'vendor':
          aValue = a.vendor.toLowerCase();
          bValue = b.vendor.toLowerCase();
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [currentOrganization?.id, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      paymentMethod: 'All',
      isDeductible: null,
      dateFrom: '',
      dateTo: '',
      minAmount: null,
      maxAmount: null,
    });
    setCurrentPage(1);
  };

  if (!currentOrganization) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#fafbfc]">
        <div className="text-center">
          <ReceiptIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">No Organization Selected</h3>
          <p className="text-gray-500">Please select an organization to view expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
              <p className="text-gray-500 mt-2 text-lg">
                Manage and review all your receipt expenses
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(filteredReceipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0))}
                </div>
                <div className="text-sm text-gray-500">Total Expenses</div>
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 bg-[#19e2c0] text-white rounded-xl hover:bg-[#13c6a7] transition-all duration-200">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by vendor, description, or document ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19e2c0] focus:border-[#19e2c0] transition-all duration-200"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                showFilters ? 'bg-[#19e2c0] text-white' : 'border border-[#19e2c0] text-[#19e2c0] hover:bg-[#19e2c0] hover:text-white'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19e2c0] focus:border-[#19e2c0]"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19e2c0] focus:border-[#19e2c0]"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Deductible</label>
                  <select
                    value={filters.isDeductible === null ? 'All' : filters.isDeductible.toString()}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      isDeductible: e.target.value === 'All' ? null : e.target.value === 'true'
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19e2c0] focus:border-[#19e2c0]"
                  >
                    <option value="All">All</option>
                    <option value="true">Deductible</option>
                    <option value="false">Non-deductible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19e2c0] focus:border-[#19e2c0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19e2c0] focus:border-[#19e2c0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.minAmount || ''}
                    onChange={(e) => setFilters({ ...filters, minAmount: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19e2c0] focus:border-[#19e2c0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.maxAmount || ''}
                    onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19e2c0] focus:border-[#19e2c0]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={resetFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
          <div className="text-gray-700">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredReceipts.length)} of {filteredReceipts.length} expenses
          </div>
          <div className="text-sm text-gray-400">
            {filteredReceipts.filter(r => r.isDeductible).length} tax deductible
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fafbfc] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-[#19e2c0] transition-colors"
                    >
                      <span>Date</span>
                      {getSortIcon('date')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('vendor')}
                      className="flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-[#19e2c0] transition-colors"
                    >
                      <span>Vendor</span>
                      {getSortIcon('vendor')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-[#19e2c0] transition-colors"
                    >
                      <span>Category</span>
                      {getSortIcon('category')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center space-x-2 text-sm font-semibold text-gray-700 hover:text-[#19e2c0] transition-colors"
                    >
                      <span>Amount</span>
                      {getSortIcon('amount')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{formatDate(receipt.date)}</div>
                      <div className="text-xs text-gray-400">{receipt.documentId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{receipt.vendor}</div>
                      <div className="text-xs text-gray-500 truncate max-w-48">{receipt.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {receipt.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(receipt.totalAmount)}</div>
                      <div className="text-xs text-gray-400">Tax: {formatCurrency(receipt.taxAmount)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{receipt.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {receipt.isDeductible ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-[#19e2c0]" />
                            <span className="text-xs font-medium text-[#19e2c0]">Deductible</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400">Non-deductible</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="p-2 text-gray-400 hover:text-[#19e2c0] hover:bg-[#e6fcf7] rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-[#19e2c0] hover:bg-[#e6fcf7] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-[#19e2c0] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-[#19e2c0] hover:bg-[#e6fcf7] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredReceipts.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <ReceiptIcon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No expenses found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.category !== 'All' || filters.paymentMethod !== 'All'
                ? 'Try adjusting your filters to see more results.'
                : 'Start by uploading your first receipt to track expenses.'}
            </p>
            {(filters.search || filters.category !== 'All' || filters.paymentMethod !== 'All') && (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-[#19e2c0] text-white rounded-xl hover:bg-[#13c6a7] transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <ReceiptDetailModal
          receipt={selectedReceipt}
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}