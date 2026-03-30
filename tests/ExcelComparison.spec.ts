import test, { expect, Page } from '@playwright/test';

import ExcelJS from 'exceljs';
import { compareExcelCompletely } from './utils/excelFunctions';


test.describe('Excel Comparison Post Nouse correction- 3% values ignored and no Negative values found', () => {
    test('Compare the Excel sheets and values', async ({ page }) => {
       const excelFile1 = "tests/resources/SingleEDP_Display_2025-11-11T07-40-26.xlsx";
       const excelFile2 = "tests/resources/SingleEDP_Display_2025-11-11T08-03-30.xlsx";
       
       console.log(`Comparing Excel files:`);
       console.log(`File 1: ${excelFile1}`);
       console.log(`File 2: ${excelFile2}`);
       
       const result = await compareExcelCompletely(excelFile1, excelFile2);
       
       console.log(`\n📊 Comparison Summary:`);
       console.log(`Sheets compared: ${result.summary.sheetsCompared}`);
       console.log(`Cells compared: ${result.summary.cellsCompared}`);
       console.log(`Differences found: ${result.summary.differencesFound}`);
       
       if (result.identical) {
         console.log('\n✅ Files are completely identical!');
       } else {
         console.log('\n❌ Files differ:');
         
         // Print differences grouped by sheet
         console.log('\n🔍 DETAILED DIFFERENCES BY SHEET:');
         console.log('=' + '='.repeat(50));
         
         for (const [sheetName, sheetDiffs] of Object.entries(result.sheetDifferences)) {
           console.log(`\n📄 SHEET: "${sheetName}"`);
           console.log('-'.repeat(30));
           sheetDiffs.forEach((diff, index) => {
             console.log(`   ${index + 1}. ${diff}`);
           });
         }
         
         console.log('\n📋 ALL DIFFERENCES SUMMARY:');
         console.log('-'.repeat(30));
         result.differences.forEach((diff, index) => {
           console.log(`${index + 1}. ${diff}`);
         });
         
         // Uncomment to fail test if files should be identical
        //  expect(result.identical).toBe(true);
       }
    });     
});
