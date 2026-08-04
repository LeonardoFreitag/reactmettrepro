const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Android 11+ exige declarar explicitamente quais pacotes o app pode "ver".
 * Sem isso, Linking.canOpenURL('lio://...') retorna false e o deep link não funciona.
 */
module.exports = function withCieloQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // ── <queries> para Android 11+ ──────────────────────────────────────────
    if (!manifest.queries) {
      manifest.queries = [];
    }

    const alreadyAdded = manifest.queries.some(
      (q) => q?.package?.[0]?.['$']?.['android:name'] === 'com.ads.lio.uriappclient'
    );

    if (!alreadyAdded) {
      manifest.queries.push({
        package: [{ '$': { 'android:name': 'com.ads.lio.uriappclient' } }],
      });
    }

    // ── <meta-data> exigido pela Cielo para Deep Link via URI ──────────────
    const application = manifest.application?.[0];
    if (application) {
      if (!application['meta-data']) {
        application['meta-data'] = [];
      }

      const metaAlreadyAdded = application['meta-data'].some(
        (m) => m?.['$']?.['android:name'] === 'cs_integration_type'
      );

      if (!metaAlreadyAdded) {
        application['meta-data'].push({
          '$': {
            'android:name':  'cs_integration_type',
            'android:value': 'uri',
          },
        });
      }
    }

    return config;
  });
};
