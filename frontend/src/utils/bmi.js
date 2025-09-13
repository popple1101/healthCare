export function calcBMI(weightKg, heightCm) {
  const w = Number(weightKg)
  const hM = Number(heightCm) / 100
  if (!w || !hM) return null
  return +(w / (hM * hM)).toFixed(1)
}

export function classifyBMI(bmi) {
  if (bmi == null) return 'normal'
  if (bmi < 18.5) return 'thin'
  if (bmi < 23) return 'normal'
  return 'chuby'
}
