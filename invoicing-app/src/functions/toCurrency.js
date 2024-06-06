const toCurrency = (number, currency = 'INR', language = undefined) =>{
  return Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(number);
}

export default toCurrency;