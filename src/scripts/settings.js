var allowedList = [];

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addAllowedSiteBtn').addEventListener('click', function () {
        addNewSiteClickHandler('addAllowedSiteLbl', null, actionAddAllowedSiteToList, 'notifyForBlackList');
    });
    document.getElementById('viewTimeInBadge').addEventListener('change', function () {
        storage.saveValue(SETTINGS_VIEW_TIME_IN_BADGE, this.checked);
    });
    document.getElementById('darkMode').addEventListener('change', function () {
        storage.saveValue(SETTINGS_DARK_MODE, this.checked);
    });
    document.getElementById('intervalInactivity').addEventListener('change', function () {
        storage.saveValue(SETTINGS_INTERVAL_INACTIVITY, this.value);
    });
    document.getElementById('rangeToDays').addEventListener('change', function () {
        storage.saveValue(SETTINGS_INTERVAL_RANGE, this.value);
    });
    $('.clockpicker').clockpicker();

    loadSettings();
});

function loadSettings() {
    storage.getValue(SETTINGS_INTERVAL_INACTIVITY, function (item) {
        document.getElementById('intervalInactivity').value = item;
    });
    storage.getValue(SETTINGS_INTERVAL_RANGE, function (item) {
        document.getElementById('rangeToDays').value = item;
    });
    storage.getValue(SETTINGS_VIEW_TIME_IN_BADGE, function (item) {
        document.getElementById('viewTimeInBadge').checked = item;
    });
    storage.getValue(SETTINGS_DARK_MODE, function (item) {
        document.getElementById('darkMode').checked = item;
    });
    storage.getValue(STORAGE_TABS, function (item) {
        let s = item;
    });
    storage.getValue(STORAGE_ALLOWED_LIST, function (items) {
        allowedList = (items || []).map(item => item instanceof Url ? item : new Url(item));
        viewAllowedList(allowedList);
    });
}

function loadVersion() {
    let version = chrome.runtime.getManifest().version;
    document.getElementById('version').innerText = 'v' + version;
}

function viewAllowedList(items) {
    if (items !== undefined) {
        for (var i = 0; i < items.length; i++) {
            addDomainToListBox(items[i]);
        }
    }
}

function viewNotify(elementName) {
    document.getElementById(elementName).hidden = false;
    setTimeout(function () { document.getElementById(elementName).hidden = true; }, 3000);
}

function actionAddAllowedSiteToList(newSite) {
    const newSiteUrl = new Url(newSite);

    if (!isContainsAllowedSite(newSite)) {
        addDomainToListBox(newSite);
        if (allowedList === undefined) allowedList = [];
        allowedList.push(newSiteUrl);
        document.getElementById('addAllowedSiteLbl').value = '';

        updateAllowedList();

        return true;
    } else return false;
}

function addNewSiteClickHandler(lblName, timeName, actionCheck, notifyBlock) {
    let newSite = document.getElementById(lblName).value;
    let newTime;
    if (timeName != null)
        newTime = document.getElementById(timeName).value;
    if (newSite !== '' && (newTime === undefined || (newTime !== undefined && newTime !== ''))) {
        if (!actionCheck(newSite, newTime))
            viewNotify(notifyBlock);
    }
}

function addDomainToListBox(domain) {
    let li = document.createElement('li');
    li.innerText = domain.href || domain;
    let del = document.createElement('img');
    del.height = 12;
    del.src = '/icons/delete.png';
    del.addEventListener('click', function (e) {
        deleteAllowedSite(e);
    });
    document.getElementById('allowedList').appendChild(li).appendChild(del);
}

function addDomainToEditableListBox(entity, elementId, actionEdit, actionDelete, actionUpdateTimeFromList, actionUpdateList) {
    var li = document.createElement('li');

    var domainLbl = document.createElement('input');
    domainLbl.type = 'text';
    domainLbl.classList.add('readonly-input', 'inline-block', 'element-item');
    domainLbl.value = entity.url.toString();
    domainLbl.readOnly = true;
    domainLbl.setAttribute('name', 'domain');

    var edit = document.createElement('img');
    edit.setAttribute('name', 'editCmd');
    edit.height = 14;
    edit.src = '/icons/edit.png';
    edit.addEventListener('click', function (e) {
        actionEdit(e, actionUpdateTimeFromList, actionUpdateList);
    });

    var del = document.createElement('img');
    del.height = 12;
    del.src = '/icons/delete.png';
    del.classList.add('margin-left-5');
    del.addEventListener('click', function (e) {
        actionDelete(e, actionUpdateTimeFromList, actionUpdateList);
    });

    var bloc = document.createElement('div');
    bloc.classList.add('clockpicker');
    bloc.setAttribute('data-placement', 'left');
    bloc.setAttribute('data-align', 'top');
    bloc.setAttribute('data-autoclose', 'true');
    var timeInput = document.createElement('input');
    timeInput.type = 'text';
    timeInput.classList.add('clock', 'clock-li-readonly');
    timeInput.setAttribute('readonly', true);
    timeInput.setAttribute('name', 'time');
    timeInput.value = convertShortSummaryTimeToString(entity.time);
    bloc.appendChild(timeInput);

    var hr = document.createElement('hr');
    var li = document.getElementById(elementId).appendChild(li);
    li.appendChild(domainLbl);
    li.appendChild(del);
    li.appendChild(edit);
    li.appendChild(bloc);
    li.appendChild(hr);
}

function deleteAllowedSite(e) {
    var targetElement = e.path[1];
    allowedList = allowedList.filter(allowedItem => allowedItem.href !== targetElement.innerText);
    document.getElementById('allowedList').removeChild(targetElement);
    updateAllowedList();
}

function actionEditSite(e, actionUpdateTimeFromList, actionUpdateList) {
    var targetElement = e.path[1];
    var domainElement = targetElement.querySelector('[name="domain"]');
    var timeElement = targetElement.querySelector('[name="time"]');
    if (timeElement.classList.contains('clock-li-readonly')) {
        timeElement.classList.remove('clock-li-readonly');
        var hour = timeElement.value.split(':')[0].slice(0, 2);
        var min = timeElement.value.split(':')[1].slice(1, 3);
        timeElement.value = hour + ':' + min;
        var editCmd = targetElement.querySelector('[name="editCmd"]');
        editCmd.src = '/icons/success.png';
        $('.clockpicker').clockpicker();
    }
    else {
        var domain = domainElement.value;
        var time = timeElement.value;
        if (domain !== '' && time !== '') {
            var editCmd = targetElement.querySelector('[name="editCmd"]');
            editCmd.src = '/icons/edit.png';
            timeElement.classList.add('clock-li-readonly');
            var resultTime = convertShortSummaryTimeToString(convertTimeToSummaryTime(time));
            timeElement.value = resultTime;

            actionUpdateTimeFromList(domain, time);
            actionUpdateList();
        }
    }
}

function isContainsAllowedSite(domain) {
    return allowedList.find(x => x.isMatch(domain)) != undefined;
}

function updateAllowedList() {
    storage.saveValue(STORAGE_ALLOWED_LIST, allowedList);
}
