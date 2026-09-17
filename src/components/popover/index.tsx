/*
 * @Author: czy0729
 * @Date: 2022-05-02 11:29:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2026-09-17 23:40:00
 */
import { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { systemStore } from '@stores'
import { r } from '@utils/dev'
import { IOS } from '@constants'
import { HoldItem } from '../hold-menu'
import { NativeMenuView } from './native-menu'
import { getNativeMenuSelection } from './selection'
import { usePopoverItems } from './hooks'
import { toMenuLabel, toMenuLabels, usePopoverList } from './utils'
import { COMPONENT, MENU_CLOSE_DELAY } from './ds'

import type { NativeSyntheticEvent } from 'react-native'
import type { NativeMenuSelectEvent } from './native-menu'
import type { PopoverComponent, PopoverData, Props as PopoverProps } from './types'
export type { PopoverProps, PopoverData }

/** 系统原生菜单 (iOS: BangumiNativeMenu, 带关闭触摸穿透屏蔽) */
function NativeMenuPopover<Data extends PopoverData>({
  data,
  title = '',
  style,
  activateOn,
  onSelect,
  children
}: PopoverProps<Data>) {
  const list = usePopoverList(data)

  /** 简繁开关变化需要重新派生菜单文案, 故读出作为 memo 依赖 */
  const s2tEnabled = systemStore.setting.s2t

  const items = useMemo(() => (s2tEnabled ? toMenuLabels(list) : list.slice()), [list, s2tEnabled])

  const handleSelect = useCallback(
    (event: NativeSyntheticEvent<NativeMenuSelectEvent>) => {
      const selection = getNativeMenuSelection(list, event.nativeEvent)
      if (!selection) return

      // 等菜单收起动画结束再触发动作, 避免跳转/弹窗与关闭动画重叠
      setTimeout(() => onSelect?.(...selection), MENU_CLOSE_DELAY)
    },
    [list, onSelect]
  )

  return (
    <NativeMenuView
      style={style}
      items={items}
      title={toMenuLabel(title)}
      activateOn={activateOn === 'hold' ? 'hold' : 'tap'}
      onSelect={handleSelect}
    >
      {children}
    </NativeMenuView>
  )
}

/** 点击位置弹出层 (iOS: react-native-hold-menu, 原生菜单不可用时的回落) */
function HoldMenuPopover<Data extends PopoverData>({
  data,
  title = '',
  style,
  activateOn,
  onSelect,
  onLongPress,
  children
}: PopoverProps<Data>) {
  const { items, activateOn: popoverActivateOn } = usePopoverItems({
    data,
    title,
    onSelect,
    onLongPress,
    activateOn
  })

  return (
    <View style={style}>
      <HoldItem
        key={items.map(item => item.text).join()}
        items={items}
        activateOn={popoverActivateOn}
        closeOnTap
        hapticFeedback={IOS ? 'Light' : 'None'}
      >
        {children}
      </HoldItem>
    </View>
  )
}

const NativeMenuPopoverWithObserver = observer(NativeMenuPopover) as PopoverComponent
const HoldMenuPopoverWithObserver = observer(HoldMenuPopover) as PopoverComponent

/** 点击位置弹出层 */
function Popover<Data extends PopoverData>(props: PopoverProps<Data>) {
  r(COMPONENT)

  if (NativeMenuView) return <NativeMenuPopoverWithObserver {...props} />

  return <HoldMenuPopoverWithObserver {...props} />
}

const PopoverWithObserver = observer(Popover) as PopoverComponent

export { PopoverWithObserver as Popover }

export default PopoverWithObserver
