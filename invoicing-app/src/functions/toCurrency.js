const toCurrency = (number, currency = 'INR', language = undefined) =>{
  return Intl.NumberFormat(language, { style: 'currency', currency: currency, currencyDisplay: 'narrowSymbol' }).format(number);
}

export default toCurrency;