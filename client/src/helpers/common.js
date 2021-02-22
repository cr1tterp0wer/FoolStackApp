const mixins = {
  methods: {
    stringToLocaleDate: (stringDate) => {
      const date = new Date(stringDate);
      return `${date.toLocaleString('en-US')}`;
    },
    stringToLocaleTime: (stringDate) => {
      const date = new Date(stringDate);
      return `${date.toLocaleTimeString('en-US')}`;
    },
    isEmpty: (object) => Object.keys(object).length < 1,
  },
};

export default mixins;
