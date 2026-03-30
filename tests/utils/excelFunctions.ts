import { APIRequestContext } from '@playwright/test';
import * as ExcelJS from 'exceljs';
import path from 'path';

/**
 * Get all Excel file names from a directory
 * @param directoryPath - Path to the directory containing Excel files
 * @returns Array of Excel file names
 */
export async function getExcelFileNames(directoryPath: string): Promise<string[]> {
   try {
          const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(directoryPath);
    
      // Extract just the filename from the full path
      const fileName = path.basename(directoryPath);
      
      console.log(`\n📂 File Name: ${fileName}`);      
      return [fileName];
      
   } catch (error) {
      console.error(`❌ Error reading directory ${directoryPath}:`, error);
      return [];
   }
}


/**
 * Read Summary sheet from Excel file and extract all data
 * @param filePath - Path to the Excel file
 * @returns Object containing all data from Summary sheet
 */
export async function readSummarySheetData(filePath: string): Promise<{
  reportTitle?: string;
  campaignGroup?: string;
  startDate?: string;
  endDate?: string;
  dataProvider?: string;
  measurementConsumer?: string;
  eventGroup?: string;
  population?: string;
  demographics?: string;
  [key: string]: any; // Allow dynamic properties
}> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Get Summary sheet
    const summarySheet = workbook.getWorksheet('Summary');
    
    if (!summarySheet) {
      throw new Error('Summary sheet not found in the Excel file');
    }
    
    const summaryData: any = {};
    
   console.log(`\n📊 Reading Summary Sheet from: ${path.basename(filePath)}`);
    
    // Read all rows and extract key-value pairs
    // Assuming the Summary sheet has data in key-value format (row 5: Key, row 6: Values)
    const headerRow = summarySheet.getRow(5);
    const dataRow = summarySheet.getRow(6);
    
    headerRow.eachCell((cell, colNumber) => {
      const key = cell.value?.toString().trim();
      const value = dataRow.getCell(colNumber).value;
      
      if (key && value !== null && value !== undefined) {
        summaryData[key] = value;
      //  console.log(`   ${key}: ${value}`);
      }
    });
    
    console.log(`\n✅ Summary sheet data extracted successfully`);
    return summaryData;
    
  } catch (error) {
    console.error(`❌ Error reading Summary sheet from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Read all values from a specific column in Summary sheet
 * @param filePath - Path to the Excel file
 * @param columnName - Name of the column header to read
 * @returns Array of all non-empty values from that column
 */
export async function readColumnValues(filePath: string, columnName: string): Promise<string[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const summarySheet = workbook.getWorksheet('Summary');
    
    if (!summarySheet) {
      throw new Error('Summary sheet not found in the Excel file');
    }
    
    const values: string[] = [];
    const headerRow = summarySheet.getRow(5);
    let targetColumn: number | null = null;
    
    // Find the column number for the specified column name
    headerRow.eachCell((cell, colNumber) => {
      const key = cell.value?.toString().trim().toLowerCase();
      if (key && key.includes(columnName.toLowerCase())) {
        targetColumn = colNumber;
      }
    });
    
    if (targetColumn === null) {
      console.log(`⚠️ Column "${columnName}" not found in Summary sheet`);
      return [];
    }
    
    // Read all values from the target column (starting from row 6)
    const totalRows = summarySheet.rowCount;
    for (let rowNum = 6; rowNum <= totalRows; rowNum++) {
      const row = summarySheet.getRow(rowNum);
      const cellValue = row.getCell(targetColumn).value;
      
      if (cellValue !== null && cellValue !== undefined && cellValue.toString().trim() !== '') {
        values.push(cellValue.toString().trim());
      }
    }
    
    console.log(`\n📋 Found ${values.length} values in "${columnName}" column: ${values.join(', ')}`);
    return values;
    
  } catch (error) {
    console.error(`❌ Error reading column "${columnName}" from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get all column headers from Summary sheet
 * @param filePath - Path to the Excel file
 * @returns Array of all column header names
 */
export async function getSummaryColumnHeaders(filePath: string): Promise<string[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const summarySheet = workbook.getWorksheet('Summary');
    
    if (!summarySheet) {
      throw new Error('Summary sheet not found in the Excel file');
    }
    
    const headers: string[] = [];
    const headerRow = summarySheet.getRow(5);
    
    headerRow.eachCell((cell, colNumber) => {
      const key = cell.value?.toString().trim();
      if (key) {
        headers.push(key);
      }
    });
    
    console.log(`\n📋 Summary Sheet Column Headers (${headers.length} columns):`);
    headers.forEach((header, index) => {
      console.log(`   ${index + 1}. ${header}`);
    });
    
    return headers;
    
  } catch (error) {
    console.error(`❌ Error reading column headers from ${filePath}:`, error);
    throw error;
  }
}


/**
 * Read Summary sheet and extract specific known fields
 * @param filePath - Path to the Excel file
 * @returns Object with specific fields from Summary sheet
 */
export async function extractSummaryFields(filePath: string): Promise<{
  reportTitle: string;
  campaignGroup: string;
  startDate: string;
  endDate: string;
  dataProvider: string;
  measurementConsumer: string;
  eventGroup: string;
  population: string;
  demographics: string;
}> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const summarySheet = workbook.getWorksheet('Summary');
    
    if (!summarySheet) {
      throw new Error('Summary sheet not found in the Excel file');
    }
    
    const data = {
      reportTitle: '',
      campaignGroup: '',
      startDate: '',
      endDate: '',
      dataProvider: '',
      measurementConsumer: '',
      eventGroup: '',
      population: '',
      demographics: ''
    };
    
    // Read through the sheet and find specific fields
    summarySheet.eachRow((row, rowNumber) => {
      const label = row.getCell(1).value?.toString().toLowerCase() || '';
      const value = row.getCell(2).value?.toString() || '';
      
      if (label.includes('report') && label.includes('title')) {
        data.reportTitle = value;
      } else if (label.includes('campaign') && label.includes('group')) {
        data.campaignGroup = value;
      } else if (label.includes('start') && label.includes('date')) {
        data.startDate = value;
      } else if (label.includes('end') && label.includes('date')) {
        data.endDate = value;
      } else if (label.includes('data') && label.includes('provider')) {
        data.dataProvider = value;
      } else if (label.includes('measurement') && label.includes('consumer')) {
        data.measurementConsumer = value;
      } else if (label.includes('event') && label.includes('group')) {
        data.eventGroup = value;
      } else if (label.includes('population')) {
        data.population = value;
      } else if (label.includes('demographic')) {
        data.demographics = value;
      }
    });
    
    console.log(`\n📊 Summary Data Extracted:`);
    console.log(`   Report Title: ${data.reportTitle}`);
    console.log(`   Campaign Group: ${data.campaignGroup}`);
    console.log(`   Start Date: ${data.startDate}`);
    console.log(`   End Date: ${data.endDate}`);
    console.log(`   Data Provider: ${data.dataProvider}`);
    console.log(`   Measurement Consumer: ${data.measurementConsumer}`);
    console.log(`   Event Group: ${data.eventGroup}`);
    console.log(`   Population: ${data.population}`);
    console.log(`   Demographics: ${data.demographics}`);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error extracting summary fields from ${filePath}:`, error);
    throw error;
  }
}



/**
 * Fetch report details by ID
 * @param request - Playwright APIRequestContext
 * @param baseUrl - Base URL of the API
 * @param reportId - The report ID
 * @returns Promise<any> - The complete report object
 */
export async function fetchReportDetails(
  request: APIRequestContext,
): Promise<any> {
  const BASE_URI = process.env.BASE_URI || '';
  const GetReportByPageNumber = process.env.SearchWithFilter || '';
  console.log('BASE_URI:', BASE_URI);
  console.log('ENDPOINT:', GetReportByPageNumber);
  const pageNumber = 20
  try {

    const response = await request.get(`${BASE_URI}${GetReportByPageNumber}`, {
      params: { pageNumber: pageNumber }
    });

    if (!response.ok()) {
      throw new Error(`API request failed with status ${response.status()}`);
    }

    const reportDetails = await response.json();
    console.log(`✅ Report details fetched successfully`);

    return reportDetails;

  } catch (error) {
    console.error(`❌ Error fetching report details:`, error);
    throw error;
  }
}




/**
 * Comprehensive Excel comparison function that compares all sheets and data
 * @param filePath1 Path to first Excel file
 * @param filePath2 Path to second Excel file
 * @returns Object containing comparison results and detailed differences
 */
export async function compareExcelCompletely(filePath1: string, filePath2: string) {
  const result = {
    identical: false,
    differences: [] as string[],
    sheetDifferences: {} as {[sheetName: string]: string[]},
    summary: {
      sheetsCompared: 0,
      cellsCompared: 0,
      differencesFound: 0
    }
  };

  try {
    const workbook1 = new ExcelJS.Workbook();
    const workbook2 = new ExcelJS.Workbook();
    
    await workbook1.xlsx.readFile(filePath1);
    await workbook2.xlsx.readFile(filePath2);

    const sheets1 = workbook1.worksheets;
    const sheets2 = workbook2.worksheets;
    
    // Compare sheet count
    if (sheets1.length !== sheets2.length) {
      result.differences.push(`📊 Sheet count differs: File1 has ${sheets1.length} sheets, File2 has ${sheets2.length} sheets`);
    }

    // Get all unique sheet names
    const allSheetNames = new Set([
      ...sheets1.map(ws => ws.name),
      ...sheets2.map(ws => ws.name)
    ]);

    // Compare each sheet
    for (const sheetName of allSheetNames) {
      const ws1 = workbook1.getWorksheet(sheetName);
      const ws2 = workbook2.getWorksheet(sheetName);
      
      result.sheetDifferences[sheetName] = [];

      if (!ws1) {
        const diff = `📄 Sheet '${sheetName}' missing in File1`;
        result.differences.push(diff);
        result.sheetDifferences[sheetName].push(diff);
        continue;
      }
      if (!ws2) {
        const diff = `📄 Sheet '${sheetName}' missing in File2`;
        result.differences.push(diff);
        result.sheetDifferences[sheetName].push(diff);
        continue;
      }

      result.summary.sheetsCompared++;
      
      // Compare sheet dimensions
      const maxRow1 = ws1.actualRowCount || 0;
      const maxRow2 = ws2.actualRowCount || 0;
      const maxCol1 = ws1.actualColumnCount || 0;
      const maxCol2 = ws2.actualColumnCount || 0;

      if (maxRow1 !== maxRow2) {
        const diff = `📏 Row count differs: ${maxRow1} vs ${maxRow2}`;
        result.differences.push(`📏 Sheet '${sheetName}' row count differs: ${maxRow1} vs ${maxRow2}`);
        result.sheetDifferences[sheetName].push(diff);
      }
      if (maxCol1 !== maxCol2) {
        const diff = `📏 Column count differs: ${maxCol1} vs ${maxCol2}`;
        result.differences.push(`📏 Sheet '${sheetName}' column count differs: ${maxCol1} vs ${maxCol2}`);
        result.sheetDifferences[sheetName].push(diff);
      }

      // Compare all cells in the sheet
      const maxRow = Math.max(maxRow1, maxRow2);
      const maxCol = Math.max(maxCol1, maxCol2);

      for (let row = 1; row <= maxRow; row++) {
        for (let col = 1; col <= maxCol; col++) {
          const cell1 = ws1.getCell(row, col);
          const cell2 = ws2.getCell(row, col);
          
          result.summary.cellsCompared++;

          // Compare cell values with detailed output
          if (cell1.value !== cell2.value) {
            const cellRef = `${String.fromCharCode(64 + col)}${row}`;
            
            // Handle object values and convert to readable format
            const formatValue = (value: any) => {
              if (value === null || value === undefined) return '<EMPTY>';
              if (typeof value === 'object') {
                if (value.constructor.name === 'Object' && JSON.stringify(value) === '{}') {
                  return '<EMPTY_OBJECT>';
                }
                return `<OBJECT:${value.constructor.name}>`;
              }
              return String(value);
            };
            
            const value1 = formatValue(cell1.value);
            const value2 = formatValue(cell2.value);
            const type1 = typeof cell1.value;
            const type2 = typeof cell2.value;
            
            // Skip comparison if both values are [object Object] or similar object representations
            if ((value1.includes('<OBJECT') || value1 === '[object Object]') && 
                (value2.includes('<OBJECT') || value2 === '[object Object]')) {
              console.log(`⏭️ SKIPPING Cell ${cellRef}: Both contain objects - ignoring`);
              continue; // Skip this comparison
            }
            
            // Enhanced display with actual cell values and their differences
            const displayValue1 = value1.length > 50 ? value1.substring(0, 50) + '...' : value1;
            const displayValue2 = value2.length > 50 ? value2.substring(0, 50) + '...' : value2;
            
            const detailedDiff = `🔢 Cell ${cellRef}:\n    📊 File1: "${displayValue1}" (${type1})\n    📊 File2: "${displayValue2}" (${type2})\n    ⚠️  VALUES DIFFER`;
            
            result.differences.push(`🔢 Sheet '${sheetName}' Cell ${cellRef}: '${displayValue1}' ≠ '${displayValue2}'`);
            result.sheetDifferences[sheetName].push(detailedDiff);
            result.summary.differencesFound++;
            
            // Log individual cell differences for immediate visibility
            console.log(`\n🔍 DIFFERENCE FOUND:`);
            console.log(`   Sheet: "${sheetName}"`);
            console.log(`   Cell: ${cellRef}`);
            console.log(`   File1 Value: "${displayValue1}" (${type1})`);
            console.log(`   File2 Value: "${displayValue2}" (${type2})`);
            console.log(`   Status: VALUES DO NOT MATCH`);
          }

          // Compare cell formatting (optional)
          if (cell1.style?.font?.bold !== cell2.style?.font?.bold) {
            const cellRef = `${String.fromCharCode(64 + col)}${row}`;
            const diff = `🎨 Cell ${cellRef}: Bold formatting differs (File1: ${cell1.style?.font?.bold}, File2: ${cell2.style?.font?.bold})`;
            result.differences.push(`🎨 Sheet '${sheetName}' Cell ${cellRef}: Bold formatting differs`);
            result.sheetDifferences[sheetName].push(diff);
          }

          // Compare cell types
          if (cell1.type !== cell2.type) {
            const cellRef = `${String.fromCharCode(64 + col)}${row}`;
            const diff = `📝 Cell ${cellRef}: Type differs (File1: ${cell1.type}, File2: ${cell2.type})`;
            result.differences.push(`📝 Sheet '${sheetName}' Cell ${cellRef}: Type differs (${cell1.type} vs ${cell2.type})`);
            result.sheetDifferences[sheetName].push(diff);
          }
        }
      }
      
      // Remove sheet from differences if no differences found
      if (result.sheetDifferences[sheetName].length === 0) {
        delete result.sheetDifferences[sheetName];
      }
    }

    result.identical = result.differences.length === 0;
    return result;

  } catch (error) {
    result.differences.push(`❌ Error during comparison: ${error}`);
    return result;
  }
}

/**
 * Simple wrapper function for basic comparison (backward compatibility)
 */
export async function compareExcelFiles(filePath1: string, filePath2: string): Promise<string[]> {
  const result = await compareExcelCompletely(filePath1, filePath2);
  return result.differences;
}



/**
 * Fetch campaign group details by Report ID
 * @param request - Playwright APIRequestContext
 * @param reportId - The report ID
 * @returns Promise<any> - The campaign group details
 */
export async function fetchCampaignGroupDetailsByReportId(
  request: APIRequestContext,
  reportId: string
): Promise<any> {
  const BASE_URI = process.env.BASE_URI || '';
  const GetReportDetailsById = process.env.GetReportDetailsById || '';
  
  // Replace {reportId} placeholder in the endpoint
  const endpoint = GetReportDetailsById.replace('{reportId}', reportId);
  
  console.log(`\n🔍 Fetching Campaign Group Details for Report ID: ${reportId}`);
  console.log(`   BASE_URI: ${BASE_URI}`);
  console.log(`   Endpoint: ${endpoint}`);
  
  try {
    const response = await request.get(`${BASE_URI}${endpoint}`);

    if (!response.ok()) {
      throw new Error(`API request failed with status ${response.status()}`);
    }

    const reportDetails = await response.json();
    console.log(`✅ Campaign Group details fetched successfully`);
    
    // Extract campaign group information
    const campaignGroupDetails = {
      campaignGroupId: reportDetails.campaignGroupId || null,
      campaignGroupName: reportDetails.campaignGroupName || null,
      campaignGroupDisplayName: reportDetails.campaignGroupDisplayName || null,
      brand: reportDetails.brand || null,
      advertiser: reportDetails.advertiser || null,
      fullResponse: reportDetails
    };
    
    console.log(`\n📊 Campaign Group Details:`);
    console.log(`   Campaign Group ID: ${campaignGroupDetails.campaignGroupId}`);
    console.log(`   Campaign Group Name: ${campaignGroupDetails.campaignGroupName}`);
    console.log(`   Campaign Group Display Name: ${campaignGroupDetails.campaignGroupDisplayName}`);
    console.log(`   Brand: ${campaignGroupDetails.brand}`);
    console.log(`   Advertiser: ${campaignGroupDetails.advertiser}`);
    
    return campaignGroupDetails;

  } catch (error) {
    console.error(`❌ Error fetching campaign group details for Report ID ${reportId}:`, error);
    throw error;
  }
}

/**
 * Get all text content from Summary sheet
 * @param filePath - Path to the Excel file
 * @returns All text content from Summary sheet as a single string
 */
export async function getSummaryPageContent(filePath: string): Promise<string> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const summarySheet = workbook.getWorksheet('Summary');
    
    if (!summarySheet) {
      throw new Error('Summary sheet not found in the Excel file');
    }
    
    let content = '';
    
    // Iterate through all rows and cells
    summarySheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        const cellValue = cell.value;
        if (cellValue !== null && cellValue !== undefined) {
          // Handle rich text cells
          if (typeof cellValue === 'object' && 'richText' in cellValue) {
            const richTextContent = cellValue.richText.map((rt: any) => rt.text).join('');
            content += richTextContent + ' ';
          } else {
            content += cellValue.toString() + ' ';
          }
        }
      });
      content += '\n';
    });
    
    console.log(`\n📄 Summary Page Content Length: ${content.length} characters`);
    return content;
    
  } catch (error) {
    console.error(`❌ Error reading Summary page content from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get basic structural information about the "Total Campaign" sheet
 * @param filePath - Path to the Excel file
 * @returns Object containing row/column counts and non-empty cell count
 */
export async function getTotalCampaignSheetInfo(filePath: string): Promise<{
  rowCount: number;
  columnCount: number;
  nonEmptyCellCount: number;
}> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheetName = 'Total Campaign';
    const sheet = workbook.getWorksheet(sheetName);

    if (!sheet) {
      throw new Error(`"${sheetName}" sheet not found in the Excel file`);
    }

    const rowCount = sheet.actualRowCount || sheet.rowCount || 0;
    const columnCount = sheet.actualColumnCount || sheet.columnCount || 0;

    let nonEmptyCellCount = 0;
    sheet.eachRow(row => {
      row.eachCell(cell => {
        const value = cell.value;
        if (value !== null && value !== undefined && value.toString().trim() !== '') {
          nonEmptyCellCount++;
        }
      });
    });

    console.log(`\n📊 Total Campaign Sheet Info:`);
    console.log(`   Rows: ${rowCount}, Columns: ${columnCount}, Non-empty cells: ${nonEmptyCellCount}`);

    return { rowCount, columnCount, nonEmptyCellCount };

  } catch (error) {
    console.error(`❌ Error reading Total Campaign sheet from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get basic structural information about a worksheet whose name contains the given text.
 * Useful for validating individual Measured Entity sheets.
 * @param filePath - Path to the Excel file
 * @param nameSubstring - Text to search for in sheet names (case-insensitive)
 * @returns Object with matching sheet name (or null) and basic structure info
 */
export async function getWorksheetInfoByNameSubstring(filePath: string, nameSubstring: string): Promise<{
  sheetName: string | null;
  rowCount: number;
  columnCount: number;
  nonEmptyCellCount: number;
}> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const target = nameSubstring.toLowerCase();
    const worksheet = workbook.worksheets.find(ws => ws.name.toLowerCase().includes(target));

    if (!worksheet) {
      console.log(`\nℹ️ No worksheet found containing name substring: "${nameSubstring}"`);
      return { sheetName: null, rowCount: 0, columnCount: 0, nonEmptyCellCount: 0 };
    }

    const rowCount = worksheet.actualRowCount || worksheet.rowCount || 0;
    const columnCount = worksheet.actualColumnCount || worksheet.columnCount || 0;

    let nonEmptyCellCount = 0;
    worksheet.eachRow(row => {
      row.eachCell(cell => {
        const value = cell.value;
        if (value !== null && value !== undefined && value.toString().trim() !== '') {
          nonEmptyCellCount++;
        }
      });
    });

    console.log(`\n📊 Worksheet Info for substring "${nameSubstring}":`);
   // console.log(`   Sheet: ${worksheet.name}, Rows: ${rowCount}, Columns: ${columnCount}, Non-empty cells: ${nonEmptyCellCount}`);

    return { sheetName: worksheet.name, rowCount, columnCount, nonEmptyCellCount };

  } catch (error) {
    console.error(`❌ Error reading worksheet info for substring "${nameSubstring}" from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get header cells (first row) from a worksheet whose name contains the given text.
 * @param filePath - Path to the Excel file
 * @param nameSubstring - Text to search for in sheet names (case-insensitive)
 * @returns Array of header names (trimmed strings)
 */
export async function getWorksheetHeadersByNameSubstring(filePath: string, nameSubstring: string): Promise<string[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const target = nameSubstring.toLowerCase();
    const worksheet = workbook.worksheets.find(ws => ws.name.toLowerCase().includes(target));

    if (!worksheet) {
      console.log(`\nℹ️ No worksheet found when fetching headers for substring: "${nameSubstring}"`);
      return [];
    }

    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];

    headerRow.eachCell((cell, colNumber) => {
      const value = cell.value;
      if (value !== null && value !== undefined) {
        headers.push(value.toString().trim());
      }
    });

    return headers;

  } catch (error) {
    console.error(`❌ Error reading worksheet headers for substring "${nameSubstring}" from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get a single data row from a worksheet whose name contains the given text,
 * using the specified header and data row indices. Returns an object keyed
 * by header names.
 * @param filePath - Path to the Excel file
 * @param nameSubstring - Text to search for in sheet names (case-insensitive)
 * @param headerRowIndex - 1-based row index for headers (default 1)
 * @param dataRowIndex - 1-based row index for data (default 2)
 */
export async function getWorksheetRowDataByNameSubstring(
  filePath: string,
  nameSubstring: string,
  headerRowIndex: number = 1,
  dataRowIndex: number = 2
): Promise<Record<string, any> | null> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const target = nameSubstring.toLowerCase();
    const worksheet = workbook.worksheets.find(ws => ws.name.toLowerCase().includes(target));

    if (!worksheet) {
      console.log(`\nℹ️ No worksheet found when fetching row data for substring: "${nameSubstring}"`);
      return null;
    }

    const headerRow = worksheet.getRow(headerRowIndex);
    const dataRow = worksheet.getRow(dataRowIndex);

    const headers: string[] = [];
    headerRow.eachCell((cell, colNumber) => {
      const key = cell.value?.toString().trim();
      headers.push(key || `Column${colNumber}`);
    });

    const rowData: Record<string, any> = {};
    let hasData = false;

    headers.forEach((header, index) => {
      const colNumber = index + 1;
      const cellValue = dataRow.getCell(colNumber).value;
      if (cellValue !== null && cellValue !== undefined && cellValue.toString().trim() !== '') {
        hasData = true;
        if (typeof cellValue === 'number') {
          rowData[header] = cellValue;
        } else {
          rowData[header] = cellValue.toString().trim();
        }
      }
    });

    if (!hasData) {
      console.log(`\nℹ️ No data found on row ${dataRowIndex} for worksheet "${worksheet.name}"`);
      return null;
    }

    return rowData;

  } catch (error) {
    console.error(`❌ Error reading worksheet row data for substring "${nameSubstring}" from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get key/value style row data from the "Total Campaign" sheet.
 * Assumes row 2 contains column headers and data starts from row 3.
 * Each row is returned as an object keyed by the header text.
 * @param filePath - Path to the Excel file
 * @returns Array of row data objects
 */
export async function getTotalCampaignData(filePath: string): Promise<any[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheetName = 'Total Campaign';
    const sheet = workbook.getWorksheet(sheetName);

    if (!sheet) {
      throw new Error(`"${sheetName}" sheet not found in the Excel file`);
    }
    const data: any[] = [];
    const headerRowIndex = 1; // Headers are expected on row 1
    const valueRowIndex = 2;  // Values are expected on row 2

    const headerRow = sheet.getRow(headerRowIndex);
    const valueRow = sheet.getRow(valueRowIndex);
    const headers: string[] = [];

    // Collect header names from the header row (row 1)
    headerRow.eachCell((cell, colNumber) => {
      const key = cell.value?.toString().trim();
      headers.push(key || `Column${colNumber}`);
    });


    headers.forEach((header, index) => {
      console.log(`   ${index + 1}. ${header}`);
    });

    // Build key/value pairs using row 1 as header and row 2 as values
    const rowData: any = {};
    let hasData = false;

    headers.forEach((header, index) => {
      const colNumber = index + 1;
      const cellValue = valueRow.getCell(colNumber).value;
      const displayValue = cellValue !== null && cellValue !== undefined
        ? cellValue.toString().trim()
        : '';

      console.log(`   ${header}: ${displayValue}`);

      if (displayValue !== '') {
        hasData = true;
        // Preserve original numeric values (including negatives) without reformatting
        if (typeof cellValue === 'number') {
          rowData[header] = cellValue;
        } else {
          rowData[header] = displayValue;
        }
      }
    });

    if (hasData) {
      data.push(rowData);
    }

    console.log(`\n📊 Total Campaign Data Rows Returned: ${data.length}`);
    return data;

  } catch (error) {
    console.error(`❌ Error reading Total Campaign data from ${filePath}:`, error);
    throw error;
  }
}



/**
 * Get column headers from Net Campaign Delivery - Reach & Frequency sheet
 * @param filePath - Path to the Excel file
 * @returns Array of column header names
 */
export async function getNetCampaignDeliveryHeaders(filePath: string): Promise<string[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const sheet = workbook.getWorksheet('Net Campaign Delivery - Reach & Frequency');
    
    if (!sheet) {
      throw new Error('Net Campaign Delivery - Reach & Frequency sheet not found in the Excel file');
    }
    
    const headers: string[] = [];
    const headerRow = sheet.getRow(2); // Headers are typically in row 2
    
    headerRow.eachCell((cell, colNumber) => {
      const key = cell.value?.toString().trim();
      if (key) {
        headers.push(key);
      }
    });
    
    console.log(`\n📋 Net Campaign Delivery Column Headers (${headers.length} columns)`);
    return headers;
    
  } catch (error) {
    console.error(`❌ Error reading Net Campaign Delivery headers from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get the title text from Net Campaign Delivery - Reach & Frequency sheet (e.g. cell A1)
 * @param filePath - Path to the Excel file
 * @returns Title string from the sheet
 */
export async function getNetCampaignDeliveryTitle(filePath: string): Promise<string> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet('Net Campaign Delivery - Reach & Frequency');

    if (!sheet) {
      throw new Error('Net Campaign Delivery - Reach & Frequency sheet not found in the Excel file');
    }

    const titleCell = sheet.getRow(1).getCell(1);
    const title = titleCell.value?.toString().trim() || '';

    console.log(`\n📋 Net Campaign Delivery Sheet Title: "${title}"`);
    return title;

  } catch (error) {
    console.error(`❌ Error reading Net Campaign Delivery title from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get all data from Net Campaign Delivery - Reach & Frequency sheet
 * @param filePath - Path to the Excel file
 * @returns Array of row data objects
 */
export async function getNetCampaignDeliveryData(filePath: string): Promise<any[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Detailed Net Campaign Delivery breakdown lives on the
    // "Net Campaign Delivery - Reach & Frequency" sheet
    const sheet = workbook.getWorksheet('Net Campaign Delivery - Reach & Frequency');
    
    if (!sheet) {
      throw new Error('Net Campaign Delivery - Reach & Frequency sheet not found in the Excel file');
    }
    
    const data: any[] = [];
    const headerRow = sheet.getRow(2);
    const headers: string[] = [];
    
    // Get header names
    headerRow.eachCell((cell, colNumber) => {
      const key = cell.value?.toString().trim();
      headers.push(key || `Column${colNumber}`);
    });
    
    // Read data rows (starting from row 3)
    const totalRows = sheet.rowCount;
    for (let rowNum = 3; rowNum <= totalRows; rowNum++) {
      const row = sheet.getRow(rowNum);
      const rowData: any = {};
      let hasData = false;
      
      row.eachCell((cell, colNumber) => {
        const headerIndex = colNumber - 1;
        const headerName = headers[headerIndex];
        const cellValue = cell.value;
        
        if (cellValue !== null && cellValue !== undefined) {
          hasData = true;
          // Map to camelCase property names
          switch (headerName?.toLowerCase()) {
            case 'measured entity':
              rowData.measuredEntity = cellValue.toString().trim();
              break;
            case 'media type':
              rowData.mediaType = cellValue.toString().trim();
              break;
            case 'impression filter':
              rowData.impressionFilter = cellValue.toString().trim();
              break;
            case 'total net campaign reach':
              rowData.totalNetCampaignReach = cellValue;
              break;
            case 'total net campaign reach%':
              rowData.totalNetCampaignReachPercent = cellValue;
              break;
            case 'average frequency':
              rowData.averageFrequency = cellValue;
              break;
            default:
              rowData[headerName] = cellValue;
          }
        }
      });
      
      if (hasData) {
        data.push(rowData);
      }
    }
    
    console.log(`\n📊 Net Campaign Delivery Data: ${data.length} rows`);
    return data;
    
  } catch (error) {
    console.error(`❌ Error reading Net Campaign Delivery data from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get Net Campaign Delivery data from Summary sheet
 * @param filePath - Path to the Excel file
 * @returns Net Campaign Delivery data object from Summary sheet
 */
export async function getNetCampaignDeliverySummaryData(filePath: string): Promise<any> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const summarySheet = workbook.getWorksheet('Summary');
    
    if (!summarySheet) {
      throw new Error('Summary sheet not found in the Excel file');
    }
    
    // Find the Net Campaign Delivery section
    let netCampaignDeliveryStartRow = -1;
    let headerRowNum = -1;
    
    summarySheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        const cellValue = cell.value?.toString() || '';
        if (cellValue.includes('Net Campaign Delivery - Reach & Frequency')) {
          netCampaignDeliveryStartRow = rowNumber;
        }
        if (netCampaignDeliveryStartRow > 0 && rowNumber > netCampaignDeliveryStartRow && cellValue === 'Measured Entity') {
          headerRowNum = rowNumber;
        }
      });
    });
    
    if (headerRowNum === -1) {
      // Try finding headers directly
      summarySheet.eachRow((row, rowNumber) => {
        let hasMeasuredEntity = false;
        row.eachCell((cell) => {
          if (cell.value?.toString().trim() === 'Measured Entity') {
            hasMeasuredEntity = true;
            headerRowNum = rowNumber;
          }
        });
      });
    }
    
    if (headerRowNum === -1) {
      console.log('⚠️ Net Campaign Delivery headers not found in Summary sheet');
      return null;
    }
    
    // Get header positions
    const headerRow = summarySheet.getRow(headerRowNum);
    const headerPositions: { [key: string]: number } = {};
    
    headerRow.eachCell((cell, colNumber) => {
      const headerName = cell.value?.toString().trim();
      if (headerName) {
        headerPositions[headerName.toLowerCase()] = colNumber;
      }
    });
    
    // Get data from the row after headers
    const dataRow = summarySheet.getRow(headerRowNum + 1);
    const data: any = {};
    
    // Map the values
    data.measuredEntity = dataRow.getCell(headerPositions['measured entity'] || 1).value?.toString().trim() || '';
    data.mediaType = dataRow.getCell(headerPositions['media type'] || 2).value?.toString().trim() || '';
    data.impressionFilter = dataRow.getCell(headerPositions['impression filter'] || 3).value?.toString().trim() || '';
    
    const reachValue = dataRow.getCell(headerPositions['total net campaign reach'] || 4).value;
    data.totalNetCampaignReach = typeof reachValue === 'number' ? reachValue.toLocaleString() : reachValue?.toString().trim() || '';
    
    const reachPercentValue = dataRow.getCell(headerPositions['total net campaign reach%'] || 5).value;
    if (typeof reachPercentValue === 'number') {
      data.totalNetCampaignReachPercent = (reachPercentValue * 100).toFixed(2) + '%';
    } else {
      data.totalNetCampaignReachPercent = reachPercentValue?.toString().trim() || '';
    }
    
    data.averageFrequency = dataRow.getCell(headerPositions['average frequency'] || 6).value?.toString().trim() || '';
    
    console.log(`\n📊 Net Campaign Delivery Summary Data extracted`);
    return data;
    
  } catch (error) {
    console.error(`❌ Error reading Net Campaign Delivery from Summary sheet:`, error);
    throw error;
  }
}

/**
 * Get all text content from Total Campaign sheet
 * @param filePath - Path to the Excel file
 * @returns All text content from Total Campaign sheet as a single string
 */
export async function getTotalCampaignPageContent(filePath: string): Promise<string> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet('Total Campaign');

    if (!sheet) {
      throw new Error('Total Campaign sheet not found in the Excel file');
    }

    let content = '';

    // Iterate through all rows and cells, similar to Summary sheet content reader
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        const cellValue = cell.value;
        if (cellValue !== null && cellValue !== undefined) {
          // Handle rich text cells
          if (typeof cellValue === 'object' && 'richText' in cellValue) {
            const richTextContent = cellValue.richText.map((rt: any) => rt.text).join('');
            content += richTextContent + ' ';
          } else {
            content += cellValue.toString() + ' ';
          }
        }
      });
      content += '\n';
    });

    console.log(`\n📄 Total Campaign Sheet Content Length: ${content.length} characters`);
    return content;

  } catch (error) {
    console.error(`❌ Error reading Total Campaign page content from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get text content for specific rows from the Total Campaign sheet.
 * Useful for validating fixed-position explanatory text (e.g. rows 5 and 6).
 * @param filePath - Path to the Excel file
 * @param rowNumbers - Array of 1-based row indices to read
 * @returns Array of row text, in the same order as rowNumbers
 */
export async function getTotalCampaignRowsText(filePath: string, rowNumbers: number[]): Promise<string[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.getWorksheet('Total Campaign');

    if (!sheet) {
      throw new Error('Total Campaign sheet not found in the Excel file');
    }

    const results: string[] = [];

    for (const rowNumber of rowNumbers) {
      const row = sheet.getRow(rowNumber);
      let rowText = '';

      row.eachCell((cell, colNumber) => {
        const cellValue = cell.value;
        if (cellValue !== null && cellValue !== undefined) {
          if (typeof cellValue === 'object' && 'richText' in cellValue) {
            const richTextContent = cellValue.richText.map((rt: any) => rt.text).join('');
            rowText += richTextContent + ' ';
          } else {
            rowText += cellValue.toString() + ' ';
          }
        }
      });

      results.push(rowText.trim());
    }

    console.log(`\n📄 Total Campaign Rows Text fetched for rows: ${rowNumbers.join(', ')}`);
    return results;

  } catch (error) {
    console.error(`❌ Error reading Total Campaign rows text from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Get all worksheet names from the Excel file
 * @param filePath - Path to the Excel file
 * @returns Array of sheet names
 */
export async function getAllWorksheetNames(filePath: string): Promise<string[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const names = workbook.worksheets.map(ws => ws.name);
    console.log(`\n📄 Worksheet names in workbook: ${names.join(', ')}`);
    return names;

  } catch (error) {
    console.error(`❌ Error reading worksheet names from ${filePath}:`, error);
    throw error;
  }
}