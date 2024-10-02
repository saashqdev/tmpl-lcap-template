export const getAppTimezone = (inputTz) => {
    const _appTimeZone = window?.appInfo?.appTimeZone;
    const tz = inputTz === 'global' ? _appTimeZone : inputTz;

    if (tz && tz !== 'user') {
        // Specified fixed time zone
        return tz;
    } else {
        // User's local time zone, including scenarios where tz is null or undefined
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
};

const validIANATimezoneCache = {};
// Determine whether it is a valid time zone character
export function isValidTimezoneIANAString(timezoneString) {
    if (validIANATimezoneCache[timezoneString])
        return true;
    try {
        new Intl.DateTimeFormat(undefined, { timeZone: timezoneString });
        validIANATimezoneCache[timezoneString] = true;
        return true;
    } catch (error) {
        return false;
    }
}
