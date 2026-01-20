import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface BookingExportData {
  'Guest Name': string;
  'Email': string;
  'Phone': string;
  'Room Name': string;
  'Date': string;
  'Start Time': string;
  'End Time': string;
  'Purpose': string;
  'Status': string;
  'Applied At': string;
}

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Download file
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};
