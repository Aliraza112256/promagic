
export enum ComplaintStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REOPENED = 'Reopened'
}

export enum ComplaintType {
  WARRANTY = 'Warranty',
  REVENUE = 'Revenue',
  UNKNOWN = 'Unknown'
}

export enum ProductType {
  AC = 'AC',
  REFRIGERATOR = 'Refrigerator',
  WASHING_MACHINE = 'Washing Machine',
  OTHER = 'Other'
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  productType: ProductType;
  modelNumber: string;
  serialNumber: string;
  date: string;
  status: ComplaintStatus;
  type: ComplaintType;
  
  // Closing Data
  workDone?: string;
  partsChanged?: string;
  amountTaken?: number;
  technicianName?: string;
  closingDate?: string;
  warrantyCardUrl?: string;
  invoiceSlipUrl?: string;
  feedbackVideoUrl?: string;
  
  reopenCount: number;
}

export interface User {
  role: 'admin' | 'technician';
  name: string;
}
