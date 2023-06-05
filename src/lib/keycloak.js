const KeycloakConnect = require("keycloak-connect");

module.exports.Keycloak = class Keycloak {
  grantManager;

  constructor() {
    const { grantManager } = new KeycloakConnect(
      {},
      {
        serverUrl: process.env.KEYCLOAK_SERVER_URL,
        realm: process.env.KEYCLOAK_REALM,
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        credentials: {
          secret: process.env.KEYCLOAK_CLIENT_SECRET,
        },
      }
    );

    this.grantManager = grantManager;
  }

  async obtainFromClientCredentials() {
    const { access_token, refresh_token, id_token, token_type, expires_in } =
      await this.grantManager.obtainFromClientCredentials();

    return { access_token, refresh_token, id_token, token_type, expires_in };
  }
}
