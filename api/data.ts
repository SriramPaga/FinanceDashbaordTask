// File: /api/data.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import xlsx from 'xlsx';
import path from 'path';

// Define the FinancialRecord type, matching your frontend
interface FinancialRecord {
  Company: string;
  Metric: string;
  Year: number;
  Value: number;
}

// Helper function to format the raw data from the Excel sheet
const formatData = (rawData: any[]): FinancialRecord[] => {
  const allFormattedData: FinancialRecord[] = [];

  rawData.forEach(row => {
    const companyName = row['Company name'];
    const metric = row['Field']; // e.g., 'SALES', 'EBITDA'

    for (const key in row) {
      // Check if the key is a four-digit year (e.g., '2023')
      if (/^\d{4}$/.test(key)) {
        allFormattedData.push({
          Company: companyName,
          Metric: metric,
          Year: parseInt(key, 10),
          Value: parseFloat(row[key]),
        });
      }
    }
  });

  return allFormattedData;
};


export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Correctly locate the file in a serverless environment
    const filePath = path.join(process.cwd(), 'Financials.xls');
    
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawJsonData = xlsx.utils.sheet_to_json(worksheet);
    
    // Use the helper function to transform the data
    const formattedData = formatData(rawJsonData);

    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Vercel handles preflight OPTIONS requests automatically,
    // but we can add this for robustness.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    res.status(200).json(formattedData);

  } catch (error) {
    console.error('Failed to process the Excel file:', error);
    res.status(500).json({ error: 'Error processing data file.' });
  }
}