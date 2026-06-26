# Import Export Design

## Goal

Add explicit JSON and Excel export choices, and keep a single import entry that accepts JSON and Excel files. Excel export should show the `transactions` array as worksheet rows instead of hiding it inside one JSON string cell. Excel import must support the same exported worksheet format and the existing specially handled Excel format.

## Current Context

The app already has:

- JSON backup serialization and parsing in `src/lib/backup.ts`.
- Excel backup/readable sheet helpers in `src/lib/excelBackup.ts`.
- A historical fixed-column Excel parser in `src/lib/excelImport.ts`.
- Settings import/export UI in `src/pages/SettingsPage.tsx`.
- `saveTransaction(transaction)` persists by transaction ID, so importing a transaction with an existing ID overwrites that existing transaction.

## Export Design

Settings will provide two export actions:

- `导出 JSON`: writes `accounting-book-YYYY-MM-DD.json` using `serializeBackup(transactions)`.
- `导出 Excel`: writes `accounting-book-YYYY-MM-DD.xlsx` using an Excel workbook with a `Transactions` worksheet.

The Excel `Transactions` worksheet will represent the transaction objects directly:

| id | type | amount | category | note | occurredAt |
| --- | --- | --- | --- | --- | --- |

Each transaction becomes one row. This makes the worksheet match the `transactions` array content and preserves IDs for restore/overwrite behavior.

## Import Design

Settings will keep one file input accepting `.json`, `.xls`, and `.xlsx`.

For `.json` files:

- Parse with `parseBackup(await file.text())`.
- Save each parsed transaction with `saveTransaction`.
- Existing IDs are overwritten.

For `.xls` and `.xlsx` files, try parsers in this order:

1. Exported worksheet format: `Transactions` sheet with `id/type/amount/category/note/occurredAt` columns.
2. Existing readable worksheet format: `Transactions` sheet with `日期/类型/金额/分类/备注` columns.
3. Existing special historical format handled by `parseExcelFile`.

The first matching parser returns transactions to save. Invalid non-empty rows are skipped for row-based Excel formats. Empty rows are ignored.

## Error Handling

- Unsupported file extensions throw `不支持的导入文件格式`.
- JSON parsing keeps the existing `parseBackup` validation error behavior.
- Excel parsing should only claim a format matches when required headers and valid rows are present or the sheet is structurally recognizable.
- Import success messages include successful and skipped row counts when skip counts are available.

## Tests

Add or adjust tests for:

- JSON export produces a backup with a `transactions` array.
- Excel export creates a `Transactions` worksheet with one row per transaction and object-field headers.
- Excel import of the exported worksheet format preserves IDs.
- Existing readable Excel import still works.
- Existing special historical Excel import still works.

## Out Of Scope

- No multi-step import wizard.
- No duplicate detection beyond ID overwrite.
- No schema version migration beyond the existing JSON backup version.
