import { CategoryEmoji } from './CategoryEmoji'
import { fieldClass } from '../ui/classes'

type CategoryPickerProps = {
  categories: string[]
  value: string
  onChange: (value: string) => void
}

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  return (
    <div className={fieldClass}>
      <span>分类</span>
      <div className="grid max-h-[155px] grid-cols-[repeat(auto-fill,minmax(54px,1fr))] gap-2 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="radiogroup" aria-label="分类" data-scroll="vertical" data-layout="responsive">
        {categories.map((category) => (
          <button
            className="grid justify-items-center border-0 bg-transparent p-0 text-xs text-gray-600"
            type="button"
            role="radio"
            aria-checked={category === value}
            key={category}
            onClick={() => onChange(category)}
          >
            <span className={categoryIconClass(category === value)}>
              <CategoryEmoji category={category} />
            </span>
            <span className="mt-0.5 leading-[1.2]">{category}</span>
          </button>
        ))}
      </div>
    </div>
  )
}


function categoryIconClass(active: boolean): string {
  const baseClass = 'h-10 w-10 rounded-2xl border [&>span]:flex [&>span]:h-full [&>span]:w-full [&>span]:items-center [&>span]:justify-center [&>span]:text-lg [&>span]:leading-10'
  return active ? baseClass + ' border-amber-400 bg-amber-400' : baseClass + ' border-gray-200 bg-neutral-100'
}
