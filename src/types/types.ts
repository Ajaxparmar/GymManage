
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GYM_ADMIN = 'GYM_ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for gym admin credentials
  role: Role;
  gymId?: string; // Null for Super Admin
}

export interface Gym {
  id: string;
  name: string;
  location: string;
  adminId: string;
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationMonths: number;
  price: number;
  description?: string;
}

export interface Student {
  id: string;
  gymId: string;
  fullName: string;
  mobileNumber: string;
  address: string;
  photoUrl: string;
  joiningDate: string;
  planId: string;
  planExpiryDate: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  gymId: string;
  amountPaid: number;
  pendingAmount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  planId: string;
}

export interface NotificationLog {
  id: string;
  studentId: string;
  message: string;
  type: 'WELCOME' | 'EXPIRY_REMINDER';
  sentAt: string;
  status: 'SENT' | 'FAILED';
}
