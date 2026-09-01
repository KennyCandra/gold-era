export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FileItem = {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  extractedContent?: string | null;
  ownerId: string;
  owner?: Pick<User, "id" | "name" | "email">;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type UserStats = {
  totalFiles: number;
  totalSize: number;
  filesByType: { type: string; count: number }[];
  uploadsOverTime: { date: string; count: number }[];
};

export type AdminStats = {
  totalUsers: number;
  totalFiles: number;
  totalSize: number;
  verifiedUsers: number;
  pendingUsers: number;
  filesByType: { type: string; count: number }[];
  uploadsOverTime: { date: string; count: number }[];
  usersByRole: { role: Role; count: number }[];
};

export type SortOrder = "asc" | "desc";

export type ListQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
};

export type ApiError = {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
};
