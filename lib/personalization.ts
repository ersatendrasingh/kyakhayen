export function isPersonalizationComplete(user: any): boolean {
  const requiredFields = [
    "foodPreferenceId",
    "cookingSkillId",
  ];

  for (const field of requiredFields) {
    if (!user[field]) {
      return false;
    }
  }

  const requiredArrays = ["userCuisines"];
  for (const arrayField of requiredArrays) {
    if (!user[arrayField] || user[arrayField].length === 0) {
      return false;
    }
  }

  return true;
}
