import moment from "moment";



export const formatDate = (date: Date | string | number | null | undefined) => {
    if (!date) return '';
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
};