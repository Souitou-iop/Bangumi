/*
 * iOS native bottom tabs are opt-in until the rest of the app adopts the same design language.
 */
import React from 'react'
import { Heatmap, SwitchPro } from '@components'
import { ItemSetting } from '@_'
import { t } from '@utils/fetch'
import { useObserver } from '@utils/hooks'
import commonStyles from '../../../styles'
import { useAsyncSwitchSetting } from '../../../hooks'
import { TEXTS } from '../ds'

import type { WithFilterProps } from '../../../types'

function NativeBottomTabs({ filter }: WithFilterProps) {
  const { value, handleSwitch } = useAsyncSwitchSetting('nativeBottomTabs')
  const enabled = value === true

  return useObserver(() => (
    <ItemSetting
      ft={
        <SwitchPro
          style={commonStyles.switch}
          value={enabled}
          onSyncPress={() => {
            handleSwitch()

            t('设置.切换', {
              title: TEXTS.nativeBottomTabs.hd,
              checked: !enabled
            })
          }}
        />
      }
      filter={filter}
      {...TEXTS.nativeBottomTabs}
    >
      <Heatmap id='设置.切换' title={TEXTS.nativeBottomTabs.hd} />
    </ItemSetting>
  ))
}

export default NativeBottomTabs
