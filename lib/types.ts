// lib/types.ts

export interface Tenant { 
  _id: string; 
  name: string; 
  phone: string; 
  nid: string; 
  flatNo: string; 
  rentAmount: number; 
  tenantId: string; 
  joinedDate: string; 
  occupation: string; 
  securityDeposit: number; 
  emergencyContact: string; 
  status?: string;
  exitDate?: string;
  profilePic?: string; // এটি যোগ করা হয়েছে যাতে মালিক ও ম্যানেজার ছবি দেখতে পারে
  nidPhoto?: string;   // এটি যোগ করা হয়েছে যাতে এনআইডি কার্ড দেখা যায়
  familyMembers: number;
  familyList: IFamilyMember[]; 
}

export interface Payment { 
  _id: string; 
  tenantId: Tenant | string | null; 
  month: string; 
  year: number; 
  rentAmount: number; 
  serviceCharge: number; 
  status: string; 
  amount?: number; 
  method?: "Cash" | "Online";
}

export interface Expense { 
  _id: string; 
  description: string; 
  amount: number; 
  type: string; 
  date: string; 
}

export interface Log { 
  _id: string; 
  action: string; 
  details: string; 
  createdAt: string; 
  changes?: { field: string; old: string | number; new: string | number; }[]; 
}
export interface Handover {
  _id: string;
  amount: number;
  date: string;
  status: "Pending" | "Confirmed";
  note: string;
  createdAt: string;
}

export interface OwnerData { 
  stats: { 
    totalRentIncome: number; 
    totalServiceCharge: number; 
    totalConstruction: number; 
    totalMaintenance: number; 
    totalSecurityDeposit: number; // এটি যোগ করা হয়েছে মালিকের ড্যাশবোর্ড এরর ফিক্স করতে
    netBalance: number; 
  };
  tenants: Tenant[]; 
  payments: Payment[]; 
  expenses: Expense[]; 
  handovers: Handover[];
}

export interface Complaint {
  _id: string;
  tenantId: string;
  tenantName: string;
  flatNo: string;
  subject: string;
  message: string;
  status: "Pending" | "Solved";
  createdAt: string;
}

export interface Toast {
  message: string;
  type: "success" | "error" | "info";
  show: boolean;
}

export interface IFamilyMember {
  name: string;
  relation: string;
  idPhoto: string;
}