export default function monthNumberToWord(monthNumber) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
    ];
  
    return months[monthNumber - 1]; // Months are 0-indexed, so subtract 1
  }