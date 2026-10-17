import SwiftUI
import UIKit
import WebKit

/// Hosts the bundled single-page demo inside a WKWebView and makes it feel native.
struct WebViewContainer: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = false
        // Keep the layout fixed: disable pinch zoom so the demo behaves like a native screen.
        webView.scrollView.pinchGestureRecognizer?.isEnabled = false
        webView.scrollView.maximumZoomScale = 1
        webView.scrollView.minimumZoomScale = 1

        // Leave room for the notch / Dynamic Island and the home indicator.
        let safeAreaCSS = """
        .app-scroll { top: 0 !important; }
        .bottom-nav { bottom: max(12px, env(safe-area-inset-bottom)) !important; }
        .home-indicator { display: none !important; }
        """
        let source = """
        (function () {
          var css = `\(safeAreaCSS)`;
          function apply() {
            var style = document.createElement('style');
            style.textContent = css;
            (document.head || document.documentElement).appendChild(style);
          }
          if (document.documentElement) { apply(); } else { document.addEventListener('DOMContentLoaded', apply); }
        })();
        """
        webView.configuration.userContentController.addUserScript(
            WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        )

        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            webView.loadHTMLString(
                "<html><body style=\"background:#000;color:#fff;font-family:-apple-system;padding:24px\">"
                    + "<h1>Web content missing</h1><p>The bundled demo files were not copied into the app.</p>"
                    + "</body></html>",
                baseURL: nil
            )
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            // Open external links (e.g. the README's references) in Safari instead of the app.
            if navigationAction.navigationType == .linkActivated,
               let url = navigationAction.request.url,
               let scheme = url.scheme,
               scheme == "http" || scheme == "https" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }
    }
}
