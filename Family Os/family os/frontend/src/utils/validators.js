export const validateSubmission = ({
  proofType,
  checklistCompleted,
  imageFiles,
  checklistItems = [],
}) => {
  if (proofType === "photo" || proofType === "photo_and_checklist") {
    if (!imageFiles || imageFiles.length === 0) {
      return "Please upload at least one photo.";
    }
  }

  if (proofType === "checklist" || proofType === "photo_and_checklist") {
    if (
      checklistItems.length > 0 &&
      (!checklistCompleted || checklistCompleted.length === 0)
    ) {
      return "Please complete the checklist.";
    }
  }

  return null;
};
