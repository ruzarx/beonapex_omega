export const openGroups = ["I-II", "III", "IV"];
export const starGroups = ["I", "II", "III", "IV"];

export const defaultGroupForType = {
  star: "I",
  open: "I-II",
};

export const getGroupChips = (useStarGroup) => {
  return useStarGroup ? starGroups : openGroups;
};

