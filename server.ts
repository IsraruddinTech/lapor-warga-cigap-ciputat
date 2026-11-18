import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { INITIAL_NOTIFICATIONS, INITIAL_REPORTS, STATUS_LABELS } from './src/data/mockReports.ts';
import type {
  PriorityHistoryEntry,
  ReportItem,
  ReportNotification,
  ReportPhoto,
  ReportStatus,
  ReportTimelineStep,
  UrgencyLevel,
  UserFeedback,
} from './src/types.ts';

interface CigapDatabase {
  reports: ReportItem[];
  notifications: ReportNotification[];
  lastSequenceByYear?: Record<string, number>;
  updatedAt: string;
}

interface StoredAdminSession {
  sessionIdHash: string;
  csrfTokenHash: string;
  createdAtMs: number;
  expiresAtMs: number;
}

interface LoginAttemptRecord {
  failures: number;
  windowStartMs: number;
  lockedUntilMs: number;
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = process.cwd();
const DATA_DIR =
  process.env.CIGAP_DATA_DIR ||
  (IS_VERCEL ? path.join('/tmp', 'cigap-data') : path.join(ROOT_DIR, 'data'));
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'cigap-db.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'cigap-sessions.json');
const ADMIN_SESSION_COOKIE = 'cigap_admin_session';
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 jam
const LOGIN_MAX_FAILURES = 5;
const LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 menit
const LOGIN_LOCKOUT_MS = 5 * 60 * 1000; // 5 menit

const BULAN_SHORT_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatWibNow(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
    const day = get('day');
    const monthIdx = Math.max(0, Number(get('month')) - 1);
    const year = get('year');
    const hour = get('hour');
    const minute = get('minute');
    return `${day} ${BULAN_SHORT_ID[monthIdx]} ${year}, ${hour}:${minute} WIB`;
  } catch {
    return `${date.getDate()} ${BULAN_SHORT_ID[date.getMonth()]} ${date.getFullYear()} WIB`;
  }
}

function ensureDirectories(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function normalizeReport(r: ReportItem): ReportItem {
  const photos: ReportPhoto[] =
    Array.isArray(r.photos) && r.photos.length > 0
      ? r.photos
      : r.photoUrl && r.photoUrl.trim() !== ''
      ? [{ id: `ph-${r.id}`, url: r.photoUrl, uploadedAt: r.createdAt }]
      : [];

  return {
    ...r,
    photos,
    photoUrl: photos[0]?.url || r.photoUrl || '',
    updatedAt: r.updatedAt || r.createdAt,
  };
}

function getWibYear(date: Date = new Date()): string {
  try {
    const yearStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
    }).format(date);
    const parsed = Number(yearStr);
    if (Number.isInteger(parsed) && parsed >= 2020) {
      return String(parsed);
    }
  } catch {
    // fallback below
  }
  return String(date.getFullYear());
}

function computeMaxSequenceByYear(
  reports: ReportItem[],
  existingMap?: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = { ...(existingMap || {}) };
  for (const r of reports) {
    if (!r?.id) continue;
    const match = r.id.match(/^CPT-(\d{4})-(\d+)$/);
    if (match) {
      const yr = match[1];
      const seq = Number(match[2]);
      if (Number.isFinite(seq) && seq > (result[yr] || 0)) {
        result[yr] = seq;
      }
    }
  }
  return result;
}

function generateUniqueReportId(database: CigapDatabase, now: Date = new Date()): string {
  const year = getWibYear(now);
  const seqMap = computeMaxSequenceByYear(database.reports, database.lastSequenceByYear);
  let nextSeq = (seqMap[year] || 0) + 1;
  const existingIds = new Set(database.reports.map((r) => r.id));

  let candidate = `CPT-${year}-${String(nextSeq).padStart(3, '0')}`;
  while (existingIds.has(candidate)) {
    nextSeq += 1;
    candidate = `CPT-${year}-${String(nextSeq).padStart(3, '0')}`;
  }

  database.lastSequenceByYear = {
    ...seqMap,
    [year]: nextSeq,
  };

  return candidate;
}

// Single-process write queue / mutex to serialize all critical DB read-modify-write operations
let dbWriteQueue: Promise<void> = Promise.resolve();

function withDatabaseWriteLock<T>(task: () => Promise<T> | T): Promise<T> {
  const run = dbWriteQueue.then(() => task());
  dbWriteQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function hashSecretToken(raw: string): string {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

function timingSafeMatchString(candidate: string, expected: string): boolean {
  const candidateDigest = crypto.createHash('sha256').update(candidate, 'utf8').digest();
  const expectedDigest = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(candidateDigest, expectedDigest);
}

function getConfiguredAdminPasscodes(): string[] {
  const list = [
    process.env.CIGAP_ADMIN_PASSCODE,
    process.env.CIGAP_ADMIN_BACKUP_PASSCODE,
  ]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);
  return list;
}

function verifyAdminPasscode(inputPasscode: string): { configured: boolean; valid: boolean } {
  const configuredPasscodes = getConfiguredAdminPasscodes();
  if (configuredPasscodes.length === 0) {
    return { configured: false, valid: false };
  }

  let matched = false;
  for (const expected of configuredPasscodes) {
    if (timingSafeMatchString(inputPasscode, expected)) {
      matched = true;
    }
  }
  return { configured: true, valid: matched };
}

function loadSessionsFromDisk(): Map<string, StoredAdminSession> {
  ensureDirectories();
  const now = Date.now();
  const map = new Map<string, StoredAdminSession>();
  if (!fs.existsSync(SESSIONS_FILE)) {
    return map;
  }

  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as { sessions?: StoredAdminSession[] };
    if (Array.isArray(parsed.sessions)) {
      for (const s of parsed.sessions) {
        if (
          s &&
          typeof s.sessionIdHash === 'string' &&
          typeof s.csrfTokenHash === 'string' &&
          typeof s.expiresAtMs === 'number' &&
          s.expiresAtMs > now
        ) {
          map.set(s.sessionIdHash, s);
        }
      }
    }
  } catch {
    // Ignore corrupted session cache and start fresh
  }
  return map;
}

function saveSessionsAtomic(sessionsMap: Map<string, StoredAdminSession>): void {
  ensureDirectories();
  const now = Date.now();
  const activeSessions: StoredAdminSession[] = [];
  for (const [key, session] of sessionsMap.entries()) {
    if (session.expiresAtMs > now) {
      activeSessions.push(session);
    } else {
      sessionsMap.delete(key);
    }
  }

  const serialized = JSON.stringify({ sessions: activeSessions }, null, 2);
  const tmpFile = path.join(
    DATA_DIR,
    `cigap-sessions.json.tmp-${process.pid}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  );

  let fd: number | null = null;
  try {
    fd = fs.openSync(tmpFile, 'w');
    fs.writeFileSync(fd, serialized, 'utf-8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;
    fs.renameSync(tmpFile, SESSIONS_FILE);
  } catch (err) {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch {
      // ignore
    }
    throw err;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header || typeof header !== 'string') return {};
  const cookies: Record<string, string> = {};
  for (const part of header.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const rawVal = part.slice(eqIdx + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(rawVal);
    } catch {
      cookies[key] = rawVal;
    }
  }
  return cookies;
}

function isHttpsRequest(req: Request): boolean {
  if (req.secure) return true;
  const xfProto = req.header('x-forwarded-proto');
  if (typeof xfProto === 'string') {
    const firstProto = xfProto.split(',')[0].trim().toLowerCase();
    if (firstProto === 'https') return true;
  }
  return false;
}

function buildAdminSessionCookieHeader(
  rawSessionId: string,
  isHttps: boolean,
  clear = false
): string {
  const maxAge = clear ? 0 : Math.floor(SESSION_TTL_MS / 1000);
  const attrs = ['HttpOnly', 'Path=/', `Max-Age=${maxAge}`];
  if (isHttps) {
    if (IS_VERCEL) {
      // Same-origin HTTPS deployment on Vercel: SameSite=Lax; Secure avoids third-party/CHIPS restrictions
      attrs.push('Secure', 'SameSite=Lax');
    } else {
      // Cloud Run / AI Studio cross-site HTTPS iframe preview requires SameSite=None; Secure (+ Partitioned CHIPS)
      attrs.push('Secure', 'SameSite=None', 'Partitioned');
    }
  } else {
    // Local HTTP development: never set SameSite=None without Secure
    attrs.push('SameSite=Lax');
  }
  const encodedVal = clear ? '' : encodeURIComponent(rawSessionId);
  return `${ADMIN_SESSION_COOKIE}=${encodedVal}; ${attrs.join('; ')}`;
}

function getAllowedOrigins(req: Request): Set<string> {
  const allowed = new Set<string>();
  const proto = isHttpsRequest(req) ? 'https' : 'http';

  const host = req.get('host');
  if (host) {
    allowed.add(`${proto}://${host.trim()}`);
  }

  const xfHost = req.header('x-forwarded-host');
  if (typeof xfHost === 'string' && xfHost.trim() !== '') {
    const firstHost = xfHost.split(',')[0].trim();
    if (firstHost) {
      allowed.add(`${proto}://${firstHost}`);
    }
  }

  for (const vercelHost of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    const trimmed = typeof vercelHost === 'string' ? vercelHost.trim() : '';
    if (!trimmed) continue;
    const candidate =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    try {
      allowed.add(new URL(candidate).origin);
    } catch {
      // ignore invalid URL entries
    }
  }

  const extra = [process.env.APP_URL, ...(process.env.CIGAP_ALLOWED_ORIGINS || '').split(',')];
  for (const item of extra) {
    const trimmed = typeof item === 'string' ? item.trim() : '';
    if (!trimmed) continue;
    try {
      allowed.add(new URL(trimmed).origin);
    } catch {
      // ignore invalid URL entries
    }
  }
  return allowed;
}

function isAllowedOrigin(req: Request): boolean {
  const allowedOrigins = getAllowedOrigins(req);
  const originHeader = req.header('origin');
  if (typeof originHeader === 'string' && originHeader.trim() !== '') {
    return allowedOrigins.has(originHeader.trim());
  }

  const refererHeader = req.header('referer');
  if (typeof refererHeader === 'string' && refererHeader.trim() !== '') {
    try {
      const refOrigin = new URL(refererHeader).origin;
      return allowedOrigins.has(refOrigin);
    } catch {
      return false;
    }
  }

  // No Origin/Referer header present (e.g., direct same-origin CLI or non-browser client);
  // state-changing admin routes still enforce X-CSRF-Token tied to the HttpOnly session.
  return true;
}

function getClientIp(req: Request): string {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function maskPublicReporterName(name?: string, isAnonymous?: boolean): string {
  if (isAnonymous) return 'Warga Anonim';
  const cleaned = (name || '').trim();
  if (!cleaned || cleaned.toLowerCase().includes('warga')) {
    return cleaned || 'Warga Ciputat';
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const word = parts[0];
    return word.length <= 2 ? `${word[0]}*` : `${word[0]}${'*'.repeat(Math.min(word.length - 1, 4))}`;
  }
  return parts
    .map((word) =>
      word.length <= 2 ? `${word[0]}*` : `${word[0]}${'*'.repeat(Math.min(word.length - 1, 3))}`
    )
    .join(' ');
}

function sanitizePublicAdminNotes(note: string | undefined, status: ReportStatus): string | undefined {
  if (!note) return undefined;
  const trimmed = note.trim();
  if (!trimmed) return undefined;

  const isInternalAuditText =
    trimmed.startsWith('PERINGATAN SISTEM:') ||
    trimmed.includes('Skor Keaslian') ||
    trimmed.includes('Skor Validitas') ||
    trimmed.includes('audit posko') ||
    trimmed.includes('DITOLAK OLEH SISTEM & PETUGAS');

  if (isInternalAuditText) {
    return status === 'ditolak'
      ? 'Laporan tidak memenuhi ketentuan verifikasi dan tidak dapat diproses.'
      : 'Laporan telah diterima dan sedang dalam antrean verifikasi petugas Posko CIGAP.';
  }
  return trimmed;
}

function sanitizePublicReport(r: ReportItem): ReportItem {
  return {
    ...r,
    reporterName: maskPublicReporterName(r.reporterName, r.isAnonymous),
    reporterPhone: undefined,
    adminNotes: sanitizePublicAdminNotes(r.adminNotes, r.status),
    internalNotes: undefined,
    priorityUpdatedAt: undefined,
    priorityAssignedBy: undefined,
    priorityHistory: undefined,
    verification: undefined,
  };
}

function loadDatabase(): CigapDatabase {
  ensureDirectories();
  if (!fs.existsSync(DB_FILE)) {
    const initialReports = INITIAL_REPORTS.map(normalizeReport);
    const initial: CigapDatabase = {
      reports: initialReports,
      notifications: INITIAL_NOTIFICATIONS,
      lastSequenceByYear: computeMaxSequenceByYear(initialReports),
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<CigapDatabase>;
    const reports = Array.isArray(parsed.reports)
      ? parsed.reports.map(normalizeReport)
      : INITIAL_REPORTS.map(normalizeReport);
    const notifications = Array.isArray(parsed.notifications)
      ? parsed.notifications
      : INITIAL_NOTIFICATIONS;
    const lastSequenceByYear = computeMaxSequenceByYear(reports, parsed.lastSequenceByYear);
    return {
      reports,
      notifications,
      lastSequenceByYear,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to parse cigap-db.json, preserving recovery fallback:', err);
    const fallbackReports = INITIAL_REPORTS.map(normalizeReport);
    const fallback: CigapDatabase = {
      reports: fallbackReports,
      notifications: INITIAL_NOTIFICATIONS,
      lastSequenceByYear: computeMaxSequenceByYear(fallbackReports),
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(fallback);
    return fallback;
  }
}

function saveDatabase(database: CigapDatabase): void {
  ensureDirectories();
  database.updatedAt = new Date().toISOString();
  database.lastSequenceByYear = computeMaxSequenceByYear(
    database.reports,
    database.lastSequenceByYear
  );
  const serialized = JSON.stringify(database, null, 2);
  const tmpFile = path.join(
    DATA_DIR,
    `cigap-db.json.tmp-${process.pid}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  );

  let fd: number | null = null;
  try {
    fd = fs.openSync(tmpFile, 'w');
    fs.writeFileSync(fd, serialized, 'utf-8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore close error during cleanup
      }
    }
    try {
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    } catch {
      // ignore temp cleanup error
    }
    throw err;
  }
}

function saveBase64ImageToDisk(dataUrl: string, prefix = 'evidence'): string {
  ensureDirectories();
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    return dataUrl;
  }

  const mime = match[1].toLowerCase();
  const base64Data = match[2];
  let ext = 'jpg';
  if (mime.includes('png')) ext = 'png';
  else if (mime.includes('webp')) ext = 'webp';
  else if (mime.includes('gif')) ext = 'gif';

  const fileName = `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${fileName}`;
}

function persistInlineReportPhotos(report: ReportItem): ReportItem {
  let primaryPhotoUrl = report.photoUrl || '';
  if (primaryPhotoUrl.startsWith('data:image/')) {
    primaryPhotoUrl = saveBase64ImageToDisk(primaryPhotoUrl, `rep-${report.id}`);
  }

  let photos: ReportPhoto[] = Array.isArray(report.photos) ? [...report.photos] : [];
  photos = photos.map((p, idx) => {
    if (p.url && p.url.startsWith('data:image/')) {
      return {
        ...p,
        url: saveBase64ImageToDisk(p.url, `rep-${report.id}-${idx + 1}`),
      };
    }
    return p;
  });

  if (photos.length === 0 && primaryPhotoUrl) {
    photos = [
      {
        id: `ph-${report.id}-1`,
        url: primaryPhotoUrl,
        uploadedAt: report.createdAt,
      },
    ];
  } else if (photos.length > 0 && !primaryPhotoUrl) {
    primaryPhotoUrl = photos[0].url;
  }

  let resolvedPhotoUrl = report.resolvedPhotoUrl;
  if (resolvedPhotoUrl && resolvedPhotoUrl.startsWith('data:image/')) {
    resolvedPhotoUrl = saveBase64ImageToDisk(resolvedPhotoUrl, `resolved-${report.id}`);
  }

  return {
    ...report,
    photoUrl: primaryPhotoUrl,
    photos,
    resolvedPhotoUrl,
  };
}

function buildStatusNotificationMessage(
  status: ReportStatus,
  assignedDept?: string,
  rejectionReason?: string,
  isDelayed?: boolean
): { title: string; message: string; type: ReportNotification['type'] } {
  if (isDelayed && status !== 'selesai' && status !== 'ditolak') {
    return {
      title: 'Pembaruan Estimasi Penanganan',
      message: 'Penanganan membutuhkan waktu tambahan. Estimasi penyelesaian telah diperbarui.',
      type: 'delay',
    };
  }

  switch (status) {
    case 'diterima':
      return {
        title: 'Pengaduan Diterima',
        message: 'Pengaduan Anda berhasil diterima oleh sistem CiGap.',
        type: 'created',
      };
    case 'diverifikasi':
      return {
        title: 'Sedang Diverifikasi',
        message: 'Laporan Anda sedang dalam proses verifikasi oleh petugas.',
        type: 'status_update',
      };
    case 'dalam_peninjauan':
      return {
        title: 'Dalam Peninjauan Dinas',
        message: 'Laporan Anda sedang ditinjau oleh Dinas terkait.',
        type: 'status_update',
      };
    case 'diteruskan_ke_dinas':
      return {
        title: 'Diteruskan ke Dinas',
        message: `Laporan telah diteruskan kepada ${assignedDept || 'Dinas Teknis Terkait'}.`,
        type: 'status_update',
      };
    case 'tindak_lanjut':
      return {
        title: 'Petugas di Lokasi',
        message: 'Petugas sedang melakukan penanganan di lokasi.',
        type: 'status_update',
      };
    case 'menunggu_tindak_lanjut':
      return {
        title: 'Menunggu Tindak Lanjut',
        message: 'Pengaduan membutuhkan koordinasi atau material lanjutan dari dinas.',
        type: 'status_update',
      };
    case 'selesai':
      return {
        title: 'Penanganan Selesai',
        message: 'Penanganan laporan telah selesai. Silakan periksa hasil tindak lanjut.',
        type: 'resolved',
      };
    case 'ditolak':
      return {
        title: 'Laporan Ditolak',
        message: rejectionReason
          ? `Laporan tidak dapat diproses: ${rejectionReason}`
          : 'Laporan tidak dapat diproses oleh petugas verifikasi.',
        type: 'status_update',
      };
    default:
      return {
        title: 'Pembaruan Status Laporan',
        message: STATUS_LABELS[status]?.defaultNotifMessage || 'Status laporan Anda telah diperbarui.',
        type: 'status_update',
      };
  }
}

export function createCigapServerApp(): express.Express {
  ensureDirectories();
  let db = loadDatabase();
  const adminSessions = loadSessionsFromDisk();
  const loginAttempts = new Map<string, LoginAttemptRecord>();

  // Periodic cleanup of expired sessions & stale rate-limit records (long-running server only)
  if (!IS_VERCEL) {
    setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [hash, sess] of adminSessions.entries()) {
        if (sess.expiresAtMs <= now) {
          adminSessions.delete(hash);
          changed = true;
        }
      }
      if (changed) {
        try {
          saveSessionsAtomic(adminSessions);
        } catch {
          // ignore cleanup error
        }
      }
      for (const [ip, rec] of loginAttempts.entries()) {
        if (rec.lockedUntilMs <= now && now - rec.windowStartMs > LOGIN_WINDOW_MS) {
          loginAttempts.delete(ip);
        }
      }
    }, 10 * 60 * 1000).unref();
  }

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '30mb' }));

  const getValidAdminSession = (req: Request): StoredAdminSession | null => {
    const cookies = parseCookies(req);
    const rawSessionId = cookies[ADMIN_SESSION_COOKIE];
    if (!rawSessionId) return null;

    const sessionHash = hashSecretToken(rawSessionId);
    let existing = adminSessions.get(sessionHash);
    if (!existing) {
      const diskSessions = loadSessionsFromDisk();
      const fromDisk = diskSessions.get(sessionHash);
      if (fromDisk) {
        adminSessions.set(sessionHash, fromDisk);
        existing = fromDisk;
      }
    }
    if (!existing) return null;

    if (existing.expiresAtMs <= Date.now()) {
      adminSessions.delete(sessionHash);
      try {
        saveSessionsAtomic(adminSessions);
      } catch {
        // ignore
      }
      return null;
    }

    return existing;
  };

  const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
    const session = getValidAdminSession(req);
    if (!session) {
      const cookies = parseCookies(req);
      if (cookies[ADMIN_SESSION_COOKIE]) {
        res.setHeader(
          'Set-Cookie',
          buildAdminSessionCookieHeader('', isHttpsRequest(req), true)
        );
      }
      res.status(401).json({
        error: 'Sesi petugas tidak valid atau telah kedaluwarsa. Silakan masukkan PIN petugas kembali.',
      });
      return;
    }

    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
    if (isMutating) {
      if (!isAllowedOrigin(req)) {
        res.status(403).json({ error: 'Origin permintaan tidak diizinkan.' });
        return;
      }

      const csrfHeader = req.header('x-csrf-token');
      if (
        typeof csrfHeader !== 'string' ||
        !csrfHeader.trim() ||
        !timingSafeMatchString(hashSecretToken(csrfHeader.trim()), session.csrfTokenHash)
      ) {
        res.status(403).json({
          error: 'Token keamanan CSRF tidak valid. Muat ulang halaman dan coba lagi.',
        });
        return;
      }
    }

    next();
  };

  // Serve uploaded real evidence photos
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

  // SSE Clients for real-time updates
  const sseClients = new Set<Response>();

  const broadcastEvent = (eventName: string, payload: unknown) => {
    const data = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(data);
      } catch {
        sseClients.delete(client);
      }
    }
  };

  // Real-time SSE endpoint
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, timestamp: new Date().toISOString() })}\n\n`);
    sseClients.add(res);

    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // Admin Authentication Endpoints
  app.post('/api/admin/login', (req: Request, res: Response) => {
    if (!isAllowedOrigin(req)) {
      res.status(403).json({ error: 'Origin permintaan login tidak diizinkan.' });
      return;
    }

    const clientIp = getClientIp(req);
    const now = Date.now();
    const existingAttempt = loginAttempts.get(clientIp);

    if (existingAttempt && existingAttempt.lockedUntilMs > now) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existingAttempt.lockedUntilMs - now) / 1000)
      );
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: `Terlalu banyak percobaan login gagal. Tunggu ${retryAfterSeconds} detik sebelum mencoba lagi.`,
        retryAfterSeconds,
      });
      return;
    }

    const body = req.body as { passcode?: unknown };
    const passcode = typeof body?.passcode === 'string' ? body.passcode.trim() : '';

    const verification = verifyAdminPasscode(passcode);
    if (!verification.configured) {
      console.error('Admin login rejected: CIGAP_ADMIN_PASSCODE environment variable is not configured.');
      res.status(503).json({
        error: 'Layanan autentikasi petugas belum dikonfigurasi pada server (CIGAP_ADMIN_PASSCODE belum diset).',
      });
      return;
    }

    if (!/^\d{6}$/.test(passcode)) {
      res.status(400).json({
        error: 'Format PIN petugas harus berupa 6 digit angka.',
      });
      return;
    }

    if (!verification.valid) {
      let failures = 1;
      let windowStartMs = now;

      if (existingAttempt && now - existingAttempt.windowStartMs <= LOGIN_WINDOW_MS) {
        failures = existingAttempt.failures + 1;
        windowStartMs = existingAttempt.windowStartMs;
      }

      if (failures >= LOGIN_MAX_FAILURES) {
        const lockedUntilMs = now + LOGIN_LOCKOUT_MS;
        loginAttempts.set(clientIp, { failures, windowStartMs, lockedUntilMs });
        const retryAfterSeconds = Math.ceil(LOGIN_LOCKOUT_MS / 1000);
        res.setHeader('Retry-After', String(retryAfterSeconds));
        res.status(429).json({
          error: `Terlalu banyak percobaan login gagal. Sistem dikunci selama ${retryAfterSeconds} detik.`,
          retryAfterSeconds,
        });
        return;
      }

      loginAttempts.set(clientIp, { failures, windowStartMs, lockedUntilMs: 0 });
      const remainingAttempts = LOGIN_MAX_FAILURES - failures;
      res.status(401).json({
        error: `PIN petugas tidak valid (${remainingAttempts} kesempatan tersisa).`,
        remainingAttempts,
      });
      return;
    }

    // Valid PIN: clear rate-limit tracker for this IP
    loginAttempts.delete(clientIp);

    const rawSessionId = crypto.randomBytes(32).toString('hex');
    const rawCsrfToken = crypto.randomBytes(32).toString('hex');
    const expiresAtMs = now + SESSION_TTL_MS;

    const sessionRecord: StoredAdminSession = {
      sessionIdHash: hashSecretToken(rawSessionId),
      csrfTokenHash: hashSecretToken(rawCsrfToken),
      createdAtMs: now,
      expiresAtMs,
    };

    adminSessions.set(sessionRecord.sessionIdHash, sessionRecord);
    try {
      saveSessionsAtomic(adminSessions);
    } catch (err) {
      console.error('Failed to persist admin session:', err);
      res.status(500).json({ error: 'Gagal membuat sesi petugas.' });
      return;
    }

    res.setHeader(
      'Set-Cookie',
      buildAdminSessionCookieHeader(rawSessionId, isHttpsRequest(req), false)
    );
    res.json({
      authenticated: true,
      expiresAt: new Date(expiresAtMs).toISOString(),
      csrfToken: rawCsrfToken,
    });
  });

  app.get('/api/admin/session', (req: Request, res: Response) => {
    const session = getValidAdminSession(req);
    if (!session) {
      const cookies = parseCookies(req);
      if (cookies[ADMIN_SESSION_COOKIE]) {
        res.setHeader(
          'Set-Cookie',
          buildAdminSessionCookieHeader('', isHttpsRequest(req), true)
        );
      }
      res.json({ authenticated: false });
      return;
    }

    // Rotate CSRF token on session check so reloads receive a fresh in-memory CSRF token
    const freshCsrfToken = crypto.randomBytes(32).toString('hex');
    session.csrfTokenHash = hashSecretToken(freshCsrfToken);
    adminSessions.set(session.sessionIdHash, session);
    try {
      saveSessionsAtomic(adminSessions);
    } catch {
      // keep in-memory session active even if disk sync warns
    }

    res.json({
      authenticated: true,
      expiresAt: new Date(session.expiresAtMs).toISOString(),
      csrfToken: freshCsrfToken,
    });
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    if (!isAllowedOrigin(req)) {
      res.status(403).json({ error: 'Origin permintaan logout tidak diizinkan.' });
      return;
    }

    const cookies = parseCookies(req);
    const rawSessionId = cookies[ADMIN_SESSION_COOKIE];
    const activeSession = getValidAdminSession(req);

    if (activeSession) {
      // Active session requires valid CSRF token to prevent forced logout via CSRF
      const csrfHeader = req.header('x-csrf-token');
      if (
        typeof csrfHeader !== 'string' ||
        !csrfHeader.trim() ||
        !timingSafeMatchString(hashSecretToken(csrfHeader.trim()), activeSession.csrfTokenHash)
      ) {
        res.status(403).json({ error: 'Token keamanan CSRF logout tidak valid.' });
        return;
      }
    }

    if (rawSessionId) {
      const sessionHash = hashSecretToken(rawSessionId);
      if (adminSessions.delete(sessionHash)) {
        try {
          saveSessionsAtomic(adminSessions);
        } catch {
          // ignore
        }
      }
    }

    res.setHeader(
      'Set-Cookie',
      buildAdminSessionCookieHeader('', isHttpsRequest(req), true)
    );
    res.json({ ok: true });
  });

  // Upload image file for citizen report evidence (public)
  app.post('/api/uploads', (req: Request, res: Response) => {
    try {
      const { dataUrl, caption } = req.body as { dataUrl?: string; caption?: string };
      if (
        !dataUrl ||
        typeof dataUrl !== 'string' ||
        !/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(dataUrl)
      ) {
        res.status(400).json({ error: 'Format gambar tidak valid. Gunakan file JPG, PNG, WEBP, atau GIF.' });
        return;
      }
      const url = saveBase64ImageToDisk(dataUrl, 'citizen-evidence');
      res.status(201).json({
        id: `ph-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        url,
        caption: caption?.trim() || undefined,
        uploadedAt: formatWibNow(),
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Gagal menyimpan foto bukti ke server.' });
    }
  });

  // Upload image file for officer resolution/edit evidence (admin-protected)
  app.post('/api/admin/uploads', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { dataUrl, caption } = req.body as { dataUrl?: string; caption?: string };
      if (
        !dataUrl ||
        typeof dataUrl !== 'string' ||
        !/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(dataUrl)
      ) {
        res.status(400).json({ error: 'Format gambar tidak valid. Gunakan file JPG, PNG, WEBP, atau GIF.' });
        return;
      }
      const url = saveBase64ImageToDisk(dataUrl, 'officer-resolved');
      res.status(201).json({
        id: `ph-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`,
        url,
        caption: caption?.trim() || undefined,
        uploadedAt: formatWibNow(),
      });
    } catch (err) {
      console.error('Admin upload error:', err);
      res.status(500).json({ error: 'Gagal menyimpan foto hasil petugas ke server.' });
    }
  });

  // List all reports + notifications
  app.get('/api/reports', (req: Request, res: Response) => {
    db = loadDatabase();
    const admin = Boolean(getValidAdminSession(req));
    res.json({
      reports: admin ? db.reports : db.reports.map(sanitizePublicReport),
      notifications: db.notifications,
      updatedAt: db.updatedAt,
    });
  });

  // Get single report by ID (used when clicking map marker / public tracking)
  app.get('/api/reports/:id', (req: Request, res: Response) => {
    db = loadDatabase();
    const report = db.reports.find((r) => r.id === req.params.id);
    if (!report) {
      res.status(404).json({ error: `Laporan #${req.params.id} tidak ditemukan.` });
      return;
    }
    const admin = Boolean(getValidAdminSession(req));
    const reportNotifications = db.notifications.filter((n) => n.reportId === report.id);
    res.json({
      report: admin ? report : sanitizePublicReport(report),
      notifications: reportNotifications,
    });
  });

  // Create new report (serialized via write mutex; strictly server-authoritative ID, zero overwrite)
  app.post('/api/reports', async (req: Request, res: Response) => {
    try {
      const incoming = req.body as Partial<ReportItem>;
      if (!incoming || !incoming.title?.trim() || !incoming.locationName?.trim()) {
        res.status(400).json({ error: 'Judul laporan dan lokasi kejadian wajib diisi.' });
        return;
      }

      const result = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const now = new Date();
        const nowWib = formatWibNow(now);
        const nowIso = now.toISOString();

        // Always ignore client-supplied ID and generate official CPT-YYYY-NNN ID on server
        const officialId = generateUniqueReportId(currentDb, now);

        if (currentDb.reports.some((r) => r.id === officialId)) {
          return { conflict: true as const, officialId };
        }

        const isFlagged = Boolean(incoming.verification?.isSuspectedFake) || incoming.status === 'ditolak';
        const initialStatus: ReportStatus = isFlagged ? 'ditolak' : 'diterima';
        const createdAtValue =
          incoming.createdAt && incoming.createdAt !== 'Baru saja (Hari Ini)'
            ? incoming.createdAt
            : nowWib;

        const baseTimeline: ReportTimelineStep[] =
          Array.isArray(incoming.timeline) && incoming.timeline.length > 0
            ? incoming.timeline.map((step, index) =>
                index === 0
                  ? {
                      ...step,
                      id: step.id || `t-init-${Date.now()}`,
                      status: initialStatus,
                      description: isFlagged
                        ? step.description
                        : `Laporan Anda telah berhasil masuk ke basis data CIGAP dengan tiket resmi #${officialId}.`,
                      timestamp: step.timestamp || createdAtValue,
                      createdAtIso: step.createdAtIso || nowIso,
                    }
                  : step
              )
            : [
                {
                  id: `t-init-${Date.now()}`,
                  status: initialStatus,
                  title: isFlagged ? 'Laporan Ditolak (Karantina Audit)' : 'Laporan Diterima',
                  description: isFlagged
                    ? 'Laporan dikarantina karena indikasi ketidaksesuaian data.'
                    : `Laporan Anda telah berhasil masuk ke basis data CIGAP dengan tiket resmi #${officialId}.`,
                  timestamp: createdAtValue,
                  createdAtIso: nowIso,
                  actor: 'Sistem Portal CIGAP',
                },
              ];

        const incomingInternalNote =
          typeof incoming.internalNotes === 'string' && incoming.internalNotes.trim()
            ? incoming.internalNotes.trim()
            : typeof incoming.adminNotes === 'string' &&
              (incoming.adminNotes.startsWith('PERINGATAN SISTEM:') ||
                incoming.adminNotes.includes('Skor Keaslian'))
            ? incoming.adminNotes.trim()
            : undefined;

        const cleanPublicAdminNote = isFlagged
          ? 'Laporan tidak memenuhi ketentuan verifikasi dan sedang dalam pemeriksaan petugas.'
          : 'Laporan baru telah diterima dari kanal warga dan sedang menunggu verifikasi petugas.';

        const prepared = persistInlineReportPhotos({
          ...(incoming as ReportItem),
          id: officialId,
          status: initialStatus,
          urgency: undefined,
          priorityUpdatedAt: undefined,
          priorityAssignedBy: undefined,
          priorityHistory: undefined,
          assignedDepartment: undefined,
          officerName: undefined,
          resolvedPhotoUrl: undefined,
          adminNotes: cleanPublicAdminNote,
          internalNotes: incomingInternalNote,
          createdAt: createdAtValue,
          createdAtIso: incoming.createdAtIso || nowIso,
          updatedAt: nowWib,
          timeline: baseTimeline,
        });

        // Final uniqueness guard before insert (never overwrite existing reports)
        if (currentDb.reports.some((r) => r.id === prepared.id)) {
          return { conflict: true as const, officialId: prepared.id };
        }

        const notifMeta = buildStatusNotificationMessage(
          prepared.status,
          prepared.assignedDepartment,
          prepared.rejectionReason,
          false
        );

        const newNotification: ReportNotification = {
          id: `notif-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
          reportId: prepared.id,
          reportTitle: prepared.title,
          status: prepared.status,
          title: notifMeta.title,
          message: notifMeta.message,
          timestamp: nowWib,
          createdAtIso: nowIso,
          isRead: false,
          type: notifMeta.type,
        };

        currentDb.reports = [prepared, ...currentDb.reports];
        currentDb.notifications = [newNotification, ...currentDb.notifications];
        saveDatabase(currentDb);
        db = currentDb;

        return { conflict: false as const, prepared, newNotification };
      });

      if (result.conflict) {
        res.status(409).json({
          error: `Konflik ID laporan #${result.officialId} terdeteksi. Silakan kirim ulang laporan Anda.`,
        });
        return;
      }

      const publicReport = sanitizePublicReport(result.prepared);
      broadcastEvent('report_created', {
        report: publicReport,
        notification: result.newNotification,
      });

      res.status(201).json({
        report: getValidAdminSession(req) ? result.prepared : publicReport,
        notification: result.newNotification,
      });
    } catch (err) {
      console.error('Create report error:', err);
      res.status(500).json({ error: 'Gagal menyimpan laporan baru ke basis data.' });
    }
  });

  // Update status, estimation, department, officer, and generate timeline + notification (admin-protected)
  app.patch('/api/reports/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const reportId = req.params.id;
      const {
        status,
        adminNote,
        assignedDepartment,
        officerName,
        resolvedPhotoUrl,
        estimatedCompletionDate,
        isDelayed,
        delayReason,
        rejectionReason,
        urgency,
        priorityReason,
      } = req.body as {
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
      };

      const outcome = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const idx = currentDb.reports.findIndex((r) => r.id === reportId);
        if (idx === -1) {
          return { notFound: true as const };
        }

        const existing = currentDb.reports[idx];
        const now = new Date();
        const nowWib = formatWibNow(now);
        const nowIso = now.toISOString();

        let finalResolvedPhoto = resolvedPhotoUrl || existing.resolvedPhotoUrl;
        if (finalResolvedPhoto && finalResolvedPhoto.startsWith('data:image/')) {
          finalResolvedPhoto = saveBase64ImageToDisk(finalResolvedPhoto, `resolved-${reportId}`);
        }

        const statusInfo = STATUS_LABELS[status];
        const noteText =
          adminNote?.trim() ||
          (status === 'ditolak' && rejectionReason
            ? `Laporan ditolak: ${rejectionReason}`
            : statusInfo?.description || `Status diperbarui menjadi ${statusInfo?.label || status}.`);

        const actorLabel = officerName?.trim()
          ? `${officerName.trim()} (${assignedDepartment || existing.assignedDepartment || 'Posko CiGap'})`
          : assignedDepartment || existing.assignedDepartment || 'Petugas Posko CiGap';

        const newStep: ReportTimelineStep = {
          id: `t-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
          status,
          title: statusInfo?.label || status,
          description: noteText,
          timestamp: nowWib,
          createdAtIso: nowIso,
          actor: actorLabel,
          photoUrl: finalResolvedPhoto && status === 'selesai' ? finalResolvedPhoto : undefined,
        };

        const validUrgencies: UrgencyLevel[] = ['rendah', 'sedang', 'tinggi', 'darurat'];
        const hasPriorityPayload = urgency !== undefined;
        const normalizedNextUrgency: UrgencyLevel | undefined =
          urgency === null || (urgency as unknown as string) === ''
            ? undefined
            : validUrgencies.includes(urgency as UrgencyLevel)
            ? (urgency as UrgencyLevel)
            : existing.urgency;

        const priorityChanged = hasPriorityPayload && normalizedNextUrgency !== existing.urgency;
        const nextPriorityHistory: PriorityHistoryEntry[] = Array.isArray(existing.priorityHistory)
          ? [...existing.priorityHistory]
          : [];

        if (priorityChanged) {
          nextPriorityHistory.push({
            id: `prio-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
            previousPriority: existing.urgency,
            newPriority: normalizedNextUrgency,
            reason: priorityReason?.trim() || undefined,
            actor: actorLabel,
            timestamp: nowWib,
            createdAtIso: nowIso,
          });
        }

        const estimateChanged =
          Boolean(estimatedCompletionDate) && estimatedCompletionDate !== existing.estimatedCompletionDate;
        const delayTriggered = Boolean(isDelayed) || (estimateChanged && Boolean(existing.estimatedCompletionDate));

        const updated: ReportItem = {
          ...existing,
          status,
          urgency: hasPriorityPayload ? normalizedNextUrgency : existing.urgency,
          priorityUpdatedAt: priorityChanged ? nowWib : existing.priorityUpdatedAt,
          priorityAssignedBy: priorityChanged ? actorLabel : existing.priorityAssignedBy,
          priorityHistory: nextPriorityHistory.length > 0 ? nextPriorityHistory : existing.priorityHistory,
          adminNotes: noteText,
          assignedDepartment: assignedDepartment || existing.assignedDepartment,
          officerName: officerName !== undefined ? officerName.trim() || undefined : existing.officerName,
          resolvedPhotoUrl: finalResolvedPhoto,
          estimatedCompletionDate:
            estimatedCompletionDate !== undefined ? estimatedCompletionDate || undefined : existing.estimatedCompletionDate,
          estimatedUpdatedAt:
            estimatedCompletionDate !== undefined || delayTriggered ? nowWib : existing.estimatedUpdatedAt,
          isDelayed: isDelayed !== undefined ? isDelayed : existing.isDelayed,
          delayReason: delayReason !== undefined ? delayReason.trim() || undefined : existing.delayReason,
          rejectionReason:
            status === 'ditolak'
              ? rejectionReason?.trim() || noteText
              : existing.rejectionReason,
          updatedAt: nowWib,
          timeline: [...existing.timeline, newStep],
        };

        currentDb.reports[idx] = updated;

        const notifMeta = buildStatusNotificationMessage(
          status,
          updated.assignedDepartment,
          updated.rejectionReason,
          delayTriggered && status === existing.status
        );

        const createdNotifications: ReportNotification[] = [];

        const mainNotif: ReportNotification = {
          id: `notif-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
          reportId: updated.id,
          reportTitle: updated.title,
          status: updated.status,
          title: notifMeta.title,
          message: notifMeta.message,
          timestamp: nowWib,
          createdAtIso: nowIso,
          isRead: false,
          type: notifMeta.type,
        };
        createdNotifications.push(mainNotif);

        if (delayTriggered && status !== existing.status) {
          createdNotifications.push({
            id: `notif-delay-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`,
            reportId: updated.id,
            reportTitle: updated.title,
            status: updated.status,
            title: 'Pembaruan Estimasi Penanganan',
            message: 'Penanganan membutuhkan waktu tambahan. Estimasi penyelesaian telah diperbarui.',
            timestamp: nowWib,
            createdAtIso: nowIso,
            isRead: false,
            type: 'delay',
          });
        }

        currentDb.notifications = [...createdNotifications, ...currentDb.notifications];
        saveDatabase(currentDb);
        db = currentDb;

        return { notFound: false as const, updated, createdNotifications };
      });

      if (outcome.notFound) {
        res.status(404).json({ error: `Laporan #${reportId} tidak ditemukan.` });
        return;
      }

      const publicReport = sanitizePublicReport(outcome.updated);
      broadcastEvent('report_updated', {
        report: publicReport,
        notifications: outcome.createdNotifications,
      });

      res.json({
        report: outcome.updated,
        notifications: outcome.createdNotifications,
      });
    } catch (err) {
      console.error('Update status error:', err);
      res.status(500).json({ error: 'Gagal memperbarui status laporan.' });
    }
  });

  // Update full report (EditReportModal - admin-protected)
  app.put('/api/reports/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const reportId = req.params.id;
      const outcome = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const idx = currentDb.reports.findIndex((r) => r.id === reportId);
        if (idx === -1) {
          return { notFound: true as const };
        }

        const prepared = persistInlineReportPhotos({
          ...(req.body as ReportItem),
          id: reportId,
          updatedAt: formatWibNow(),
        });
        currentDb.reports[idx] = prepared;
        saveDatabase(currentDb);
        db = currentDb;
        return { notFound: false as const, prepared };
      });

      if (outcome.notFound) {
        res.status(404).json({ error: `Laporan #${reportId} tidak ditemukan.` });
        return;
      }

      const publicReport = sanitizePublicReport(outcome.prepared);
      broadcastEvent('report_updated', { report: publicReport, notifications: [] });
      res.json({ report: outcome.prepared });
    } catch (err) {
      console.error('Update report error:', err);
      res.status(500).json({ error: 'Gagal memperbarui data laporan.' });
    }
  });

  // Delete report (admin-protected)
  app.delete('/api/reports/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const reportId = req.params.id;
      const found = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const beforeLen = currentDb.reports.length;
        currentDb.reports = currentDb.reports.filter((r) => r.id !== reportId);
        if (currentDb.reports.length === beforeLen) {
          return false;
        }
        currentDb.notifications = currentDb.notifications.filter((n) => n.reportId !== reportId);
        saveDatabase(currentDb);
        db = currentDb;
        return true;
      });

      if (!found) {
        res.status(404).json({ error: `Laporan #${reportId} tidak ditemukan.` });
        return;
      }

      broadcastEvent('report_deleted', { reportId });
      res.json({ ok: true, reportId });
    } catch (err) {
      console.error('Delete report error:', err);
      res.status(500).json({ error: 'Gagal menghapus laporan.' });
    }
  });

  // Upvote report
  app.post('/api/reports/:id/upvote', async (req: Request, res: Response) => {
    try {
      const reportId = req.params.id;
      const updated = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const idx = currentDb.reports.findIndex((r) => r.id === reportId);
        if (idx === -1) return null;

        currentDb.reports[idx] = {
          ...currentDb.reports[idx],
          upvotes: (currentDb.reports[idx].upvotes || 0) + 1,
        };
        saveDatabase(currentDb);
        db = currentDb;
        return currentDb.reports[idx];
      });

      if (!updated) {
        res.status(404).json({ error: 'Laporan tidak ditemukan.' });
        return;
      }

      const publicReport = sanitizePublicReport(updated);
      broadcastEvent('report_updated', { report: publicReport, notifications: [] });
      res.json({ report: getValidAdminSession(req) ? updated : publicReport });
    } catch (err) {
      console.error('Upvote report error:', err);
      res.status(500).json({ error: 'Gagal memberikan dukungan.' });
    }
  });

  // Submit citizen feedback
  app.post('/api/reports/:id/feedback', async (req: Request, res: Response) => {
    try {
      const reportId = req.params.id;
      const feedback = req.body as UserFeedback;
      const updated = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const idx = currentDb.reports.findIndex((r) => r.id === reportId);
        if (idx === -1) return null;

        currentDb.reports[idx] = {
          ...currentDb.reports[idx],
          feedback,
        };
        saveDatabase(currentDb);
        db = currentDb;
        return currentDb.reports[idx];
      });

      if (!updated) {
        res.status(404).json({ error: 'Laporan tidak ditemukan.' });
        return;
      }

      const publicReport = sanitizePublicReport(updated);
      broadcastEvent('report_updated', { report: publicReport, notifications: [] });
      res.json({ report: getValidAdminSession(req) ? updated : publicReport });
    } catch (err) {
      console.error('Feedback error:', err);
      res.status(500).json({ error: 'Gagal mengirim ulasan.' });
    }
  });

  // Reset reports to initial seed data (admin-protected; preserves monotonic sequence history)
  app.post('/api/reports/reset', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const nextDb = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        const seededReports = INITIAL_REPORTS.map(normalizeReport);
        const preservedSeq = computeMaxSequenceByYear(
          seededReports,
          currentDb.lastSequenceByYear
        );
        const resetDb: CigapDatabase = {
          reports: seededReports,
          notifications: INITIAL_NOTIFICATIONS,
          lastSequenceByYear: preservedSeq,
          updatedAt: new Date().toISOString(),
        };
        saveDatabase(resetDb);
        db = resetDb;
        return resetDb;
      });

      const publicReports = nextDb.reports.map(sanitizePublicReport);
      broadcastEvent('reports_reset', {
        reports: publicReports,
        notifications: nextDb.notifications,
      });
      res.json({
        reports: nextDb.reports,
        notifications: nextDb.notifications,
      });
    } catch (err) {
      console.error('Reset error:', err);
      res.status(500).json({ error: 'Gagal mereset data.' });
    }
  });

  // Notifications endpoints
  app.get('/api/notifications', (_req: Request, res: Response) => {
    db = loadDatabase();
    res.json({ notifications: db.notifications });
  });

  app.patch('/api/notifications/:id/read', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const notifId = req.params.id;
      const notifications = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        currentDb.notifications = currentDb.notifications.map((n) =>
          n.id === notifId ? { ...n, isRead: true } : n
        );
        saveDatabase(currentDb);
        db = currentDb;
        return currentDb.notifications;
      });
      res.json({ notifications });
    } catch (err) {
      console.error('Mark notification read error:', err);
      res.status(500).json({ error: 'Gagal menandai notifikasi.' });
    }
  });

  app.patch('/api/notifications/read-all', requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const notifications = await withDatabaseWriteLock(() => {
        const currentDb = loadDatabase();
        currentDb.notifications = currentDb.notifications.map((n) => ({ ...n, isRead: true }));
        saveDatabase(currentDb);
        db = currentDb;
        return currentDb.notifications;
      });
      res.json({ notifications });
    } catch (err) {
      console.error('Mark all notifications read error:', err);
      res.status(500).json({ error: 'Gagal menandai semua notifikasi.' });
    }
  });

  // Ensure unknown /api/* routes always return JSON 404 (never HTML fallback)
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      error: `Endpoint API ${req.method} ${req.path} tidak ditemukan.`,
    });
  });

  // Ensure JSON parse / payload errors on /api/* return structured JSON
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api')) {
      next(err);
      return;
    }
    const status =
      typeof (err as { status?: number })?.status === 'number'
        ? (err as { status: number }).status
        : 500;
    if (err instanceof SyntaxError && status === 400) {
      res.status(400).json({ error: 'Format JSON permintaan tidak valid.' });
      return;
    }
    if ((err as { type?: string })?.type === 'entity.too.large') {
      res.status(413).json({ error: 'Ukuran payload melebihi batas server.' });
      return;
    }
    console.error('Unhandled API error:', err);
    res.status(status >= 400 ? status : 500).json({
      error: 'Terjadi kesalahan internal pada server API.',
    });
  });

  return app;
}

export async function startServer() {
  const app = createCigapServerApp();

  // Vite middleware in dev, static dist in production
  if (!IS_VERCEL && process.env.NODE_ENV !== 'production') {
    const viteModuleName = 'vite';
    const { createServer: createViteServer } = await import(viteModuleName);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CIGAP Server running at http://0.0.0.0:${PORT}`);
  });
}

const isMainModule = (() => {
  try {
    return path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();

if (!IS_VERCEL && isMainModule) {
  startServer().catch((err) => {
    console.error('Failed to start CIGAP server:', err);
    process.exit(1);
  });
}
