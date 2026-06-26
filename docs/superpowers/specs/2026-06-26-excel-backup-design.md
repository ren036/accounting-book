# Excel Backup Import and Export Design

## Goal

Replace the default backup export from JSON to Excel while keeping JSON import working and preserving the existing special historical Excel import logic.

The Excel backup should be both restorable by the app and readable by a person opening the file in Excel or Numbers.

## File Support

The settings import flow supports these files:

- `.json`: existing app backup format, parsed with the current JSON backup parser.
- `.xlsx`: app Excel backup files and readable transaction spreadsheets.
- `.xls`: readable transaction spreadsheets and historical export files.

Excel parsing and generation happen entirely in the browser. No data is uploaded to a server.

## Export Format

The settings export button downloads `accounting-book-YYYY-MM-DD.xlsx`.

The workbook contains two sheets:

- `Backup`: machine-readable backup data.
- `Transactions`: human-readable transaction rows.

`Backup` stores the current backup object as key/value rows:

- `version`: backup version, currently `1`.
- `exportedAt`: ISO timestamp.
- `transactions`: JSON string containing the transaction array.

This keeps the app backup schema aligned with the existing JSON backup format while using an Excel container.

`Transactions` stores readable columns:

- `日期`: transaction date as `YYYY-MM-DD`.
- `类型`: `收入` or `支出`.
- `金额`: transaction amount.
- `分类`: category.
- `备注`: note.

The readable sheet is not the authoritative backup when a valid `Backup` sheet exists. It is included for review and simple manual editing use cases.

## Import Priority

When importing `.xls` or `.xlsx`, the app tries parsers in this order:

1. App Excel backup parser: reads the `Backup` sheet and restores the full backup object.
2. Readable transaction parser: reads a `Transactions` sheet with the readable columns above.
3. Historical Excel parser: preserves the existing special fixed-column logic for old files like `src/components/export.xls`.

JSON import continues to use the existing JSON backup parser directly.

## Readable Excel Import Rules

Readable transaction import accepts rows from the `Transactions` sheet after the header row.

Rows are imported when they have:

- A valid date in `YYYY-MM-DD` format.
- A type of `收入` or `支出`.
- A positive numeric amount.

Imported rows generate new transaction IDs with `crypto.randomUUID()`. Empty or invalid rows are skipped.

## UI Behavior

The settings page keeps one export button and one import control.

The export button label remains `导出备份`, but downloads an Excel file instead of JSON.

The import control accepts `.json,.xls,.xlsx`.

After importing, the app writes parsed transactions into IndexedDB, refreshes the UI, and shows a summary message. Excel imports include success and skipped counts when a row-based parser is used.

## Error Handling

Unsupported file extensions still show `不支持的导入文件格式`.

Invalid backup files still use the existing backup error message where possible.

If a readable or historical Excel file contains no valid transactions, the import completes with zero successful rows and the appropriate skipped count.

## Testing

Tests cover:

- JSON backup serialization and parsing remains unchanged.
- Excel backup export can be parsed back into the same transactions.
- Readable `Transactions` sheet import maps rows to transactions.
- Existing historical Excel row parsing still works.

## Out Of Scope

This change does not add duplicate detection. Importing the same backup or spreadsheet twice can create duplicates unless transaction IDs match and overwrite existing records.

This change does not add multiple export buttons.

This change does not remove JSON import support.
