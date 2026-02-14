"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { User, Gym, Student, MembershipPlan, PaymentRecord, Role } from "@/types/types";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info";
}

interface AppState {
  currentUser: User | null;
  users: User[];
  gyms: Gym[];
  students: Student[];
  plans: MembershipPlan[];
  payments: PaymentRecord[];
  toasts: Toast[];
}

interface AppContextType extends AppState {
  login: (email: string) => void;
  logout: () => void;
  addUser: (user: Partial<User>) => User;
  addGym: (gym: Partial<Gym>) => void;
  addStudent: (student: Partial<Student>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  addPlan: (plan: Partial<MembershipPlan>) => void;
  addPayment: (payment: Partial<PaymentRecord>) => void;
  deletePlan: (id: string) => void;
  showToast: (title: string, description?: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  getStudentBalance: (studentId: string) => number;
  fetchGyms: (adminId?: string, gymId?: string) => Promise<void>;
  gymsLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_USERS: User[] = [
  { id: "1", name: "Super Admin", email: "super@gym.com", role: Role.SUPER_ADMIN },
  { id: "2", name: "Elite Gym Admin", email: "admin@elite.com", role: Role.GYM_ADMIN, gymId: "g1" },
  { id: "3", name: "Elite Trainer Joe", email: "joe@elite.com", role: Role.EMPLOYEE, gymId: "g1" },
];

const INITIAL_GYMS: Gym[] = [
  {
    id: "g1",
    name: "Elite Fitness Center",
    location: "Downtown",
    adminId: "2",
    createdAt: new Date().toISOString(),
  },
  // You can add more mock gyms here later
];

const INITIAL_PLANS: MembershipPlan[] = [
  { id: "p1", gymId: "g1", name: "Monthly Basic", durationMonths: 1, price: 1500 },
  { id: "p2", gymId: "g1", name: "Quarterly Pro", durationMonths: 3, price: 4000 },
  { id: "p3", gymId: "g1", name: "Annual Beast", durationMonths: 12, price: 12000 },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [gyms, setGyms] = useState<Gym[]>(INITIAL_GYMS);
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>(INITIAL_PLANS);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [gymsLoading, setGymsLoading] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, description?: string, type: "success" | "error" | "info" = "info") => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  const fetchGyms = useCallback(
    async (adminId?: string, gymId?: string) => {
      setGymsLoading(true);
      try {
        const params = new URLSearchParams();
        if (adminId) params.set("adminId", adminId);
        if (gymId) params.set("gymId", gymId);

        const url = `/api/enrollGym${params.size > 0 ? `?${params.toString()}` : ""}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch gyms");
        }

        setGyms(data.data || []);
      } catch (error) {
        console.error("Fetch gyms error:", error);
        showToast("Error", "Failed to load gyms", "error");
      } finally {
        setGymsLoading(false);
      }
    },
    [showToast]
  );

  // Fetch gyms when currentUser changes (login / logout / role change)
  useEffect(() => {
    if (!currentUser) {
      setGyms([]);
      return;
    }

    if (currentUser.role === Role.SUPER_ADMIN) {
      fetchGyms(); // get all gyms
    } else if (currentUser.role === Role.GYM_ADMIN && currentUser.id) {
      fetchGyms(currentUser.id); // only gyms where adminId matches
    }
  }, [currentUser, fetchGyms]);

  const login = (email: string) => {
    const user = users.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      showToast("Welcome back!", `Logged in as ${user.name}`, "success");
    } else {
      showToast("Login failed", "User not found", "error");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    showToast("Logged out", "You have been securely signed out.", "info");
  };

  const addUser = (user: Partial<User>) => {
    const newUser = { ...user, id: Math.random().toString(36).slice(2, 11) } as User;
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const addGym = (gym: Partial<Gym>) => {
    const newGym = {
      ...gym,
      id: Math.random().toString(36).slice(2, 11),
      createdAt: new Date().toISOString(),
    } as Gym;
    setGyms((prev) => [...prev, newGym]);

    if (gym.adminId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === gym.adminId ? { ...u, gymId: newGym.id } : u))
      );
    }

    showToast("Gym Registered", `Successfully created ${newGym.name}`, "success");
  };

  const addStudent = (student: Partial<Student>) => {
    const newStudent = {
      ...student,
      id: Math.random().toString(36).slice(2, 11),
      status: "ACTIVE",
    } as Student;
    setStudents((prev) => [...prev, newStudent]);
    showToast("Student Added", `${newStudent.fullName ?? "New student"} is now a member.`, "success");
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast("Student Updated", "Changes saved successfully.", "success");
  };

  const addPlan = (plan: Partial<MembershipPlan>) => {
    const newPlan = { ...plan, id: Math.random().toString(36).slice(2, 11) } as MembershipPlan;
    setPlans((prev) => [...prev, newPlan]);
    showToast("Plan Created", `${newPlan.name} is now available.`, "success");
  };

  const addPayment = (payment: Partial<PaymentRecord>) => {
    const newPayment = { ...payment, id: Math.random().toString(36).slice(2, 11) } as PaymentRecord;
    setPayments((prev) => [...prev, newPayment]);
    showToast("Payment Recorded", `₹${newPayment.amountPaid ?? 0} collected successfully.`, "success");
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    showToast("Plan Deleted", "The plan has been removed.", "info");
  };

  const getStudentBalance = (studentId: string) => {
    const studentPayments = payments.filter((p) => p.studentId === studentId);
    if (studentPayments.length === 0) return 0;

    const sorted = [...studentPayments].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
    return sorted[0].pendingAmount ?? 0;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        gyms,
        students,
        plans,
        payments,
        toasts,
        login,
        logout,
        addUser,
        addGym,
        addStudent,
        updateStudent,
        addPlan,
        addPayment,
        deletePlan,
        showToast,
        removeToast,
        getStudentBalance,
        fetchGyms,
        gymsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};