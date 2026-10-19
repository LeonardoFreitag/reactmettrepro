const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Android 11+ (package visibility): declara os schemes dos apps da Stone SmartPOS
 * (payment-app, cancel-app, printer-app) para `Linking.openURL/canOpenURL`
 * enxergarem os apps. Usa <intent> por scheme (independe do nome do pacote).
 */
const SCHEMES = ['payment-app', 'cancel-app', 'printer-app'];

module.exports = function withStoneQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest.queries) manifest.queries = [];
    if (!manifest.queries[0]) manifest.queries.push({});
    const q = manifest.queries[0];
    if (!q.intent) q.intent = [];

    for (const scheme of SCHEMES) {
      const exists = q.intent.some(
        (it) => it?.data?.some((d) => d?.['$']?.['android:scheme'] === scheme)
      );
      if (!exists) {
        q.intent.push({
          action: [{ '$': { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ '$': { 'android:scheme': scheme } }],
        });
      }
    }
    return config;
  });
};
