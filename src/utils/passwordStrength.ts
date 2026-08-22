import type { PasswordStrength } from '@/types/auth';

export function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const score = Math.min(metRequirements, 5);

  let label: PasswordStrength['label'] = 'very-weak';
  if (score >= 5) label = 'strong';
  else if (score >= 4) label = 'good';
  else if (score >= 3) label = 'fair';
  else if (score >= 2) label = 'weak';

  return {
    score,
    label,
    requirements,
  };
}

export function getStrengthColor(label: PasswordStrength['label']): string {
  switch (label) {
    case 'very-weak':
      return 'text-red-500';
    case 'weak':
      return 'text-orange-500';
    case 'fair':
      return 'text-yellow-500';
    case 'good':
      return 'text-lime-500';
    case 'strong':
      return 'text-emerald-500';
    default:
      return 'text-gray-500';
  }
}

export function getStrengthBgColor(label: PasswordStrength['label']): string {
  switch (label) {
    case 'very-weak':
      return 'bg-red-500';
    case 'weak':
      return 'bg-orange-500';
    case 'fair':
      return 'bg-yellow-500';
    case 'good':
      return 'bg-lime-500';
    case 'strong':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-300';
  }
}

export const passwordRequirements = [
  { key: 'minLength', label: 'At least 8 characters' },
  { key: 'uppercase', label: 'One uppercase letter' },
  { key: 'lowercase', label: 'One lowercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'specialChar', label: 'One special character' },
] as const;



