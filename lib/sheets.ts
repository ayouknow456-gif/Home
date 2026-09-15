// Server-only. Google Sheets is used purely as an audit log / export target —
// Firestore remains the source of truth (see IMPORTANT NOTES in the spec).
import { google } from "googleapis";

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set.");
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  return google.sheets({ version: "v4", auth });
}

export type SheetName = "บิลไฟฟ้า" | "การยืม" | "แจ้งซ่อม" | "ค่าใช้จ่าย";

export async function appendToSheet(sheetName: SheetName, rowData: (string | number)[]) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID is not set.");
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowData] },
  });
}
