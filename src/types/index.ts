type UserRole = "client" | "admin";

type User = {
  id: string; 
  email: string; 
  firstName: string; 
  lastName: string; 
  role: UserRole;
  createdAt: string; 
};

type Credential = {
  email: string;
  password: string;
};

type AccountType = "checking" | "savings";

type AccountStatus = "active" | "frozen" | "closed";

type Account = {
  id: string;
  userId: string;
  label: string;
  type: AccountType;
  balance: number;
  currency: "MAD" | "USD" | "EUR";
  status: AccountStatus;
  createdAt: string;
};

type TransactionType =
  | "transfer"
  | "deposit"
  | "withdrawal"
  | "payment";

type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "housing"
  | "salary"
  | "health"
  | "entertainment"
  | "utilities"
  | "other";

type Transaction = {
  id: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  currency: "MAD" | "USD" | "EUR";
  type: TransactionType;
  category: TransactionCategory;
  label: string;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
  completedAt: string | null;
};

type AuthResponse = {
  token: string
  user: User
}

type TransferRequest = {
  fromAccountId: string
  toAccountId: string
  amount: number
  label: string
  category: TransactionCategory
}

type DepositRequest = {
  toAccountId: string
  amount: number
  label: string
  category: TransactionCategory
}

type SpendingByCategory = {
  category: TransactionCategory
  total: number
  percentage: number
}

type AnalyticsResponse = {
  accountId: string
  period: string
  totalSpent: number
  totalIncome: number
  breakdown: SpendingByCategory[]
}

export type { User, UserRole, Credential, Account, AccountType, AccountStatus, Transaction, TransactionType, TransactionStatus, TransactionCategory, AuthResponse, TransferRequest, DepositRequest, AnalyticsResponse };
