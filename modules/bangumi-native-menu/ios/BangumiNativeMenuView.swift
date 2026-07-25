import ExpoModulesCore
import UIKit

private final class MenuDismissalShield: UIView {
  var onTouch: (() -> Void)?

  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    onTouch?()
  }
}

public final class BangumiNativeMenuView: ExpoView, UIContextMenuInteractionDelegate {
  let onSelect = EventDispatcher()

  private let tapButton = UIButton(type: .custom)
  private lazy var contextMenuInteraction = UIContextMenuInteraction(delegate: self)
  private weak var dismissalShield: MenuDismissalShield?
  private var items: [String] = []
  private var menuTitle = ""
  private var activateOn = "tap"
  private var isContextMenuInstalled = false

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    tapButton.backgroundColor = .clear
    tapButton.accessibilityIdentifier = "bangumi.native-menu.trigger"
    tapButton.accessibilityLabel = "菜单"
    tapButton.showsMenuAsPrimaryAction = true
    tapButton.addTarget(self, action: #selector(installDismissalShield), for: .menuActionTriggered)
    addSubview(tapButton)
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()

    if window == nil {
      removeDismissalShield()
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    tapButton.frame = bounds
    bringSubviewToFront(tapButton)
  }

  func setItems(_ items: [String]) {
    self.items = items
    updateInteraction()
  }

  func setTitle(_ title: String?) {
    menuTitle = title ?? ""
    updateInteraction()
  }

  func setActivateOn(_ activateOn: String) {
    self.activateOn = activateOn == "hold" ? "hold" : "tap"
    updateInteraction()
  }

  private func updateInteraction() {
    let hasItems = !items.isEmpty
    let activatesOnHold = activateOn == "hold"

    if !hasItems || activatesOnHold {
      removeDismissalShield()
    }

    tapButton.menu = hasItems && !activatesOnHold ? makeMenu() : nil
    tapButton.isHidden = !hasItems || activatesOnHold
    tapButton.isUserInteractionEnabled = hasItems && !activatesOnHold

    if hasItems && activatesOnHold && !isContextMenuInstalled {
      addInteraction(contextMenuInteraction)
      isContextMenuInstalled = true
    } else if (!hasItems || !activatesOnHold) && isContextMenuInstalled {
      removeInteraction(contextMenuInteraction)
      isContextMenuInstalled = false
    }
  }

  private func makeMenu() -> UIMenu {
    let actions = items.enumerated().map { index, text in
      UIAction(title: text) { [weak self] _ in
        self?.selectItem(at: index)
      }
    }
    return UIMenu(title: menuTitle, children: actions)
  }

  private func selectItem(at index: Int) {
    guard items.indices.contains(index) else {
      return
    }

    removeDismissalShield()

    let anchor = CGPoint(x: bounds.midX, y: bounds.midY)
    let windowPoint = window.map { convert(anchor, to: $0) } ?? anchor
    onSelect([
      "index": index,
      "pageX": windowPoint.x,
      "pageY": windowPoint.y
    ])
  }

  @objc private func installDismissalShield() {
    guard dismissalShield == nil, let window else {
      return
    }

    let shield = MenuDismissalShield(frame: window.bounds)
    shield.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    shield.backgroundColor = .clear
    shield.accessibilityIdentifier = "bangumi.native-menu.dismissal-shield"
    shield.onTouch = { [weak self] in
      self?.removeDismissalShield()
    }
    window.addSubview(shield)
    dismissalShield = shield
  }

  private func removeDismissalShield() {
    dismissalShield?.removeFromSuperview()
    dismissalShield = nil
  }

  public func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configurationForMenuAtLocation location: CGPoint
  ) -> UIContextMenuConfiguration? {
    guard activateOn == "hold", !items.isEmpty else {
      return nil
    }

    return UIContextMenuConfiguration(identifier: nil, previewProvider: nil) { [weak self] _ in
      self?.makeMenu()
    }
  }
}
