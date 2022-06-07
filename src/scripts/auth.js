"use strict";

class Auth {
  checkDomain(email) {
    return email.includes("@boweryvaluation.com");
  }

  async runAuthProcess() {
    const email =
      (await this.getEmailFromProfile()) ||
      (await this.getEmailFromStorage()) ||
      (await this.getEmailFromGoogleOAuth());

    if (email) {
      await this.saveEmail(email);
      chrome.browserAction.setPopup({ popup: "../index.html" });
    } else {
      chrome.browserAction.setPopup({ popup: "../sign-in.html" });
    }
  }

  saveEmail(value) {
    storage.saveValue(STORAGE_USER_EMAIL, value);
  }

  getEmailFromProfile() {
    return new Promise((resolve, reject) => {
      chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (info) => {
        if (info?.email && this.checkDomain(info?.email)) {
          resolve(info.email);
        } else {
          resolve(null);
        }
      });
    });
  }

  getEmailFromStorage() {
    return new Promise((resolve, reject) => {
      storage.getValue(STORAGE_USER_EMAIL, (email) => {
        if (email && this.checkDomain(email)) {
          resolve(email);
        } else {
          resolve(null);
        }
      });
    });
  }

  getEmailFromGoogleOAuth() {
    return new Promise((resolve, reject) => {
      const clientId =
        "1015386027653-qb0c3i25f725tnovmuocllic0f4ekhnu.apps.googleusercontent.com";
      const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
      const nonce = Math.random().toString(36).substring(2, 15);
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

      authUrl.searchParams.set("client_id", clientId);
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

              if (token?.email && this.checkDomain(token?.email)) {
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
