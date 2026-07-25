require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name             = 'BangumiNativeMenu'
  s.version          = package['version']
  s.summary          = package['description']
  s.description      = package['description']
  s.license          = package['license']
  s.author           = 'Bangumi'
  s.homepage         = 'https://github.com/czy0729/Bangumi'
  s.platforms        = { :ios => '15.1' }
  s.source           = { :git => 'https://github.com/czy0729/Bangumi.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
end
