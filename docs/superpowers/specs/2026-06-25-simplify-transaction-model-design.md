# Simplify Transaction Model Design

## Goal

Simplify the local-only transaction data model by removing fields that exist only for soft deletion, synchronization, or unused timestamps.

## Chosen Approach

Use a minimal local model with these fields only:

- `id`: unique transaction identifier for editing and deleting.
- `type`: `income` or `expense`.
- `amount`: transaction amount.
- `category`: category label.
- `note`: optional user note as a string.
- `occurredAt`: transaction date/time string used for month/year filtering and ordering.

Remove these fields from the active model:

- `deletedAt`: no longer needed because deleting a transaction permanently removes it from IndexedDB.
- `syncStatus`: no longer needed because the app is local-only and does not sync to a server.
- `createdAt`: not displayed, filtered, or required for local behavior.
- `updatedAt`: not displayed and only used as a secondary same-day sort key; the simplified model does not preserve edit-time ordering.

## Data Flow

Creating a transaction writes only the minimal fields.

Editing a transaction preserves its `id` and replaces editable fields.

Deleting a transaction calls IndexedDB `delete(id)` instead of updating a tombstone field.

Importing backups accepts both old and new backup shapes. Old backup records may include `createdAt`, `updatedAt`, `deletedAt`, or `syncStatus`; parsing strips those fields and returns only the minimal model. Records with an old `deletedAt` value are ignored during import because they represented already-deleted transactions.

Exporting backups serializes the current minimal records only.

## Database

Dexie schema moves to a new version with indexes for the fields still needed by the app: `id`, `type`, `category`, and `occurredAt`.

The version upgrade rewrites existing stored transactions to the minimal shape and drops records that were soft-deleted under the old model.

## Testing

Tests should cover:

- Backup parsing strips removed fields from old records.
- Backup parsing skips old soft-deleted records.
- Updating a transaction no longer writes `deletedAt`, `syncStatus`, `createdAt`, or `updatedAt`.
- Summary functions count all provided transactions without `deletedAt` filtering.

## Scope

This change does not add restore-from-trash, cloud sync, or per-time same-day ordering.
