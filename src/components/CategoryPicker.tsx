import { CategoryEmoji } from './CategoryEmoji'

type CategoryPickerProps = {
  categories: string[]
  value: string
  onChange: (value: string) => void
}

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  return (
    <div className="field">
      <span>分类</span>
      <div className="category-picker" role="radiogroup" aria-label="分类">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={category === value ? 'active' : ''}
            role="radio"
            aria-checked={category === value}
            onClick={() => onChange(category)}
          >
            <CategoryEmoji category={category} />
            <span>{category}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
