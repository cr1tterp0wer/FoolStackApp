export default {
  stringToLocaleDate: (stringDate) => {
    const date = new Date(stringDate);
    return `${date.toLocaleDateString('en-US')}`;
  },
};
