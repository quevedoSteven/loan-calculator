export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
) {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;

  if (annualRate === 0) return principal / numberOfPayments;

  return (
    (principal * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -numberOfPayments))
  );
}
