/*
 * @Author: czy0729
 * @Date: 2026-07-25 23:00:00
 * @Last Modified by: czy0729
 * @Last Modified time: 2026-07-25 23:00:00
 */
import {
  requireNativeViewManager,
  requireOptionalNativeModule
} from 'expo-modules-core'

import type { PropsWithChildren } from 'react'
import type { NativeSyntheticEvent, ViewProps } from 'react-native'

const MODULE_NAME = 'BangumiNativeMenu'

export type NativeMenuSelectEvent = {
  index: number
  pageX: number
  pageY: number
}

type Props = PropsWithChildren<
  ViewProps & {
    items: string[]
    title?: string
    activateOn: 'tap' | 'hold'
    onSelect: (event: NativeSyntheticEvent<NativeMenuSelectEvent>) => void
  }
>

export const NativeMenuView = requireOptionalNativeModule(MODULE_NAME)
  ? requireNativeViewManager<Props>(MODULE_NAME)
  : null
