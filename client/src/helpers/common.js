export default {
  stringToLocaleDate: (stringDate) => {
    const date = new Date(stringDate);
    return `${date.toLocaleString('en-US')}`;
  },
  stringToLocaleTime: (stringDate) => {
    const date = new Date(stringDate);
    return `${date.toLocaleTimeString('en-US')}`;
  },
};
