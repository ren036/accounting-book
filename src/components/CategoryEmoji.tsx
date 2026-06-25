import { getCategoryEmoji } from '../domain/icons'

type CategoryEmojiProps = {
  category: string
}

export function CategoryEmoji({ category }: CategoryEmojiProps) {
  return (
    <span className="category-emoji" aria-hidden="true">
      {getCategoryEmoji(category)}
    </span>
  )
}
