export const getInitials = (first_name = "", last_name = "") => {

  const fName = first_name ? first_name.trim() : "";
  const lName = last_name ? last_name.trim() : "";

  if (!fName && !lName) {
    return "U";
  }


  if (lName.length === 0) {
    return fName.charAt(0).toUpperCase();
  }

  if (fName.length === 0) {
    return lName.charAt(0).toUpperCase();
  }

  return (fName.charAt(0) + lName.charAt(0)).toUpperCase();
};