import ExpoModulesCore

public final class BangumiNativeMenuModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BangumiNativeMenu")

    View(BangumiNativeMenuView.self) {
      Prop("items") { (view, items: [String]) in
        view.setItems(items)
      }

      Prop("title") { (view, title: String?) in
        view.setTitle(title)
      }

      Prop("activateOn") { (view, activateOn: String) in
        view.setActivateOn(activateOn)
      }

      Events("onSelect")
    }
  }
}
