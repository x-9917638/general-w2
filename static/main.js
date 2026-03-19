// Copyright (C) 2026 Valerie <valerie@ouppy.gay>
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, under version 3 of the License only.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
var clicker = document.getElementById("clicker");
var moneyEl = document.getElementById("money-count");
var shopContainer = document.getElementById("shop-items");
var statContainer = document.getElementById("stat-items");
var shopItems = {
    Kitty: {
        name: "Kitty",
        description: "Meow :3",
        cost: 10,
    },
    Multiplier: {
        name: "Multiplier",
        description: "Your clicks are worth 101% of what they were before :p",
        cost: 30,
    },
};
var clickCount = 0;
var moneyMulti = 1;
var moneyCount = 0;
var itemsOwned = {};
// Populate itemsOwned so stat panel works
for (var key in shopItems)
    itemsOwned[key] = 0;
function isState(obj) {
    if (!obj.shopItems ||
        !Number(obj.clickCount) ||
        !Number(obj.moneyMulti) ||
        !Number(obj.moneyCount) ||
        !obj.itemsOwned) {
        return false;
    }
    return true;
}
function handleClick() {
    clickCount++;
    moneyCount += moneyMulti;
}
function renderShopItems() {
    // Kill remaining shop items
    document.querySelectorAll(".shop-item").forEach(function (el) { return el.remove(); });
    // Add new items
    for (var key in shopItems) {
        var item = shopItems[key];
        var shopItem = document.createElement("div");
        shopItem.className = "shop-item";
        shopItem.innerHTML = "\n          <div>\n            <h3>".concat(item.name, "</h3>\n            <p>").concat(item.description, "</p>\n          </div>\n          <button onclick=\"handleBuyItem('").concat(item.name, "')\">\n            Buy $").concat(item.cost, "\n          </button>\n        ");
        shopContainer.appendChild(shopItem);
    }
}
function renderStats() {
    document.querySelectorAll(".stat-item").forEach(function (el) { return el.remove(); });
    for (var item in itemsOwned) {
        var quantity = itemsOwned[item];
        var statItem = document.createElement("div");
        statItem.className = "stat-item";
        statItem.innerHTML = "\n          <div>\n            <h3>".concat(item, "</h3>\n            <p>Owned: ").concat(quantity, "</p>\n          </div>\n        ");
        statContainer.appendChild(statItem);
    }
    {
        var statItem = document.createElement("div");
        statItem.className = "stat-item";
        statItem.innerHTML = "\n          <div>\n            <h3>Total Clicks</h3>\n            <p>".concat(clickCount, "</p>\n          </div>\n        ");
        statContainer.appendChild(statItem);
    }
    {
        var statItem = document.createElement("div");
        statItem.className = "stat-item";
        statItem.innerHTML = "\n          <div>\n            <h3>$ Per Click</h3>\n            <p>".concat(moneyMulti.toFixed(2), "</p>\n          </div>\n        ");
        statContainer.appendChild(statItem);
    }
}
function handleBuyItem(name) {
    var item = shopItems[name];
    if (!item) {
        console.error("Item not found");
        return;
    }
    if (moneyCount < item.cost) {
        console.warn("Not enough money, need ".concat(item.cost, ", have ").concat(moneyCount));
        return;
    }
    moneyCount -= item.cost;
    if (!itemsOwned[name]) {
        itemsOwned[name] = 1;
    }
    else {
        itemsOwned[name]++;
    }
    // 8% price increase
    item.cost *= 1.08;
    item.cost = Number(item.cost.toFixed(2));
    renderShopItems();
}
function itemLoop() {
    handleKitty();
}
function handleKitty() {
    var num_kitty = itemsOwned["Kitty"];
    if (!num_kitty) {
        return;
    }
    for (var i = 0; i < num_kitty; i++) {
        handleClick();
    }
}
function handleMulti() {
    var num_multi = itemsOwned["Multiplier"];
    if (!num_multi) {
        return;
    }
    moneyMulti = Math.pow(1.01, num_multi);
}
function saveProgress() {
    var state = {
        shopItems: shopItems,
        clickCount: clickCount,
        moneyMulti: moneyMulti,
        moneyCount: moneyCount,
        itemsOwned: itemsOwned,
    };
    localStorage.setItem("state", JSON.stringify(state));
}
function loadProgress() {
    var state_strimg = localStorage.getItem("state");
    if (!state_strimg) {
        console.log("No save found");
        return;
    }
    var new_state = JSON.parse(state_strimg);
    if (!isState(new_state)) {
        alert("Invalid save data found");
        return;
    }
    clickCount = new_state.clickCount;
    itemsOwned = new_state.itemsOwned;
    moneyCount = new_state.moneyCount;
    moneyMulti = new_state.moneyMulti;
    shopItems = new_state.shopItems;
    renderShopItems();
}
function clearProgress() {
    localStorage.removeItem("state");
    window.location.reload();
}
function loop() {
    handleMulti();
    // renderStats can be called in this loop
    // because it doesn't setup any
    // interactive elements, i.e. no button
    renderStats();
    moneyEl.textContent = moneyCount.toFixed(2).toString();
}
function main() {
    renderShopItems();
    renderStats();
    setInterval(itemLoop, 1000);
    clicker.addEventListener("click", handleClick);
    loadProgress();
    setInterval(loop, 50);
}
main();
