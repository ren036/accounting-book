import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadBlob } from '../lib/download'

describe('downloadBlob', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('attaches a temporary link before triggering the download', () => {
    vi.useFakeTimers()

    const click = vi.fn()
    const appendChild = vi.fn()
    const removeChild = vi.fn()
    const link = {
      href: '',
      download: '',
      rel: '',
      style: { display: '' },
      click
    }
    const createObjectURL = vi.fn(() => 'blob:test-url')
    const revokeObjectURL = vi.fn()

    vi.stubGlobal('document', {
      body: { appendChild, removeChild },
      createElement: vi.fn(() => link)
    })
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const blob = new Blob(['backup'])

    downloadBlob(blob, 'accounting-book.xlsx')

    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(link.href).toBe('blob:test-url')
    expect(link.download).toBe('accounting-book.xlsx')
    expect(link.rel).toBe('noopener')
    expect(link.style.display).toBe('none')
    expect(appendChild).toHaveBeenCalledWith(link)
    expect(click).toHaveBeenCalledOnce()
    expect(removeChild).toHaveBeenCalledWith(link)
    expect(revokeObjectURL).not.toHaveBeenCalled()

    vi.runAllTimers()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-url')
  })
})
