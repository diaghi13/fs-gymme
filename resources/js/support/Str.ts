import currency from 'currency.js';

export const Str = {
  decimalZeroPad: (number: string | number, decimal: string = ',') => {
    number = typeof number === 'number' ? number.toString() : number;
    return parseFloat(number).toFixed(2).toString().replace('.', decimal);
  },
  formatBytes: (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  age: (birthday: Date) => {
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  },
  parseTimeString: (time: string | number) => {
    if (time && typeof time === 'string') {
      const parts = time.split(':');
      return new Date().setHours(
        parseInt(parts[0]),
        parseInt(parts[1]),
        parseInt(parts[2])
      );
    } else return time;
  },
  EURO: (value: number | string) => {
    return currency(value, { symbol: '€', decimal: ',', separator: '.' });
  }
};
