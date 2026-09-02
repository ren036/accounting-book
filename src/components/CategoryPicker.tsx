import { CategoryEmoji, getCategoryVisual } from './CategoryEmoji'

type CategoryPickerProps = { categories: string[]; value: string; onChange: (value: string) => void }

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  return (
    <section className="rounded-[var(--book-radius-card)] bg-white px-4 py-5 shadow-[var(--book-shadow-card)]">
      <h2 className="m-0 mb-4 text-sm font-semibold">选择分类</h2>
      <div className="grid grid-cols-5 gap-x-2 gap-y-4 pb-1" role="radiogroup" aria-label="账单分类">
        {categories.map((category) => {
          const active = category === value
          const visual = getCategoryVisual(category)
          return (
            <button className="flex min-w-0 flex-col items-center border-0 bg-transparent p-0" type="button" role="radio" aria-checked={active} key={category} onClick={() => onChange(category)}>
              <span className={`grid size-11 place-items-center rounded-2xl transition-[transform,box-shadow] duration-100 active:scale-95 ${active ? 'ring-2 ring-[var(--book-green)] ring-offset-2' : ''}`} style={{ background: visual.background }}>
                <CategoryEmoji category={category} />
              </span>
              <span className={`mt-1.5 max-w-full truncate text-xs ${active ? 'font-semibold text-[var(--book-green)]' : 'text-[var(--book-muted)]'}`}>{category}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
