import { shouldUseNativeTabs } from '../should-use-native-tabs'

describe('shouldUseNativeTabs', () => {
  it('only enables native tabs when explicitly enabled in a standalone build', () => {
    expect(shouldUseNativeTabs(true, true, 5)).toBe(true)
    expect(shouldUseNativeTabs(true, false, 5)).toBe(false)
    expect(shouldUseNativeTabs(true, undefined, 5)).toBe(false)
    expect(shouldUseNativeTabs(false, true, 5)).toBe(false)
    expect(shouldUseNativeTabs(true, true, 6)).toBe(false)
  })
})
