/*
 * @Author: czy0729
 * @Date: 2026-07-25 23:00:00
 * @Last Modified by: czy0729
 * @Last Modified time: 2026-07-25 23:00:00
 */
import { getNativeMenuSelection } from '../selection'

describe('getNativeMenuSelection', () => {
  it('按原生索引选择重复文案中的正确项', () => {
    const result = getNativeMenuSelection(['重复', '重复'] as const, {
      index: 1,
      pageX: 120,
      pageY: 240
    })

    expect(result).toEqual(['重复', 1, { pageX: 120, pageY: 240 }])
  })

  it('忽略越界索引', () => {
    expect(
      getNativeMenuSelection(['菜单'] as const, {
        index: -1,
        pageX: 0,
        pageY: 0
      })
    ).toBeUndefined()
  })
})
