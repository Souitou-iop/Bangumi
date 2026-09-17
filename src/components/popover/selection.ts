/*
 * @Author: czy0729
 * @Date: 2026-07-25 23:00:00
 * @Last Modified by: czy0729
 * @Last Modified time: 2026-07-25 23:00:00
 */
import type { NativeMenuSelectEvent } from './native-menu'

export function getNativeMenuSelection<Data extends readonly string[]>(
  data: Data,
  event: NativeMenuSelectEvent
): [Data[number], number, { pageX: number; pageY: number }] | undefined {
  const { index, pageX, pageY } = event
  if (!Number.isInteger(index) || index < 0 || index >= data.length) return

  return [data[index], index, { pageX, pageY }]
}
