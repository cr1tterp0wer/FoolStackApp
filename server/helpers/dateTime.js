/**
 * AddDays - add days to current date object
 * @param {Integer} - Number of days to add
 * @return {Object} - Date object
 */
Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};
