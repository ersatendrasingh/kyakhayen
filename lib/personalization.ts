export function isPersonalizationComplete(user: any): boolean {
  const requiredFields = [
    "dob",
    "age",
    "genderId",
    "foodPreferenceId",
    "cookingSkillId",
    "heightFt",
    "heightInch",
    "heightCm",
    "weightKg",
    "weightLbs",
  ];

  for (const field of requiredFields) {
    if (!user[field]) {
      return false;
    }
  }

  const requiredArrays = [
    "userCuisines",
    "UserHealthGoals",
    "UserAllrgies",
    "userPrakriti",
  ];
  for (const arrayField of requiredArrays) {
    if (!user[arrayField] || user[arrayField].length === 0) {
      return false;
    }
  }

  return true;
}
