import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  Platform,
  RefreshControl,
  ScrollView,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const TARGET_URL = 'https://www.merkurreferans.com.tr';
const TRUSTED_ORIGINS = new Set(['https://www.merkurreferans.com.tr', 'https://merkurreferans.com.tr']);

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Güvenlik Zaman Aşımı: İlk açılışta en geç 3.5 sn sonra yükleme katmanını kesinlikle kaldır
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Android Geri Tuşu Kontrolü (WebView içinde geri gitme)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Varsayılan uygulamadan çıkma hareketini engelle
      }
      return false; // Sayfada geri gidilemiyorsa normal çıkış yap
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasError(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  // Harici link yönlendirmeleri (tel, mailto, whatsapp, zoom vb.)
  const handleShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    if (!url) return true;

    // Telefon, mail, whatsapp, zoom protokolleri harici uygulamada açılsın
    if (
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('sms:') ||
      url.startsWith('whatsapp:') ||
      url.startsWith('zoommtg:')
    ) {
      Linking.openURL(url).catch((err) => console.log('Link açılamadı:', err));
      return false;
    }

    // Keep authenticated web content inside the HTTPS production origin.
    // External links are opened by the device instead of becoming an
    // unrestricted in-app browser.
    try {
      const parsed = new URL(url);
      if (TRUSTED_ORIGINS.has(parsed.origin)) return true;
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        Linking.openURL(url).catch((err) => console.log('Harici bağlantı açılamadı:', err));
        return false;
      }
    } catch {
      return false;
    }

    return false;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ExpoStatusBar style="light" backgroundColor="#0b0f19" />

        {/* Hata Durumu (İnternet Yok vs.) */}
        {hasError ? (
          <ScrollView
            contentContainerStyle={styles.errorContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
            }
          >
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>📡</Text>
            </View>
            <Text style={styles.errorTitle}>Bağlantı Kurulamadı</Text>
            <Text style={styles.errorSubtitle}>
              İnternet bağlantınızı kontrol edip lütfen tekrar deneyin.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setHasError(false);
                setIsInitialLoading(true);
                webViewRef.current?.reload();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.webViewContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: TARGET_URL }}
              style={styles.webView}
              originWhitelist={['https://www.merkurreferans.com.tr', 'https://merkurreferans.com.tr']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={false}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              startInLoadingState={false}
              pullToRefreshEnabled={true}
              bounces={true}
              mixedContentMode="never"
              textZoom={100}
              setSupportMultipleWindows={false}
              onNavigationStateChange={(navState) => {
                setCanGoBack(navState.canGoBack);
              }}
              onLoadEnd={() => {
                setIsInitialLoading(false);
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
                if (isInitialLoading) {
                  setHasError(true);
                }
                setIsInitialLoading(false);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                if (nativeEvent.statusCode >= 400) {
                  console.warn('WebView HTTP error: ', nativeEvent.statusCode);
                }
              }}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            />

            {/* Sadece İlk Açılış Yükleniyor Göstergesi */}
            {isInitialLoading && (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0b0f19',
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  errorIcon: {
    fontSize: 36,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
