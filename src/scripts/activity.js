'use strict';

class Activity {
    addTab(tab) {
        if (this.isValidPage(tab) === true) {
            if (tab.id && (tab.id != 0)) {
                tabs = tabs || [];
                let url = new Url(tab.url);
                let isDifferentUrl = false;
                if (!url.isMatch(currentTab)) {
                    isDifferentUrl = true;
                }

                if (this.isNewUrl(url) && !this.isInBlockedList(url)) {
                    let favicon = tab.favIconUrl;
                    if (favicon === undefined) {
                        favicon = 'chrome://favicon/' + url.host;
                    }
                    let newTab = new Tab(url, favicon);
                    tabs.push(newTab);
                }

                if (isDifferentUrl && !this.isInBlockedList(url)) {
                    this.setCurrentActiveTab(url);
                    let tabUrl = this.getTab(url);
                    if (tabUrl !== undefined)
                        tabUrl.incCounter();
                    this.addTimeInterval(url);
                }
            }
        } else this.closeIntervalForCurrentTab();
    }

    isValidPage(tab) {
        if (!tab || !tab.url || (tab.url.indexOf('http:') == -1 && tab.url.indexOf('https:') == -1)
            || tab.url.indexOf('chrome://') !== -1
            || tab.url.indexOf('chrome-extension://') !== -1)
            return false;
        return true;
    }

    isNewUrl(domain) {
        if (tabs.length > 0)
            return tabs.find(o => o.url.isMatch(domain)) === undefined;
        else return true;
    }

    getTab(domain) {
        if (tabs !== undefined)
            return tabs.find(o => o.url.isMatch(domain));
    }

    updateFavicon(tab) {
        if (!this.isValidPage(tab)){
            return;
        }

        let url = new Url(tab.url);
        let currentTab = this.getTab(url);
        if (currentTab !== null && currentTab !== undefined) {
            if (tab.favIconUrl !== undefined && tab.favIconUrl !== currentTab.favicon) {
                currentTab.favicon = tab.favIconUrl;
            }
        }
    }

    setCurrentActiveTab(domain) {
        this.closeIntervalForCurrentTab();
        currentTab = domain;
        this.addTimeInterval(domain);
    }

    addTimeInterval(domain) {
        let item = timeIntervalList.find(o => o.url.isMatch(domain) && o.day == todayLocalDate());
        if (item != undefined) {
            if (item.day == todayLocalDate())
                item.addInterval();
            else {
                let newInterval = new TimeInterval(todayLocalDate(), domain);
                newInterval.addInterval();
                timeIntervalList.push(newInterval);
            }
        } else {
            let newInterval = new TimeInterval(todayLocalDate(), domain);
            newInterval.addInterval();
            timeIntervalList.push(newInterval);
        }
    }

    closeIntervalForCurrentTab(preserveCurrentTab) {
        if (currentTab && timeIntervalList != undefined) {
            let item = timeIntervalList.find(o => o.url.isMatch(currentTab) && o.day == todayLocalDate());
            if (item != undefined)
                item.closeInterval();
        }

        if (!preserveCurrentTab) {
            currentTab = null;
        }
    }

    isInBlockedList(domain) {
        if (setting_allowed_list !== undefined &&
            setting_allowed_list.length > 0 &&
            setting_allowed_list.find(o => o.isMatch(domain)) !== undefined) {
            return false;
        } else {
            return true;
        }
    }
};
