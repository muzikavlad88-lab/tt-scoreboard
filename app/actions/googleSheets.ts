'use server';

import { google } from 'googleapis';

export async function appendMatchToSheet(matchData: {
  matchType: string;
  p1: string;
  p2: string;
  p3?: string;
  p4?: string;
  winner: string;
}) {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const ukraineTime = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });

    // Формуємо рядок для таблиці згідно з нашою структурою
    const row = [
      ukraineTime,
      matchData.matchType,
      matchData.p1,
      matchData.p2,
      matchData.p3 || '',
      matchData.p4 || '',
      matchData.winner,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:G', // Переконайся, що вкладка називається Sheet1 або замініть на свою назву
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Помилка запису в Google Sheets:', error);
    return { success: false, error: error.message };
  }
}