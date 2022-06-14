"use strict";

class AuthHelper {
  _validateDomain(email) {
    if (email) {
      return email.includes("@boweryvaluation.com");
    } else {
      return false;
    }
  }

  _validateTokens(refreshToken, idToken, idTokenExpirationDate) {
    return refreshToken && idToken && idTokenExpirationDate;
  }

  async runAuthProcess() {
    const [refreshToken, idToken, idTokenExpirationDate] = await Promise.all([
      storage.getValuePromise(STORAGE_REFRESH_TOKEN),
      storage.getValuePromise(STORAGE_ID_TOKEN),
      storage.getValuePromise(STORAGE_ID_TOKEN_EXPIRATION_DATE),
    ]);

    if (this._validateTokens(refreshToken, idToken, idTokenExpirationDate)) {
      if (idTokenExpirationDate < Date.now()) {
        const { id_token, expires_in } = await this._getRefreshedIdToken(
          refreshToken
        );
        this._saveIdTokenData(id_token, expires_in);
      }
    } else {
      const code = await this._getAuthCode();
      const { id_token, expires_in, refresh_token } =
        await this._getIdAndRefreshTokens(code);

      this._saveIdTokenData(id_token, expires_in);
      if (refresh_token) {
        storage.saveValue(STORAGE_REFRESH_TOKEN, refresh_token);
      }
    }

    if (await storage.getValuePromise(STORAGE_USER_EMAIL)) {
      chrome.browserAction.setPopup({ popup: "../index.html" });
    }
  }

  _saveIdTokenData(id_token, expires_in) {
    if (id_token) {
      const email = this._parseIdToken(id_token)?.email;

      storage.saveValue(STORAGE_ID_TOKEN, id_token);
      storage.saveValue(STORAGE_USER_EMAIL, email);
    }
    if (expires_in) {
      storage.saveValue(
        STORAGE_ID_TOKEN_EXPIRATION_DATE,
        Date.now() + expires_in * 1000
      );
    }
  }

  _parseIdToken(jwt) {
    const base64Url = jwt.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    const token = JSON.parse(atob(base64));

    return token;
  }

  _getAuthCode() {
    return new Promise((resolve, reject) => {
      const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
      const nonce = Math.random().toString(36).substring(2, 15);
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

      authUrl.searchParams.set("client_id", CLIENT_ID);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", "openid profile email");
      authUrl.searchParams.set("nonce", nonce);
      authUrl.searchParams.set("access_type", "offline");

      return chrome.identity.launchWebAuthFlow(
        {
          url: authUrl.href,
          interactive: true,
        },
        (redirectUrl) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            if (redirectUrl) {
              const urlHash = redirectUrl.split("?")[1];
              const params = new URLSearchParams(urlHash);
              const code = params.get("code");
              resolve(code || null);
            }
          }
        }
      );
    });
  }

  _getIdAndRefreshTokens(code) {
    return new Promise(async (resolve, reject) => {
      if (code) {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          body: JSON.stringify({
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: `https://${chrome.runtime.id}.chromiumapp.org/`,
            grant_type: "authorization_code",
          }),
          method: "POST",
        });
        const responseJson = await response.json();

        resolve(responseJson);
      } else {
        resolve(null);
      }
    });
  }

  _getRefreshedIdToken(refreshToken) {
    return new Promise(async (resolve, reject) => {
      if (refreshToken) {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          body: JSON.stringify({
            refresh_token: refreshToken,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: `https://${chrome.runtime.id}.chromiumapp.org/`,
            grant_type: "refresh_token",
          }),
          method: "POST",
        });
        const responseJson = await response.json();

        resolve(responseJson);
      } else {
        resolve(null);
      }
    });
  }
}
