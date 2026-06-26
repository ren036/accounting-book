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
            className="category-option"
            type="button"
            role="radio"
            aria-checked={category === value}
            key={category}
            onClick={() => onChange(category)}
          >
            <span className={category === value ? 'category-icon-button active' : 'category-icon-button'}>
              <CategoryEmoji category={category} />
            </span>
            <span className="category-option-label">{category}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
