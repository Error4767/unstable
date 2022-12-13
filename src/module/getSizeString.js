const unitSizes = new Array(12).fill(0).map((v, i) => 1024 ** i);
const units = ['B', 'KB', 'MB', "GB", "TB", "PB", "EB", "ZB", "YB", "BB", "NB", "DB"];

export function getSizeString(size) {
    if (size === 0) {
        return `0${units[0]}`;
    }
    let unit;
    let unitSize;
    for (let i = 0, length = unitSizes.length; i < length; i++) {
        if (size <= unitSizes[i]) {
            unit = units[i - 1];
            unitSize = unitSizes[i - 1];
            break;
        }
    }
    return unit === 'B' ? size + unit : (size / unitSize).toFixed(2) + unit;
}