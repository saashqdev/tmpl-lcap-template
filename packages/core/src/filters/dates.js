import { format, isYesterday, startOfToday, addDays, isSameDay } from 'date-fns';

const formatDate = function (value) {
    if (!value)
        return '-';
    const timestamp = isNaN(+value) ? Date.parse(value) : +value;
    if (isNaN(timestamp)) {
        return '-';
    }
    return new Date(timestamp);
};

const dateFormat = (value, formatter = 'yyyy-MM-dd HH:mm:ss') => {
    const timestamp = formatDate(value);
    if (timestamp === '-') {
        return timestamp;
    }
    if (!formatter)
        return value;

    return format(timestamp, formatter);
};

const timeFormat = (value, type = 'day') => { // type takes values   day, minute, default day
    const timestamp = formatDate(value);
    if (timestamp === '-') {
        return timestamp;
    }
    const today = startOfToday();
    let [day, hm] = format(timestamp, 'yyyy-MM-dd HH:mm').split(' ');
    if (isSameDay(timestamp, today)) {
        return 'today' + hm;
    }
    if (isYesterday(timestamp)) {
        day = 'yesterday';
    } else if (isSameDay(addDays(today, -2), timestamp)) {
        day = 'the day before yesterday';
    }
    if (type === 'day') {
        return day;
    } else {
        return day + ' ' + hm;
    }
};

export default {
    dateFormat,
    timeFormat,
};
