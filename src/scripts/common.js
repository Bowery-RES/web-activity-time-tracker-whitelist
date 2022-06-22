const RangeForDays = {
    days2: 'days2',
    days3: 'days3',
    days4: 'days4',
    days5: 'days5',
    days6: 'days6',
    days7: 'days7',
    month1: 'month1',
    month2: 'month2',
    month3: 'month3'
};

const InactivityInterval = {
    second30: 30,
    second45: 45,
    min1: 60,
    min2: 120,
    min5: 300,
    min10: 600,
    min20: 1200,
    min30: 1800
};

const TypeListEnum = {
    ToDay: 1,
    All: 2,
    ByDays: 3,
};

const STORAGE_TABS = 'tabs';
const STORAGE_ALLOWED_LIST = 'allowed_list';
const STORAGE_TIMEINTERVAL_LIST = 'time_interval';
const STORAGE_USER_EMAIL = 'user_email';
const STORAGE_ID_TOKEN = 'id_token';
const STORAGE_ID_TOKEN_EXPIRATION_DATE = 'id_token_expiration_date';
const STORAGE_REFRESH_TOKEN = 'refresh_token';

const SETTINGS_INTERVAL_INACTIVITY_DEFAULT = InactivityInterval.min5;
const SETTINGS_INTERVAL_CHECK_DEFAULT = 1000;
const SETTINGS_INTERVAL_SAVE_STORAGE_DEFAULT = 5000;
const SETTINGS_INTERVAL_RANGE_DEFAULT = RangeForDays.days7;
const SETTINGS_VIEW_TIME_IN_BADGE_DEFAULT = true;
const SETTINGS_DARK_MODE_DEFAULT = false;
const SETTINGS_SHOW_HINT_DEFAULT = true;

const SETTINGS_INTERVAL_INACTIVITY = 'inactivity_interval';
const SETTINGS_INTERVAL_SAVE_STORAGE = 'interval_save_in_storage';
const SETTINGS_INTERVAL_RANGE = 'range_days';
const SETTINGS_DARK_MODE = 'night_mode';
const SETTINGS_VIEW_TIME_IN_BADGE = 'view_time_in_badge';
const SETTINGS_SHOW_HINT = 'show_hint';

// TODO clarify whether a hardcoded value can be used
const CLIENT_SECRET = "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"
const HOURS_MS = 3600000;
const MIN_MS = 60000;
const SEC_MS = 1000;

const USER_LOCATION_LAT = 'latitude';
const USER_LOCATION_LONG = 'longitude';

const TRACK_USER_ACTIVITY_URL = 'https://bl3ky3ae7i.execute-api.us-east-1.amazonaws.com/prod/user-activity';
const AUTH_ERROR_MSG = 'User is not authorized to access this resource with an explicit deny';
const EMPTY_TAB_URL = 'chrome://newtab/';

const GEOLOCATION_ERROR_MSG = 'Geolocation - getCurrentPosition error';

const CHROME_EVENTS = {
    TABS: {
        ONACTIVATED: 'tabs:onActivated',
        ONUPDATED: 'tabs:onUpdated',
        ONREMOVED: 'tabs:onRemoved',
        NOACTIVITY: 'activity:notDetected'
    },
    BROWSER: {
        ONREMOVED: 'windows:onRemoved'
    }
}
const CLIENT_ID = '1015386027653-qb0c3i25f725tnovmuocllic0f4ekhnu.apps.googleusercontent.com';

function isEmpty(obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

function convertTimeToSummaryTime(time) {
    let resultTimeValue = Number(time);
    if (!isNaN(resultTimeValue)){
        return resultTimeValue;
    }

    const timeValue = time.split(':');
    const hour = timeValue[0];
    const min = timeValue[1];
    resultTimeValue = 0;
    if (hour > 0)
        resultTimeValue = hour * 3600;
    resultTimeValue += min * 60;

    return resultTimeValue;
}

function convertSummaryTimeToBadgeString(summaryTime) {
    const sec = (summaryTime);
    const min = (summaryTime / 60).toFixed(0);
    const hours = (summaryTime / (60 * 60)).toFixed(1);
    const days = (summaryTime / (60 * 60 * 24)).toFixed(0);

    if (sec < 60) {
        return sec + "s";
    } else if (min < 60) {
        return min + "m";
    } else if (hours < 24) {
        return hours + "h";
    } else {
        return days + "d"
    }
}

function convertShortSummaryTimeToString(summaryTime) {
    const totalSeconds = summaryTime % 3600;
    let hours = Math.floor(summaryTime / 3600);
    let mins = Math.floor(totalSeconds / 60);

    hours = zeroAppend(hours);
    mins = zeroAppend(mins);

    return hours + 'h : ' + mins + 'm';
}

function convertShortSummaryTimeToLongString(summaryTime) {
    const totalSeconds = summaryTime % 3600;
    let hours = Math.floor(summaryTime / 3600);
    let mins = Math.floor(totalSeconds / 60);

    hours = zeroAppend(hours);
    mins = zeroAppend(mins);

    return hours + ' hour ' + mins + ' minutes';
}

function getArrayTime(summaryTime) {
    let days = Math.floor(summaryTime / 3600 / 24);
    let totalHours = summaryTime % (3600 * 24);
    let hours = Math.floor(totalHours / 3600);
    let totalSeconds = summaryTime % 3600;
    let mins = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    days = zeroAppend(days);
    hours = zeroAppend(hours);
    mins = zeroAppend(mins);
    seconds = zeroAppend(seconds);

    return {
        'days': days,
        'hours': hours,
        'mins': mins,
        'seconds': seconds
    };
}

function convertSummaryTimeToString(summaryTime) {
    let days = Math.floor(summaryTime / 3600 / 24);
    let totalHours = summaryTime % (3600 * 24);
    let hours = Math.floor(totalHours / 3600);
    let totalSeconds = summaryTime % 3600;
    let mins = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    hours = zeroAppend(hours);
    mins = zeroAppend(mins);
    seconds = zeroAppend(seconds);

    if (days > 0)
        return days + 'd ' + hours + 'h ' + mins + 'm ' + seconds + 's';
    else return hours + 'h ' + mins + 'm ' + seconds + 's';
}

function zeroAppend(time) {
    if (time < 10)
        return '0' + time;
    else return time;
}

function isDateInRange(dateStr, range) {
    return new Date(dateStr) >= range.from && new Date(dateStr) <= range.to;
}

function isCorrectDate(range) {
    return range.from.getFullYear() >= 2019 && range.to.getFullYear() >= 2019;
}

function getDateFromRange(range) {
    switch (range) {
        case 'days2':
            return 2;
        case 'days3':
            return 3;
        case 'days4':
            return 4;
        case 'days5':
            return 5;
        case 'days6':
            return 6;
        case 'days7':
            return 7;
        case 'month1':
            return 30;
        case 'month2':
            return 60;
        case 'month3':
            return 90;
    }
}

function treatAsUTC(date) {
    let result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    let millisecondsPerDay = 24 * 60 * 60 * 1000;
    return ((treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay) + 1;
}

function todayLocalDate() {
    return new Date().toLocaleDateString('en-US');
}
