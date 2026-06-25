# Excel Import Design

## Goal

Allow the settings import flow to import transaction records from old `.xls` files like `src/components/export.xls`, while keeping JSON backup import working.

## File Support

The app supports these import file types:

- `.json`: existing app backup format.
- `.xls`: old binary Excel workbooks.
- `.xlsx`: modern Excel workbooks.

Excel parsing happens entirely in the browser. No data is uploaded to a server.

## Excel Column Mapping

For the sample workbook, each row maps by column position:

- Column 1: date, for example `2024-05-06`.
- Column 2: transaction type, `收入` or `支出`.
- Column 3: income amount.
- Column 4: expense amount.
- Column 5: note.
- Column 6: account/book name, ignored.
- Column 7: primary category, stored as `category`.
- Column 8: secondary category, ignored.

The resulting transaction shape is the minimal local model:

- `id`: generated with `crypto.randomUUID()`.
- `type`: `income` for `收入`, `expense` for `支出`.
- `amount`: income amount for income rows, expense amount for expense rows.
- `category`: column 7 primary category.
- `note`: column 5 note, trimmed.
- `occurredAt`: date converted to `YYYY-MM-DDT00:00:00.000Z`.

## Skipping Invalid Rows

Excel import skips rows that do not contain a valid transaction:

- Empty rows.
- Rows with a type other than `收入` or `支出`.
- Rows where the selected amount column is missing, non-numeric, or less than or equal to zero.
- Rows where the date cannot be interpreted as a valid date.

## UI Behavior

The settings import file input accepts `.json,.xls,.xlsx`.

When a JSON file is selected, the existing backup parser is used.

When an Excel file is selected, the Excel parser is used.

After import, the app writes parsed transactions into IndexedDB, refreshes the UI, and shows a summary message: `导入完成：成功 N 条，跳过 M 条。`

## Dependency

Use the `xlsx` package for browser-side workbook parsing. This is the smallest practical change that supports old `.xls` and modern `.xlsx` files without adding a server.

## Out Of Scope

This change does not add duplicate detection. Importing the same Excel file twice creates duplicate transactions.

This change does not import secondary category into note or category.
