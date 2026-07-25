module.exports = {
  requireNativeModule: jest.fn(() => ({})),
  requireNativeViewManager: jest.fn(() => 'NativeView'),
  requireOptionalNativeModule: jest.fn(() => ({}))
}
