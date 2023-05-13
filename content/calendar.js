const BASE_COLOR_WEEKDAY = {r: 0, g: 0, b: 0};
const BASE_COLOR_WEEKEND = {r: 255, g: 0, b: 0};

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

$(document).ready(() => {
    computeDates();
});

function isWeekend(date) {
    const day = date.getDay();
    return day == 0 || day == 6;
}

function computeDates() {
    const urlParams = new URLSearchParams(window.location.search);
    const month = +(urlParams.get("month") || "4");
    const year = +(urlParams.get("year") || "2023");

    const monthLayout = buildMonthLayout({month, year});

    $("#header").append(`${MONTH_NAMES[month]} ${year}`);

    for (const weekLayout of monthLayout) {
        const row = $("<tr>")
            .append(`<th scope="row">${weekLayout.weekNumber}</th>`);

        for (const day of weekLayout.weekDays) {
            const opacity = day.getMonth() === month ? 1 : 0.5;
            const baseColor = isWeekend(day) ? BASE_COLOR_WEEKEND : BASE_COLOR_WEEKDAY;
            const color = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
            row.append(`<td><div class="display-1" style="color: ${color}">${day.getDate()}</div></td>`);
        }

        $("#table-body").append(row);
    }
}

function buildMonthLayout({month, year}) {
    const pivotDate = new Date(year, month);

    const weeks = [getAllDaysOfWeek(pivotDate)];
    while (weeks[weeks.length - 1].some(date => date.getMonth() === pivotDate.getMonth())) {
        const newPivot = new Date(weeks[weeks.length - 1][0]);
        newPivot.setDate(newPivot.getDate() + 7);
        weeks.push(getAllDaysOfWeek(newPivot));
    }
    weeks.pop();

    for (const idx in weeks) {
        const weekDays = weeks[idx];
        weeks[idx] = {
            weekNumber: getWeekOfYear(weekDays.find(date => date.getFullYear() == year)),
            weekDays,
        };
    }
    return weeks;
}

function mondayBasedWeekday(date) {
    return (date.getDay() + 6) % 7;
}

function getAllDaysOfWeek(date) {
    const dayOfWeek = mondayBasedWeekday(date);
    const week = new Array(7);

    for (let i = 0; i < 7; ++i) {
        week[i] = new Date(date);
        week[i].setDate(date.getDate() - dayOfWeek + i);
    }
    return week;
}

function getWeekOfYear(date) {
    const endOfCurrentWeek = getAllDaysOfWeek(date)[6];
    let counter = 0;
    while (endOfCurrentWeek.getFullYear() >= date.getFullYear()) {
        ++counter;
        endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() - 7);
    }
    return counter;
}