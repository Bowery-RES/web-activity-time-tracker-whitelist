"use strict";

class AuthHelper {
  _validateDomain(email) {
    if (email) {
      return email.includes("@boweryvaluation.com");
    } else {
      return false;
    }
  }

  async runAuthProcess() {
    const email =
      (await this._getEmailFromProfile()) ||
      (await this._getEmailFromStorage()) ||
      (await this._getEmailFromGoogleOAuth());

    if (email) {
      await this._saveEmail(email);
      chrome.browserAction.setPopup({ popup: "../index.html" });
    } else {
      chrome.browserAction.setPopup({ popup: "../sign-in.html" });
    }
  }

  _saveEmail(value) {
    storage.saveValue(STORAGE_USER_EMAIL, value);
  }

  _getEmailFromProfile() {
    return new Promise((resolve, reject) => {
      chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (info) => {
        if (this._validateDomain(info?.email)) {
          resolve(info.email);
        } else {
          resolve(null);
        }
      });
    });
  }

  _getEmailFromStorage() {
    return new Promise((resolve, reject) => {
      storage.getValue(STORAGE_USER_EMAIL, (email) => {
        if (this._validateDomain(email)) {
          resolve(email);
        } else {
          resolve(null);
        }
      });
    });
  }

  _getEmailFromGoogleOAuth() {
    return new Promise((resolve, reject) => {
      const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
      const nonce = Math.random().toString(36).substring(2, 15);
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

      authUrl.searchParams.set("client_id", CLIENT_ID);
      authUrl.searchParams.set("response_type", "id_token");
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", "email");
      authUrl.searchParams.set("nonce", nonce);
      authUrl.searchParams.set("prompt", "select_account");

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
              // The ID token is in the URL hash
              const urlHash = redirectUrl.split("#")[1];
              const params = new URLSearchParams(urlHash);
              const jwt = params.get("id_token");

              // Parse the JSON Web Token
              const base64Url = jwt.split(".")[1];
              const base64 = base64Url.replace("-", "+").replace("_", "/");
              const token = JSON.parse(atob(base64));

              if (this._validateDomain(token?.email)) {
                resolve(token.email);
              } else {
                resolve(null);
              }
            }
          }
        }
      );
    });
  }
}
