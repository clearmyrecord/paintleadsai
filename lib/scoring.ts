export type LeadInput = { phone: string; budget: number; timeline: string; propertyType: string; projectType: string; ownsProperty?: boolean };
export function isValidPhone(phone: string) { return /\+?\d[\d\s().-]{7,}/.test(phone); }
export function scoreLead(input: LeadInput): 'Hot' | 'Warm' | 'LowFit' {
  const days = input.timeline === 'ASAP' ? 7 : input.timeline === 'Within 30 days' ? 30 : input.timeline === '30-90 days' ? 60 : 120;
  const vague = ['Not sure', 'Not Sure', 'Other'].includes(input.projectType);
  const renter = input.ownsProperty === false || input.propertyType === 'Renter';
  if (input.budget < 750 || renter || vague) return 'LowFit';
  if (input.budget > 1500 && days <= 30 && isValidPhone(input.phone)) return 'Hot';
  if (input.budget >= 750 && input.budget <= 1500 && days <= 90) return 'Warm';
  return 'LowFit';
}
