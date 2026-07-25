/*
 * @Author: czy0729
 * @Date: 2019-03-16 10:54:39
 * @Last Modified by: czy0729
 * @Last Modified time: 2026-01-09 19:51:18
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { DeviceEventEmitter, View } from 'react-native'
import { systemStore } from '@stores'
import { s2t } from '@utils/thirdParty/open-cc'
import { FROZEN_FN, IOS } from '@constants'
import { HoldItem } from '../../hold-menu'
import { NativeMenuView } from './native-menu'
import { getNativeMenuSelection } from './selection'

import type { PopoverIOSItems } from './types'

const EVENT_TYPE = 'POPOVER_ONSELECT'

let uniqueId = 0

function LegacyPopover({ activateOn, children, ...other }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = other.data || other.overlay?.props?.data || []
  const title = other.title || other.overlay?.props?.title || ''
  const onSelect = other.onSelect || other.overlay?.props?.onSelect || FROZEN_FN

  const eventId = useRef((uniqueId += 1))
  const eventType = `${EVENT_TYPE}|${eventId.current}`

  const items = useMemo<PopoverIOSItems>(() => {
    const itemsValue = (
      systemStore.setting.s2t
        ? data.map((item: string) => (typeof item === 'string' ? s2t(item) : item))
        : data
    ).map((item: any) => ({
      text: item,
      eventType
    }))

    if (title) {
      itemsValue.unshift({
        text: systemStore.setting.s2t ? s2t(title) : title,
        isTitle: true
      })
    }

    return itemsValue
  }, [title, data, eventType])

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      eventType,
      eventValue => {
        const { value, pageX, pageY } = eventValue || {}
        let index = -1
        try {
          index = items.filter(item => !item.isTitle).findIndex(item => item.text === value)
        } catch {}

        setTimeout(() => {
          onSelect(data[index], index, {
            pageX,
            pageY
          })
        }, 160)
      },
      [onSelect]
    )

    return () => subscription.remove()
  })

  return (
    <View style={other.style}>
      <HoldItem
        key={items.map(item => item.text).join()}
        items={items}
        activateOn={activateOn || 'tap'}
        disableMove={items.length >= 10}
        closeOnTap
        hapticFeedback={IOS ? 'Light' : 'None'}
      >
        {children}
      </HoldItem>
    </View>
  )
}

function NativePopover({ activateOn, children, ...other }) {
  const data = useMemo(
    () => other.data || other.overlay?.props?.data || [],
    [other.data, other.overlay]
  )
  const title = other.title || other.overlay?.props?.title || ''
  const onSelect = other.onSelect || other.overlay?.props?.onSelect || FROZEN_FN

  const items = useMemo(
    () =>
      systemStore.setting.s2t
        ? data.map((item: string) => (typeof item === 'string' ? s2t(item) : item))
        : [...data],
    [data]
  )

  const handleSelect = useCallback(
    event => {
      const selection = getNativeMenuSelection(data, event.nativeEvent)
      if (!selection) return

      setTimeout(() => onSelect(...selection), 160)
    },
    [data, onSelect]
  )

  if (!NativeMenuView) {
    return (
      <LegacyPopover activateOn={activateOn} {...other}>
        {children}
      </LegacyPopover>
    )
  }

  return (
    <NativeMenuView
      style={other.style}
      items={items}
      title={systemStore.setting.s2t && title ? s2t(title) : title}
      activateOn={activateOn || 'tap'}
      onSelect={handleSelect}
    >
      {children}
    </NativeMenuView>
  )
}

function Popover(props) {
  return NativeMenuView ? <NativePopover {...props} /> : <LegacyPopover {...props} />
}

export default Popover
