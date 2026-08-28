import { getCategoryEmoji } from '../domain/icons'

type CategoryEmojiProps = {
  category: string
}

export function CategoryEmoji({ category }: CategoryEmojiProps) {
  return (
    <span aria-hidden="true">
      {getCategoryEmoji(category)}
    </span>
  )
}
