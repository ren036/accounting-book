import { createRoot } from 'react-dom/client'
import type { ReactElement } from 'react'
import { unstableSetRender } from 'antd-mobile'
import 'antd-mobile/es/global'
import { App } from './App'
import './styles.css'

unstableSetRender((node: ReactElement, container: Element | DocumentFragment) => {
  const root = createRoot(container)
  root.render(node)
  return async () => root.unmount()
})

createRoot(document.getElementById('root')!).render(<App />)
