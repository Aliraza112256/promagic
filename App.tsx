
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck, 
  History, 
  BarChart3, 
  LogOut, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users,
  Wrench,
  Download,
  RotateCcw,
  X,
  Upload,
  Camera,
  Video
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { parseComplaintText } from './geminiService';
import { 
  Complaint, 
  ComplaintStatus, 
  ComplaintType, 
  ProductType, 
  User 
} from './types';

// Initial Mock Data
const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: '1',
    complaintNumber: '1023',
    customerName: 'Ahmed Ali',
    phoneNumber: '0300-1234567',
    address: 'Street 5, Defense, Karachi',
    productType: ProductType.AC,
    modelNumber: 'INV-12K',
    serialNumber: 'SN889911',
    date: '2023-10-25',
    status: ComplaintStatus.PENDING,
    type: ComplaintType.WARRANTY,
    reopenCount: 0
  },
  {
    id: '2',
    complaintNumber: '1024',
    customerName: 'Sara Khan',
    phoneNumber: '0312-7654321',
    address: 'Gulshan, Block 4, Lahore',
    productType: ProductType.REFRIGERATOR,
    modelNumber: 'REF-GTX',
    serialNumber: 'SN442200',
    date: '2023-10-24',
    status: ComplaintStatus.IN_PROGRESS,
    type: ComplaintType.REVENUE,
    reopenCount: 0
  }
];

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'reports' | 'receive'>('dashboard');
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('service_center_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });
  const [currentUser, setCurrentUser] = useState<User | null>({ name: 'Admin User', role: 'admin' });
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('service_center_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Derived State
  const activeComplaints = useMemo(() => 
    complaints.filter(c => 
      c.status !== ComplaintStatus.COMPLETED && 
      (c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.complaintNumber.includes(searchTerm) ||
       c.phoneNumber.includes(searchTerm))
    ), [complaints, searchTerm]);

  const historyComplaints = useMemo(() => 
    complaints.filter(c => 
      c.status === ComplaintStatus.COMPLETED &&
      (c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.complaintNumber.includes(searchTerm) ||
       c.phoneNumber.includes(searchTerm))
    ), [complaints, searchTerm]);

  // Handlers
  const handleAddComplaint = (newComplaint: Partial<Complaint>) => {
    const complaint: Complaint = {
      id: Math.random().toString(36).substr(2, 9),
      complaintNumber: newComplaint.complaintNumber || '',
      customerName: newComplaint.customerName || '',
      phoneNumber: newComplaint.phoneNumber || '',
      address: newComplaint.address || '',
      productType: newComplaint.productType || ProductType.OTHER,
      modelNumber: newComplaint.modelNumber || '',
      serialNumber: newComplaint.serialNumber || '',
      date: new Date().toISOString().split('T')[0],
      status: ComplaintStatus.PENDING,
      type: newComplaint.type || ComplaintType.UNKNOWN,
      reopenCount: 0,
      ...newComplaint
    };
    setComplaints([complaint, ...complaints]);
    setActiveTab('dashboard');
  };

  const handleCloseComplaint = (id: string, closeData: any) => {
    setComplaints(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...closeData, status: ComplaintStatus.COMPLETED, closingDate: new Date().toISOString().split('T')[0] } 
        : c
    ));
    setIsCloseModalOpen(false);
    setSelectedComplaintId(null);
  };

  const handleReopen = (id: string) => {
    setComplaints(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: ComplaintStatus.REOPENED, reopenCount: c.reopenCount + 1 } 
        : c
    ));
  };

  const exportToCSV = () => {
    const headers = ["Complaint No", "Customer", "Phone", "Product", "Status", "Type", "Closing Date", "Amount"];
    const rows = complaints.map(c => [
      c.complaintNumber,
      c.customerName,
      c.phoneNumber,
      c.productType,
      c.status,
      c.type,
      c.closingDate || '-',
      c.amountTaken || 0
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ServiceCenter_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center">
              <ClipboardCheck className="text-sky-600 w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">ServiceCenter Pro</h1>
          <p className="text-slate-500 text-center mb-8">Login to manage complaints</p>
          <div className="space-y-4">
            <button 
              onClick={() => setCurrentUser({ name: 'Admin', role: 'admin' })}
              className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition shadow-lg shadow-sky-200"
            >
              Login as Admin
            </button>
            <button 
              onClick={() => setCurrentUser({ name: 'Technician Ali', role: 'technician' })}
              className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
            >
              Login as Technician
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col sticky top-0 h-screen shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">CenterPro</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Plus size={20} />} 
            label="Receive New" 
            active={activeTab === 'receive'} 
            onClick={() => setActiveTab('receive')} 
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Full History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Reports" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 mb-4 bg-slate-800/50 rounded-lg">
            <div className="w-10 h-10 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400 font-bold">
              {currentUser.name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center gap-2 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut size={18} />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto pb-12">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab === 'receive' ? 'New Complaint' : activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search complaints..." 
                className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500 transition-all w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === 'history' && (
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Pending" value={activeComplaints.filter(c => c.status === ComplaintStatus.PENDING).length} icon={<Clock className="text-amber-500" />} color="amber" />
                <StatCard label="In Progress" value={activeComplaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length} icon={<AlertCircle className="text-sky-500" />} color="sky" />
                <StatCard label="Reopened" value={activeComplaints.filter(c => c.status === ComplaintStatus.REOPENED).length} icon={<RotateCcw className="text-rose-500" />} color="rose" />
                <StatCard label="Resolved Today" value={complaints.filter(c => c.closingDate === new Date().toISOString().split('T')[0]).length} icon={<CheckCircle2 className="text-emerald-500" />} color="emerald" />
              </div>

              {/* Complaints Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                      <tr>
                        <th className="px-6 py-4">Complaint No</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeComplaints.map(complaint => (
                        <tr key={complaint.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-slate-900">#{complaint.complaintNumber}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">{complaint.customerName}</p>
                            <p className="text-xs text-slate-500">{complaint.phoneNumber}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                              <span className="text-sm">{complaint.productType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={complaint.status} />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">{complaint.type}</td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => {
                                setSelectedComplaintId(complaint.id);
                                setIsCloseModalOpen(true);
                              }}
                              className="text-sky-600 hover:text-sky-700 text-sm font-bold bg-sky-50 px-4 py-2 rounded-lg transition"
                            >
                              Close Case
                            </button>
                          </td>
                        </tr>
                      ))}
                      {activeComplaints.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                            No active complaints found. Great job!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receive' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <ClipboardCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Smart Complaint Receiver</h3>
                    <p className="text-sm text-slate-500">Paste raw text from company message to auto-fill details</p>
                  </div>
                </div>
                <ReceiveForm onAdd={handleAddComplaint} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                      <tr>
                        <th className="px-6 py-4">No</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Closing Details</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Reopened</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyComplaints.map(complaint => (
                        <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">#{complaint.complaintNumber}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">{complaint.customerName}</p>
                            <p className="text-xs text-slate-500">{complaint.phoneNumber}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-700">{complaint.workDone}</p>
                            <p className="text-xs text-slate-400">Closed on {complaint.closingDate}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-600">PKR {complaint.amountTaken}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${complaint.reopenCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                              {complaint.reopenCount} times
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleReopen(complaint.id)}
                              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 text-sm font-bold bg-rose-50 px-3 py-1.5 rounded-lg transition"
                            >
                              <RotateCcw size={14} />
                              Reopen
                            </button>
                          </td>
                        </tr>
                      ))}
                      {historyComplaints.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                            No closed complaints found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <ReportsView complaints={complaints} />
          )}
        </div>
      </main>

      {/* Close Complaint Modal */}
      {isCloseModalOpen && selectedComplaintId && (
        <CloseModal 
          complaint={complaints.find(c => c.id === selectedComplaintId)!} 
          onClose={() => setIsCloseModalOpen(false)}
          onConfirm={(data) => handleCloseComplaint(selectedComplaintId, data)}
        />
      )}
    </div>
  );
};

// --- Subcomponents ---

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
      active 
        ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40 translate-x-1' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-50`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-end gap-2">
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mb-1.5 font-medium">Cases</p>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  const styles = {
    [ComplaintStatus.PENDING]: 'bg-amber-100 text-amber-700',
    [ComplaintStatus.IN_PROGRESS]: 'bg-sky-100 text-sky-700',
    [ComplaintStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
    [ComplaintStatus.REOPENED]: 'bg-rose-100 text-rose-700'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
};

const ReceiveForm: React.FC<{ onAdd: (c: Partial<Complaint>) => void }> = ({ onAdd }) => {
  const [pastedText, setPastedText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState<Partial<Complaint>>({
    complaintNumber: '',
    customerName: '',
    phoneNumber: '',
    address: '',
    productType: ProductType.AC,
    modelNumber: '',
    serialNumber: '',
    type: ComplaintType.WARRANTY
  });

  const handleSmartParse = async () => {
    if (!pastedText.trim()) return;
    setIsParsing(true);
    const result = await parseComplaintText(pastedText);
    if (result) {
      setFormData(prev => ({
        ...prev,
        complaintNumber: result.complaintNumber || '',
        customerName: result.customerName || '',
        phoneNumber: result.phoneNumber || '',
        address: result.address || '',
        productType: result.productType as ProductType || ProductType.OTHER,
        modelNumber: result.modelNumber || '',
        serialNumber: result.serialNumber || '',
        type: result.type as ComplaintType || ComplaintType.WARRANTY
      }));
    }
    setIsParsing(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">Paste Complaint Content</label>
        <textarea 
          placeholder="Paste raw text from WhatsApp/Email/Company Portal here..."
          className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
        />
        <button 
          onClick={handleSmartParse}
          disabled={isParsing || !pastedText}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isParsing ? 'Processing...' : 'Magic Parse with Gemini'}
          {!isParsing && <TrendingUp size={18} />}
        </button>
      </div>

      <div className="h-px bg-slate-100" />

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); onAdd(formData); }}>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Complaint Number</label>
          <input 
            type="text" 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            value={formData.complaintNumber}
            onChange={(e) => setFormData({...formData, complaintNumber: e.target.value})}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Customer Name</label>
          <input 
            type="text" 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            value={formData.customerName}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
          <input 
            type="text" 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Product Type</label>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            value={formData.productType}
            onChange={(e) => setFormData({...formData, productType: e.target.value as ProductType})}
          >
            {Object.values(ProductType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
          <textarea 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Model Number</label>
          <input 
            type="text" 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            value={formData.modelNumber}
            onChange={(e) => setFormData({...formData, modelNumber: e.target.value})}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Serial Number</label>
          <input 
            type="text" 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            value={formData.serialNumber}
            onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
          />
        </div>
        <div className="md:col-span-2 pt-4">
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
            Save Complaint & View Dashboard
          </button>
        </div>
      </form>
    </div>
  );
};

const CloseModal: React.FC<{ complaint: Complaint; onClose: () => void; onConfirm: (data: any) => void }> = ({ complaint, onClose, onConfirm }) => {
  const [data, setData] = useState({
    workDone: '',
    partsChanged: '',
    amountTaken: 0,
    technicianName: '',
    type: complaint.type === ComplaintType.UNKNOWN ? ComplaintType.REVENUE : complaint.type
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Close Case #{complaint.complaintNumber}</h2>
        <p className="text-slate-500 mb-8">Customer: {complaint.customerName}</p>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onConfirm(data); }}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Work Performed</label>
            <textarea 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm h-24"
              placeholder="Describe the repair work done..."
              required
              value={data.workDone}
              onChange={(e) => setData({...data, workDone: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Parts Changed</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                value={data.partsChanged}
                onChange={(e) => setData({...data, partsChanged: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Amount Taken (PKR)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                value={data.amountTaken}
                onChange={(e) => setData({...data, amountTaken: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Technician Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                required
                value={data.technicianName}
                onChange={(e) => setData({...data, technicianName: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Case Type</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                value={data.type}
                onChange={(e) => setData({...data, type: e.target.value as ComplaintType})}
              >
                <option value={ComplaintType.WARRANTY}>Warranty</option>
                <option value={ComplaintType.REVENUE}>Revenue (Paid)</option>
              </select>
            </div>
          </div>

          {data.type === ComplaintType.WARRANTY && (
            <div className="bg-sky-50 p-6 rounded-xl border border-sky-100 space-y-4">
              <h4 className="text-sm font-bold text-sky-800 flex items-center gap-2">
                <Camera size={16} /> Warranty Evidence Required
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="aspect-video bg-white rounded-lg border-2 border-dashed border-sky-200 flex flex-col items-center justify-center text-sky-400 gap-1 hover:border-sky-400 transition cursor-pointer">
                  <Upload size={20} />
                  <span className="text-[10px] font-bold uppercase">Warranty Card</span>
                </div>
                <div className="aspect-video bg-white rounded-lg border-2 border-dashed border-sky-200 flex flex-col items-center justify-center text-sky-400 gap-1 hover:border-sky-400 transition cursor-pointer">
                  <Upload size={20} />
                  <span className="text-[10px] font-bold uppercase">Invoice Slip</span>
                </div>
                <div className="aspect-video bg-white rounded-lg border-2 border-dashed border-sky-200 flex flex-col items-center justify-center text-sky-400 gap-1 hover:border-sky-400 transition cursor-pointer">
                  <Video size={20} />
                  <span className="text-[10px] font-bold uppercase">Feedback Video</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">
              Submit & Close Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReportsView: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  const closedComplaints = complaints.filter(c => c.status === ComplaintStatus.COMPLETED);
  
  const revenueByDay = useMemo(() => {
    const days: Record<string, number> = {};
    closedComplaints.forEach(c => {
      const date = c.closingDate || 'Unknown';
      days[date] = (days[date] || 0) + (c.amountTaken || 0);
    });
    return Object.entries(days).map(([name, revenue]) => ({ name, revenue }));
  }, [closedComplaints]);

  const productBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      counts[c.productType] = (counts[c.productType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const technicianPerformance = useMemo(() => {
    const techs: Record<string, { completed: number, revenue: number, reopened: number }> = {};
    complaints.forEach(c => {
      if (c.technicianName) {
        if (!techs[c.technicianName]) techs[c.technicianName] = { completed: 0, revenue: 0, reopened: 0 };
        if (c.status === ComplaintStatus.COMPLETED) {
          techs[c.technicianName].completed += 1;
          techs[c.technicianName].revenue += (c.amountTaken || 0);
        }
        techs[c.technicianName].reopened += c.reopenCount;
      }
    });
    return Object.entries(techs).map(([name, stats]) => ({ name, ...stats }));
  }, [complaints]);

  const totalRevenue = closedComplaints.reduce((acc, c) => acc + (c.amountTaken || 0), 0);
  const warrantyCases = closedComplaints.filter(c => c.type === ComplaintType.WARRANTY).length;
  const revenueCases = closedComplaints.filter(c => c.type === ComplaintType.REVENUE).length;

  return (
    <div className="space-y-8">
      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Total Revenue</p>
            <p className="text-2xl font-black text-slate-800">PKR {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
            <ClipboardCheck size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Resolved Cases</p>
            <p className="text-2xl font-black text-slate-800">{closedComplaints.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Active Techs</p>
            <p className="text-2xl font-black text-slate-800">{technicianPerformance.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Case Mix by Product</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productBreakdown}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 pr-8">
              {productBreakdown.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs font-medium text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technician Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Technician Leaderboard</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-4">Technician</th>
                  <th className="pb-4">Completed</th>
                  <th className="pb-4">Revenue Gen.</th>
                  <th className="pb-4">Reopened</th>
                  <th className="pb-4">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {technicianPerformance.map(tech => (
                  <tr key={tech.name} className="group">
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">
                        {tech.name[0]}
                      </div>
                      <span className="font-semibold text-slate-800">{tech.name}</span>
                    </td>
                    <td className="py-4 text-sm text-slate-600 font-medium">{tech.completed}</td>
                    <td className="py-4 text-sm font-bold text-emerald-600">PKR {tech.revenue.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${tech.reopened > 2 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                        {tech.reopened}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${Math.min(100, (tech.completed / (tech.completed + tech.reopened || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
