import type { GeneratedLoginIdInfo } from '@/types/auth';

function generateCompanyCode(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

function generateEmployeeCode(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    const word = words[0];
    return (word[0] + word.slice(1, 3)).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase() + (word[1] || '').toUpperCase())
    .join('')
    .slice(0, 4);
}

function generateSerialNumber(index: number): string {
  return String(index).padStart(4, '0');
}

export function generateLoginIdPreview(
  companyName: string,
  employeeName: string,
  joiningDate: string,
  serialNumber: number = 1
): GeneratedLoginIdInfo {
  const companyCode = generateCompanyCode(companyName);
  const employeeCode = generateEmployeeCode(employeeName);
  const joiningYear = new Date(joiningDate).getFullYear().toString();
  const serial = generateSerialNumber(serialNumber);
  const formatted = `${companyCode}${employeeCode}${joiningYear}${serial}`;

  return {
    companyCode,
    employeeCode,
    joiningYear,
    serialNumber: serial,
    formatted,
  };
}

export function parseLoginId(loginId: string): GeneratedLoginIdInfo | null {
  if (loginId.length < 10) return null;

  const companyCode = loginId.slice(0, 2);
  const employeeCode = loginId.slice(2, 6);
  const joiningYear = loginId.slice(6, 10);
  const serialNumber = loginId.slice(10);

  return {
    companyCode,
    employeeCode,
    joiningYear,
    serialNumber,
    formatted: loginId,
  };
}



