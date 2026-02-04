/**
 * Core: App Bridge
 * 
 * 하이브리드 앱 네이티브 인터페이스 통신
 */

/**
 * 네이티브 앱 인터페이스 타입 정의
 */
interface NativeAppInterface {
  /** 웹뷰 팝업 닫기 이벤트 전송 */
  onPopupClose?: () => void;
  /** 웹뷰 팝업 열기 이벤트 전송 */
  onPopupOpen?: () => void;
}

/**
 * Window 타입 확장
 */
declare global {
  interface Window {
    NativeApp?: NativeAppInterface;
    webkit?: {
      messageHandlers?: {
        NativeApp?: {
          postMessage: (message: { type: string; data?: unknown }) => void;
        };
      };
    };
  }
}

/**
 * 네이티브 앱에 메시지 전송
 */
export const sendToNativeApp = (type: string, data?: unknown) => {
  try {
    // Android WebView
    if (window.NativeApp) {
      const method = window.NativeApp[type as keyof NativeAppInterface];
      if (typeof method === 'function') {
        method();
      }
    }

    // iOS WebKit
    if (window.webkit?.messageHandlers?.NativeApp) {
      window.webkit.messageHandlers.NativeApp.postMessage({ type, data });
    }
  } catch (error) {
    console.error('Failed to send message to native app:', error);
  }
};

/**
 * 팝업 닫기 이벤트를 네이티브 앱에 전송
 */
export const notifyPopupClose = () => {
  sendToNativeApp('onPopupClose');
};

/**
 * 팝업 열기 이벤트를 네이티브 앱에 전송
 */
export const notifyPopupOpen = () => {
  sendToNativeApp('onPopupOpen');
};
