import SwiftUI

@main
struct RevolutDemoApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .ignoresSafeArea()
                .preferredColorScheme(.dark)
                .statusBarHidden(false)
        }
    }
}

struct ContentView: View {
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            WebViewContainer()
                .ignoresSafeArea()
        }
        .background(Color.black)
    }
}
