// Cầu nối đồng bộ nội dung từ Google Sheets & gửi điểm học viên qua Google Apps Script
// Dán link Web App Google Apps Script của bạn vào đây để áp dụng mặc định cho mọi học viên:
export const DEFAULT_GAS_WEBAPP_URL = '';

const GAS_URL_STORAGE_KEY = 'yydd_gas_webapp_url';
const STUDENT_INFO_KEY = 'yydd_student_info';

export interface StudentInfo {
  name: string;
  contact: string;
}

export function getGasUrl(): string {
  try {
    return localStorage.getItem(GAS_URL_STORAGE_KEY) || DEFAULT_GAS_WEBAPP_URL;
  } catch {
    return DEFAULT_GAS_WEBAPP_URL;
  }
}

export function saveGasUrl(url: string): void {
  try {
    localStorage.setItem(GAS_URL_STORAGE_KEY, url.trim());
  } catch {}
}

export function getStudentInfo(): StudentInfo {
  try {
    const raw = localStorage.getItem(STUDENT_INFO_KEY);
    return raw ? JSON.parse(raw) : { name: '', contact: '' };
  } catch {
    return { name: '', contact: '' };
  }
}

export function saveStudentInfo(info: StudentInfo): void {
  try {
    localStorage.setItem(STUDENT_INFO_KEY, JSON.stringify(info));
  } catch {}
}

export async function fetchCurriculumFromSheets(url = getGasUrl()) {
  if (!url) return null;
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${sep}action=getCurriculum`, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function submitScoreToSheets(payload: Record<string, unknown>, url = getGasUrl()) {
  if (!url) return { ok: false, skipped: true };
  // Dùng text/plain để tránh CORS preflight OPTIONS trên Google Apps Script
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
