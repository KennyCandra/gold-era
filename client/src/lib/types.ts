export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  fileCount?: number;
};

export type FileItem = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  userId: string;
  updatedAt?: string;
  content?: string | null;
  user?: Pick<User, "id" | "name" | "email">;
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

export type StatsByType = { mimeType: string; count: number; size: number };

export type UploadHistoryPoint = { day: string; count: number };

export type UserStats = {
  totalFiles: number;
  storageUsed: number;
  byType: StatsByType[];
  uploadHistory: UploadHistoryPoint[];
};

export type AdminStats = {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  totalFiles: number;
  storageUsed: number;
  storageOnDisk: number;
  deletedFiles: number;
  byType: StatsByType[];
  recentUploads: FileItem[];
  uploadHistory: UploadHistoryPoint[];
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
