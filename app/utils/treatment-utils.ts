// 根據治療名稱獲取治療ID
export function getTreatmentIdByName(name: string): string | null {
  const treatmentMap = {
    達文西機器人手術: "treatment-1",
    達文西手術: "treatment-1",
    質子治療: "treatment-2",
    免疫細胞療法: "treatment-3",
    特殊抗癌藥物: "treatment-4",
    人工關節置換: "treatment-5",
    微創脊椎手術: "treatment-6",
    新型心臟支架: "treatment-7",
    高階人工水晶體: "treatment-8",
  }

  // 嘗試直接匹配
  if (treatmentMap[name]) {
    return treatmentMap[name]
  }

  // 嘗試部分匹配
  for (const [key, value] of Object.entries(treatmentMap)) {
    if (name.includes(key) || key.includes(name)) {
      return value
    }
  }

  return null
}
