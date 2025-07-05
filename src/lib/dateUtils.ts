/**
 * Date formatting utilities for consistent date display across the platform
 */

/**
 * Formats a date string to dd/mm/yyyy format
 * @param dateString - Date string in various formats (yyyy-mm-dd, mm/dd/yyyy, etc.)
 * @returns Formatted date string in dd/mm/yyyy format
 */
export function formatDateToDDMMYYYY(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

/**
 * Formats a date with recurring indicator if applicable
 * @param dateString - Date string to format
 * @param isRecurring - Whether the ride is recurring
 * @returns Formatted date with "Recurring" indicator if applicable
 */
export function formatDateWithRecurring(dateString: string | null | undefined, isRecurring?: boolean | string): string {
  const formattedDate = formatDateToDDMMYYYY(dateString);
  
  if (isRecurring === true || isRecurring === 'true') {
    return formattedDate ? `${formattedDate} (Recurring)` : 'Recurring';
  }
  
  return formattedDate;
}

/**
 * Formats today's date to dd/mm/yyyy format
 * @returns Today's date in dd/mm/yyyy format
 */
export function formatTodayDate(): string {
  return formatDateToDDMMYYYY(new Date().toISOString());
}