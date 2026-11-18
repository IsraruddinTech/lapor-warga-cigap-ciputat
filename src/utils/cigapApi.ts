import {
  ReportItem,
  ReportNotification,
  ReportPhoto,
  ReportStatus,
  UrgencyLevel,
  UserFeedback,
} from '../types';

export type CreateReportPayload = Omit<ReportItem, 'id'> & { id?: string };

export class ApiHttpError extends Error {
  status: number;
  retryAfterSeconds?: number;
  remainingAttempts?: number;

  constructor(
    message: string,
    status: number,
    options?: { retryAfterSeconds?: number; remainingAttempts?: number }
  ) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    this.retryAfterSeconds = options?.retryAfterSeconds;
    this.remainingAttempts = options?.remainingAttempts;
  }
}

export function isAdminAuthError(err: unknown): boolean {
  return err instanceof ApiHttpError && (err.status === 401 || err.status === 403);
}

// Disimpan eksklusif di memori JavaScript runtime (tidak pernah di localStorage/sessionStorage)
let inMemoryCsrfToken: string | null = null;

export function clearAdminCsrfToken(): void {
  inMemoryCsrfToken = null;
}

function getCsrfHeaders(): Record<string, string> {
  return inMemoryCsrfToken ? { 'X-CSRF-Token': inMemoryCsrfToken } : {};
}

async function parseErrorResponse(
  res: Response,
  fallbackMessage: string
): Promise<ApiHttpError> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawText = await res.text().catch(() => '');

  let errBody: {
    error?: string;
    retryAfterSeconds?: number;
    remainingAttempts?: number;
  } = {};

  if (rawText) {
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === 'object') {
        errBody = parsed as typeof errBody;
      }
    } catch {
      // Response bukan JSON (mis. text/plain Vercel FUNCTION_INVOCATION_FAILED atau HTML)
    }
  }

  if (res.status === 401 || res.status === 403) {
    inMemoryCsrfToken = null;
  }

  let resolvedMessage = errBody.error;
  if (!resolvedMessage) {
    if (res.status === 404) {
      resolvedMessage =
        'Endpoint API autentikasi petugas tidak ditemukan (404). Periksa konfigurasi routing API pada server.';
    } else if (res.status === 503) {
      resolvedMessage =
        'Layanan autentikasi petugas tidak tersedia (503). Periksa environment variable server.';
    } else if (res.status >= 500) {
      if (rawText.includes('FUNCTION_INVOCATION_FAILED')) {
        resolvedMessage =
          'Serverless function autentikasi mengalami gangguan runtime (500 FUNCTION_INVOCATION_FAILED).';
      } else {
        resolvedMessage = `Server autentikasi mengalami gangguan internal (HTTP ${res.status}).`;
      }
    } else if (contentType.includes('text/html')) {
      resolvedMessage = `Permintaan API mengembalikan HTML alih-alih JSON (HTTP ${res.status}). Periksa rewrite routing deployment.`;
    } else {
      resolvedMessage = fallbackMessage;
    }
  }

  return new ApiHttpError(resolvedMessage, res.status, {
    retryAfterSeconds: errBody.retryAfterSeconds,
    remainingAttempts: errBody.remainingAttempts,
  });
}

async function parseJsonSuccess<T>(res: Response, invalidJsonMessage: string): Promise<T> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawText = await res.text();
  if (!contentType.includes('application/json')) {
    throw new ApiHttpError(invalidJsonMessage, 502);
  }
  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new ApiHttpError(invalidJsonMessage, 502);
  }
}

export interface AdminSessionStatusResponse {
  authenticated: boolean;
  expiresAt?: string;
  csrfToken?: string;
}

export async function loginAdminOnServer(
  passcode: string
): Promise<AdminSessionStatusResponse> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Verifikasi PIN petugas gagal.');
  }
  const data = await parseJsonSuccess<AdminSessionStatusResponse>(
    res,
    'Endpoint /api/admin/login tidak mengembalikan respons JSON yang valid (kemungkinan routing API mengarah ke index.html).'
  );
  inMemoryCsrfToken = data.csrfToken || null;
  return data;
}

export async function fetchAdminSession(): Promise<AdminSessionStatusResponse> {
  const res = await fetch('/api/admin/session', {
    method: 'GET',
    credentials: 'same-origin',
  });
  if (!res.ok) {
    inMemoryCsrfToken = null;
    return { authenticated: false };
  }
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    inMemoryCsrfToken = null;
    return { authenticated: false };
  }
  const data = (await res.json()) as AdminSessionStatusResponse;
  inMemoryCsrfToken = data.authenticated && data.csrfToken ? data.csrfToken : null;
  return data;
}

export async function logoutAdminOnServer(): Promise<void> {
  const res = await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      ...getCsrfHeaders(),
    },
  });
  inMemoryCsrfToken = null;
  if (!res.ok && res.status !== 401) {
    throw await parseErrorResponse(res, 'Gagal mengakhiri sesi petugas.');
  }
}

export interface ReportsSyncResponse {
  reports: ReportItem[];
  notifications: ReportNotification[];
  updatedAt: string;
}

export async function fetchAllReportsAndNotifications(): Promise<ReportsSyncResponse> {
  const res = await fetch('/api/reports', {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, `Gagal memuat data pengaduan (${res.status})`);
  }
  return res.json();
}

export async function fetchReportDetailById(
  reportId: string
): Promise<{ report: ReportItem; notifications: ReportNotification[] }> {
  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, `Gagal mengambil detail laporan #${reportId}`);
  }
  return res.json();
}

export async function uploadReportPhoto(
  dataUrl: string,
  caption?: string
): Promise<ReportPhoto> {
  const res = await fetch('/api/uploads', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, caption }),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal mengunggah foto ke server.');
  }
  return res.json();
}

export async function uploadAdminPhoto(
  dataUrl: string,
  caption?: string
): Promise<ReportPhoto> {
  const res = await fetch('/api/admin/uploads', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    body: JSON.stringify({ dataUrl, caption }),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal mengunggah foto hasil petugas ke server.');
  }
  return res.json();
}

export async function createReportOnServer(
  newReport: CreateReportPayload
): Promise<{ report: ReportItem; notification: ReportNotification }> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newReport),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, `Gagal menyimpan laporan baru (${res.status}).`);
  }
  return res.json();
}

export interface UpdateStatusPayload {
  status: ReportStatus;
  adminNote?: string;
  assignedDepartment?: string;
  officerName?: string;
  resolvedPhotoUrl?: string;
  estimatedCompletionDate?: string;
  isDelayed?: boolean;
  delayReason?: string;
  rejectionReason?: string;
  urgency?: UrgencyLevel | null;
  priorityReason?: string;
}

export async function updateReportStatusOnServer(
  reportId: string,
  payload: UpdateStatusPayload
): Promise<{ report: ReportItem; notifications: ReportNotification[] }> {
  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/status`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal memperbarui status laporan.');
  }
  return res.json();
}

export async function updateReportOnServer(
  updatedReport: ReportItem
): Promise<{ report: ReportItem }> {
  const res = await fetch(`/api/reports/${encodeURIComponent(updatedReport.id)}`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...getCsrfHeaders(),
    },
    body: JSON.stringify(updatedReport),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal memperbarui data laporan.');
  }
  return res.json();
}

export async function deleteReportOnServer(reportId: string): Promise<void> {
  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: {
      ...getCsrfHeaders(),
    },
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal menghapus laporan.');
  }
}

export async function upvoteReportOnServer(reportId: string): Promise<{ report: ReportItem }> {
  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/upvote`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal memberikan dukungan.');
  }
  return res.json();
}

export async function submitFeedbackOnServer(
  reportId: string,
  feedback: UserFeedback
): Promise<{ report: ReportItem }> {
  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/feedback`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal mengirim ulasan.');
  }
  return res.json();
}

export async function resetReportsOnServer(): Promise<ReportsSyncResponse> {
  const res = await fetch('/api/reports/reset', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      ...getCsrfHeaders(),
    },
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal mereset data.');
  }
  return res.json();
}

export async function markNotificationReadOnServer(
  notificationId: string
): Promise<{ notifications: ReportNotification[] }> {
  const res = await fetch(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {
      ...getCsrfHeaders(),
    },
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal menandai notifikasi telah dibaca.');
  }
  return res.json();
}

export async function markAllNotificationsReadOnServer(): Promise<{
  notifications: ReportNotification[];
}> {
  const res = await fetch('/api/notifications/read-all', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {
      ...getCsrfHeaders(),
    },
  });
  if (!res.ok) {
    throw await parseErrorResponse(res, 'Gagal menandai semua notifikasi.');
  }
  return res.json();
}
