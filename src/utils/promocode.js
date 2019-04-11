const weather = require('./openweathermap');

class PromocodeValidator {
  constructor() {
    this.reasons = [];
  }
  // no security, rules are supposed to be validated already
  async validate(request, rules) {
    this.reasons = []; // reset
    return Object.keys(rules).reduce(async (result, andRuleKey) => {
      const andRule = rules[andRuleKey];
      let tmp;
      switch (andRuleKey) {
        case '@or':
          let savedReasons = this.reasons;
          this.reasons = [];
          tmp = await andRule.reduce(async (result, orRule) => {
            return await result || await this.validate(request, orRule);
          }, false); // OR requires original false
          this.reasons = savedReasons;
          if (!tmp) {
            this.reasons.push('could not validate OR logic: ' + JSON.stringify(andRule));
          }
          break;
        case '@age':
          tmp = this.validateOperator(request.age, andRule);
          if (!tmp) {
            this.reasons.push(`could not validate ${andRuleKey}: ${JSON.stringify(andRule)}`);
          }
          break;
        case '@date':
          // TODO date shortcut, might need to consider request's city and extract have local time
          const currentDate = new Date();
          tmp = this.validateOperator(currentDate.toISOString().substr(0, 10), andRule);
          if (!tmp) {
            this.reasons.push(`could not validate ${andRuleKey}: ${JSON.stringify(andRule)}`);
          }
          break;
        case '@meteo':
          const weatherData = await weather.current(request.meteo.town);
          tmp = true;
          if (weatherData.weather[0].main.toLowerCase() !== andRule.is) {
            tmp = false;
            this.reasons.push('could not validate weather status: ' + andRule.is);
          }
          // Kelvin to Celsius
          tmp = this.validateOperator(weatherData.main.temp - 273.15, andRule.temp);
          if (!tmp) {
            this.reasons.push(
              'could not validate weather temperature: ' + JSON.stringify(andRule.temp)
            );
          }
          break;
      }
      return await result && tmp;
    }, true); // AND requires original true
  }
  // no security, rules are supposed to be validated already
  validateOperator(datum, rule) {
    return Object.keys(rule).reduce((result, operation) => {
      const criterium = rule[operation];
      switch (operation) {
        case 'before':
        case 'lt':
          return result && datum < criterium;
        case 'lte':
          return result && datum <= criterium;
        case 'after':
        case 'gt':
          return result && datum > criterium;
        case 'gte':
          return result && datum >= criterium;
        case 'eq':
          return result && datum == criterium; // loose eq here, maybe better with === ?
      }
    }, true); // AND logic
  }
}

module.exports = PromocodeValidator;