
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Video,
  ChevronDown,
  FileCheck,
  ShieldCheck,
  Banknote,
  User as UserIcon,
  FileSpreadsheet,
  Settings2,
  Database,
  Printer,
  Copy,
  Check
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
  Line,
  Legend
} from 'recharts';
import { parseComplaintText } from './geminiService';
import { 
  Complaint, 
  ComplaintStatus, 
  ComplaintType, 
  ProductType, 
  User,
  PartStatus
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
    reopenCount: 0,
    technicianName: '',
    partStatus: PartStatus.NONE,
    partName: ''
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
    reopenCount: 0,
    technicianName: 'Ali Tech',
    partStatus: PartStatus.REQUIRED,
    partName: 'Compressor'
  }
];

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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
      technicianName: '',
      partStatus: PartStatus.NONE,
      partName: '',
      ...newComplaint
    };
    setComplaints([complaint, ...complaints]);
    setActiveTab('dashboard');
  };

  const handleUpdateStatus = (id: string, newStatus: ComplaintStatus) => {
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));
  };

  const handleUpdateTechnician = (id: string, name: string) => {
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, technicianName: name } : c
    ));
  };

  const handleUpdatePartStatus = (id: string, status: PartStatus) => {
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, partStatus: status } : c
    ));
  };

  const handleUpdatePartName = (id: string, name: string) => {
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, partName: name } : c
    ));
  };

  const handleCloseComplaint = (id: string, closeData: any) => {
    setComplaints(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...closeData, status: ComplaintStatus.COMPLETED, closingDate: new Date().toISOString().split('T')[0] } 
        : c
    ));
  };

  const handleReopen = (id: string) => {
    setComplaints(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: ComplaintStatus.REOPENED, reopenCount: c.reopenCount + 1 } 
        : c
    ));
  };

  const exportToCSV = () => {
    const headers = ["Complaint No", "Customer", "Phone", "Product", "Status", "Type", "Part Status", "Part Name", "Closing Date", "Amount", "Technician"];
    const rows = complaints.map(c => [
      c.complaintNumber,
      `"${c.customerName}"`,
      c.phoneNumber,
      c.productType,
      c.status,
      c.type,
      c.partStatus || PartStatus.NONE,
      `"${c.partName || ''}"`,
      c.closingDate || '-',
      c.amountTaken || 0,
      `"${c.technicianName || 'N/A'}"`
    ]);
    
    let csvContent = "\uFEFF" + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ServiceCenter_AllComplaints_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFullBackup = () => {
    const data = JSON.stringify(complaints, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ServiceCenter_FULL_BACKUP_${new Date().toLocaleDateString()}.json`);
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

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={downloadFullBackup}
            className="w-full flex items-center gap-2 p-2 text-sky-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-bold"
          >
            <Database size={16} />
            <span>Full System Backup</span>
          </button>
          <div className="flex items-center gap-3 p-3 mb-2 bg-slate-800/50 rounded-lg">
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
            {(activeTab === 'history' || activeTab === 'dashboard') && (
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-100 transition border border-emerald-200"
              >
                <FileSpreadsheet size={16} />
                Export to Excel
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
                        <th className="px-6 py-4">Technician</th>
                        <th className="px-6 py-4">Parts Info</th>
                        <th className="px-6 py-4 text-sm">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
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
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-slate-700">{complaint.productType}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{complaint.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative flex items-center gap-2">
                               <UserIcon size={14} className="text-slate-400" />
                               <input 
                                type="text"
                                placeholder="Assign..."
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 outline-none w-28"
                                value={complaint.technicianName || ''}
                                onChange={(e) => handleUpdateTechnician(complaint.id, e.target.value)}
                               />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <PartStatusSelector 
                                currentStatus={complaint.partStatus || PartStatus.NONE}
                                onChange={(s) => handleUpdatePartStatus(complaint.id, s)}
                              />
                              <div className="flex items-center gap-2">
                                <Wrench size={12} className="text-slate-400" />
                                <input 
                                  type="text"
                                  placeholder="Part name..."
                                  className="bg-transparent border-b border-slate-200 text-[10px] py-0.5 focus:border-sky-500 outline-none w-24"
                                  value={complaint.partName || ''}
                                  onChange={(e) => handleUpdatePartName(complaint.id, e.target.value)}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusSelector 
                              currentStatus={complaint.status} 
                              onChange={(s) => handleUpdateStatus(complaint.id, s)} 
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => {
                                setSelectedComplaintId(complaint.id);
                                setIsCloseModalOpen(true);
                              }}
                              className="text-sky-600 hover:text-sky-700 text-sm font-bold bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-lg transition"
                            >
                              Close Case
                            </button>
                          </td>
                        </tr>
                      ))}
                      {activeComplaints.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
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
                            <p className="text-xs text-slate-400">Closed by <b>{complaint.technicianName}</b> on {complaint.closingDate}</p>
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
          onClose={() => {
            setIsCloseModalOpen(false);
            setSelectedComplaintId(null);
          }}
          onConfirm={(data) => handleCloseComplaint(selectedComplaintId, data)}
        />
      )}
    </div>
  );
};

// --- Subcomponents ---

const StatusSelector: React.FC<{ currentStatus: ComplaintStatus; onChange: (s: ComplaintStatus) => void }> = ({ currentStatus, onChange }) => {
  const getStyle = (s: ComplaintStatus) => {
    switch (s) {
      case ComplaintStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ComplaintStatus.IN_PROGRESS: return 'bg-sky-100 text-sky-700 border-sky-200';
      case ComplaintStatus.REOPENED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="relative inline-block group/select">
      <select 
        value={currentStatus} 
        onChange={(e) => onChange(e.target.value as ComplaintStatus)}
        className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all ${getStyle(currentStatus)} hover:brightness-95`}
      >
        <option value={ComplaintStatus.PENDING}>Pending</option>
        <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
        <option value={ComplaintStatus.REOPENED}>Reopened</option>
      </select>
      <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${currentStatus === ComplaintStatus.PENDING ? 'text-amber-500' : currentStatus === ComplaintStatus.IN_PROGRESS ? 'text-sky-500' : 'text-rose-500'}`} size={12} />
    </div>
  );
};

const PartStatusSelector: React.FC<{ currentStatus: PartStatus; onChange: (s: PartStatus) => void }> = ({ currentStatus, onChange }) => {
  const getStyle = (s: PartStatus) => {
    switch (s) {
      case PartStatus.REQUIRED: return 'bg-amber-50 text-amber-600 border-amber-200';
      case PartStatus.NOT_AVAILABLE: return 'bg-rose-50 text-rose-600 border-rose-200';
      case PartStatus.ATTENDING: return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="relative inline-block group/select-part">
      <select 
        value={currentStatus} 
        onChange={(e) => onChange(e.target.value as PartStatus)}
        className={`appearance-none px-2 py-0.5 pr-6 rounded text-[10px] font-black border cursor-pointer focus:outline-none transition-all uppercase tracking-tight ${getStyle(currentStatus)} hover:brightness-95`}
      >
        <option value={PartStatus.NONE}>No Parts Req.</option>
        <option value={PartStatus.REQUIRED}>Part Required</option>
        <option value={PartStatus.NOT_AVAILABLE}>Not Available</option>
        <option value={PartStatus.ATTENDING}>To Attending</option>
      </select>
      <Settings2 className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50" size={10} />
    </div>
  );
};

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
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isCopied, setIsCopied] = useState(false);
  const [data, setData] = useState({
    workDone: '',
    partsChanged: complaint.partName || '',
    amountTaken: 0,
    technicianName: complaint.technicianName || '',
    type: complaint.type === ComplaintType.UNKNOWN ? ComplaintType.REVENUE : complaint.type
  });

  const [files, setFiles] = useState<{
    warrantyCard?: string;
    invoiceSlip?: string;
    feedbackVideo?: string;
  }>({});

  const summaryText = useMemo(() => {
    return `*Complaint #:* ${complaint.complaintNumber}
*Customer:* ${complaint.customerName}
*Phone:* ${complaint.phoneNumber}
*Address:* ${complaint.address}

*Work Done:* ${data.workDone}
*Parts Replaced:* ${data.partsChanged || 'None'}
*Amount Charged:* PKR ${data.amountTaken}

*Technician:* ${data.technicianName}
*Closing Date:* ${new Date().toLocaleDateString()}`;
  }, [complaint, data]);

  const warrantyRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'warrantyCard' | 'invoiceSlip' | 'feedbackVideo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isWarranty = data.type === ComplaintType.WARRANTY;
  const canSubmit = !isWarranty || (files.warrantyCard && files.invoiceSlip);

  const downloadReceipt = () => {
    const headers = ["Field", "Value"];
    const rows = [
      ["Complaint Number", complaint.complaintNumber],
      ["Customer", complaint.customerName],
      ["Phone", complaint.phoneNumber],
      ["Address", complaint.address.replace(/,/g, ' ')],
      ["Technician", data.technicianName],
      ["Closing Date", new Date().toLocaleDateString()],
      ["Work Done", data.workDone.replace(/,/g, ' ')],
      ["Parts Replaced", data.partsChanged.replace(/,/g, ' ')],
      ["Amount Charged", `PKR ${data.amountTaken}`],
      ["Case Type", data.type]
    ];

    let csvContent = "\uFEFF" + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Receipt_Case_${complaint.complaintNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ ...data, ...files });
    // Auto-download receipt
    downloadReceipt();
    setStep('success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        
        {step === 'form' ? (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Close Case #{complaint.complaintNumber}</h2>
            <p className="text-slate-500 mb-8">Customer: {complaint.customerName}</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <div className="bg-sky-50 p-6 rounded-xl border border-sky-100 space-y-4">
                <h4 className="text-sm font-bold text-sky-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={16} /> Evidence Attachments
                  </div>
                  {isWarranty && <span className="text-[10px] text-sky-600 bg-sky-200/50 px-2 py-0.5 rounded uppercase font-black tracking-widest">Mandatory</span>}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="file" className="hidden" ref={warrantyRef} accept="image/*" onChange={(e) => handleFileChange(e, 'warrantyCard')} />
                  <input type="file" className="hidden" ref={invoiceRef} accept="image/*" onChange={(e) => handleFileChange(e, 'invoiceSlip')} />
                  <input type="file" className="hidden" ref={videoRef} accept="video/*" onChange={(e) => handleFileChange(e, 'feedbackVideo')} />

                  <div onClick={() => warrantyRef.current?.click()} className={`aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition cursor-pointer relative overflow-hidden group ${files.warrantyCard ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-sky-200 bg-white text-sky-400 hover:border-sky-400'}`}>
                    {files.warrantyCard ? <><FileCheck size={20} className="z-10" /><span className="text-[10px] font-bold uppercase z-10">Warranty Card</span></> : <><Upload size={20} /><span className="text-[10px] font-bold uppercase">Warranty Card*</span></>}
                  </div>

                  <div onClick={() => invoiceRef.current?.click()} className={`aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition cursor-pointer relative overflow-hidden group ${files.invoiceSlip ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-sky-200 bg-white text-sky-400 hover:border-sky-400'}`}>
                    {files.invoiceSlip ? <><FileCheck size={20} className="z-10" /><span className="text-[10px] font-bold uppercase z-10">Invoice Slip</span></> : <><Upload size={20} /><span className="text-[10px] font-bold uppercase">Invoice Slip*</span></>}
                  </div>

                  <div onClick={() => videoRef.current?.click()} className={`aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition cursor-pointer relative overflow-hidden group ${files.feedbackVideo ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-sky-200 bg-white text-sky-400 hover:border-sky-400'}`}>
                    {files.feedbackVideo ? <><FileCheck size={20} className="z-10" /><span className="text-[10px] font-bold uppercase z-10">Video Added</span></> : <><Video size={20} /><span className="text-[10px] font-bold uppercase">Feedback Video</span></>}
                  </div>
                </div>
                {isWarranty && (!files.warrantyCard || !files.invoiceSlip) && (
                  <p className="text-[10px] font-bold text-rose-500 text-center animate-pulse">* Please attach the Warranty Card and Invoice Slip to close this warranty case.</p>
                )}
              </div>

              <div className="pt-4">
                <button type="submit" disabled={!canSubmit} className={`w-full py-3 rounded-xl font-bold transition shadow-lg ${canSubmit ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
                  Submit & Close Complaint
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-1">Case Successfully Closed!</h2>
            <p className="text-sm text-slate-500 mb-6 text-center">Receipt has been auto-downloaded. Copy the summary below to send it via WhatsApp.</p>
            
            {/* Copy-Paste Summary Box */}
            <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-5 relative group mb-6">
              <button 
                onClick={handleCopy}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isCopied ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'}`}
              >
                {isCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Receipt</>}
              </button>
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed select-all">
                {summaryText}
              </pre>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button 
                onClick={downloadReceipt}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
              >
                <FileSpreadsheet size={20} />
                Download Full CSV Receipt
              </button>
              <button 
                onClick={onClose}
                className="w-full text-slate-500 font-bold py-3 hover:text-slate-800 transition text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
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

  const caseTypeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      [ComplaintType.WARRANTY]: 0,
      [ComplaintType.REVENUE]: 0,
    };
    closedComplaints.forEach(c => {
      if (c.type === ComplaintType.WARRANTY || c.type === ComplaintType.REVENUE) {
        counts[c.type] += 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [closedComplaints]);

  const revenueByCaseType = useMemo(() => {
    const revenue: Record<string, number> = {
      [ComplaintType.WARRANTY]: 0,
      [ComplaintType.REVENUE]: 0,
    };
    closedComplaints.forEach(c => {
      if (c.type === ComplaintType.WARRANTY || c.type === ComplaintType.REVENUE) {
        revenue[c.type] += (c.amountTaken || 0);
      }
    });
    return Object.entries(revenue).map(([name, amount]) => ({ name, amount }));
  }, [closedComplaints]);

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
  const totalWarrantyCount = closedComplaints.filter(c => c.type === ComplaintType.WARRANTY).length;
  const totalPaidCount = closedComplaints.filter(c => c.type === ComplaintType.REVENUE).length;

  const exportReportToCSV = () => {
    const summaryLines = [
      ["Business Summary Report", new Date().toLocaleDateString()],
      ["Metric", "Value"],
      ["Total Gross Revenue", `PKR ${totalRevenue}`],
      ["Warranty Support Cases", totalWarrantyCount],
      ["Paid Revenue Cases", totalPaidCount],
      ["Total Resolved Issues", closedComplaints.length],
      [],
      ["Technician Performance Leaderboard"],
      ["Technician Name", "Cases Completed", "Revenue Generated", "Reopen Frequency"],
    ];

    technicianPerformance.forEach(tech => {
      summaryLines.push([`"${tech.name}"`, tech.completed, tech.revenue, tech.reopened]);
    });

    summaryLines.push([]);
    summaryLines.push(["Daily Revenue Timeline"]);
    summaryLines.push(["Date", "Revenue (PKR)"]);
    revenueByDay.forEach(day => {
      summaryLines.push([day.name, day.revenue]);
    });

    summaryLines.push([]);
    summaryLines.push(["Case Mix by Product Category"]);
    summaryLines.push(["Category", "Total Count"]);
    productBreakdown.forEach(prod => {
      summaryLines.push([prod.name, prod.value]);
    });
    
    let csvContent = "\uFEFF" + summaryLines.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ServiceCenter_Excel_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Business Analytics</h3>
          <p className="text-sm text-slate-500">Professional performance metrics for Excel/Sheets analysis</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button 
            onClick={exportReportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 border border-emerald-500"
          >
            <FileSpreadsheet size={18} />
            Export to Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><TrendingUp size={28} /></div>
          <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Total Revenue</p><p className="text-xl font-black text-slate-800">PKR {totalRevenue.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center text-sky-600"><ShieldCheck size={28} /></div>
          <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Warranty Cases</p><p className="text-xl font-black text-slate-800">{totalWarrantyCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><Banknote size={28} /></div>
          <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Paid Cases</p><p className="text-xl font-black text-slate-800">{totalPaidCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><Users size={28} /></div>
          <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">Active Techs</p><p className="text-xl font-black text-slate-800">{technicianPerformance.length}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><ShieldCheck size={18} className="text-sky-500" /> Case Type Breakdown (Counts)</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={caseTypeBreakdown} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {caseTypeBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.name === ComplaintType.WARRANTY ? '#0ea5e9' : '#10b981'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 pr-8">
              {caseTypeBreakdown.map((entry) => (
                <div key={entry.name} className="flex flex-col">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.name === ComplaintType.WARRANTY ? '#0ea5e9' : '#10b981' }}></div><span className="text-xs font-bold text-slate-700 uppercase">{entry.name}</span></div>
                  <span className="text-lg font-black text-slate-900 ml-5">{entry.value} <span className="text-[10px] text-slate-400 font-normal">Cases</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500" /> Revenue Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCaseType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={10} width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>{revenueByCaseType.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.name === ComplaintType.WARRANTY ? '#0ea5e9' : '#10b981'} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Growth Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Complaint Volume by Product</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productBreakdown} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {productBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 pr-4">{productBreakdown.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div><span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{entry.name}</span></div>
            ))}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
