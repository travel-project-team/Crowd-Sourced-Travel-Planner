export const getInitials = (first_name = "", last_name = "") => {

    if ((!first_name)||(!last_name)){
        return "";
    }

    const first_name_parts = first_name.trim();
    const last_name_parts = last_name.trim();

    // if lastname is empty return first initial in the firstname
    if (last_name_parts.length === 0){
        return first_name[0][0].toUpperCase();
    }

    // if firstname is empty return first initial in the lastname
    if (first_name_parts.length === 0){
        return last_name[0][0].toUpperCase();
    }

    return (first_name_parts[0][0] + last_name_parts[0][0]).toUpperCase();
};