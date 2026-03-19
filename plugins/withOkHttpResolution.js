const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withOkHttpResolution(config) {
  return withProjectBuildGradle(config, async (config) => {
    if (!config.modResults.contents.includes("force \"com.squareup.okhttp3:okhttp")) {
        config.modResults.contents += `
allprojects {
    configurations.all {
        resolutionStrategy {
            force "com.squareup.okhttp3:okhttp:4.9.2"
            force "com.squareup.okhttp3:okhttp-urlconnection:4.9.2"
        }
    }
}
`;
    }
    return config;
  });
};
