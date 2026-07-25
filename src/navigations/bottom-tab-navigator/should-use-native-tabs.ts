export function shouldUseNativeTabs(
  isStandalone: boolean,
  enabled: boolean | undefined,
  tabCount: number
) {
  return isStandalone && enabled === true && tabCount <= 5
}
