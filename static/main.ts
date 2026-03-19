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

const clicker = document.getElementById("clicker")!;
const moneyEl = document.getElementById("money-count")!;
const shopContainer = document.getElementById("shop-items")!;
const statContainer = document.getElementById("stat-items")!;

type ShopItem = {
  name: string;
  description: string;
  cost: number;
};

let shopItems: { [key: string]: ShopItem } = {
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

let clickCount = 0;
let moneyMulti = 1;
let moneyCount = 0;
let itemsOwned: { [key: string]: number } = {};

// Populate itemsOwned so stat panel works
for (const key in shopItems) itemsOwned[key] = 0;

type State = {
  shopItems: {
    [key: string]: ShopItem;
  };
  clickCount: number;
  moneyMulti: number;
  moneyCount: number;
  itemsOwned: {
    [key: string]: number;
  };
};

function isState(obj: any): obj is State {
  if (
    !obj.shopItems ||
    !Number(obj.clickCount) ||
    !Number(obj.moneyMulti) ||
    !Number(obj.moneyCount) ||
    !obj.itemsOwned
  ) {
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
  document.querySelectorAll(".shop-item").forEach((el) => el.remove());

  // Add new items
  for (const key in shopItems) {
    const item = shopItems[key];

    const shopItem = document.createElement("div");
    shopItem.className = "shop-item";

    shopItem.innerHTML = `
          <div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
          </div>
          <button onclick="handleBuyItem('${item.name}')">
            Buy $${item.cost}
          </button>
        `;

    shopContainer.appendChild(shopItem);
  }
}

function renderStats() {
  document.querySelectorAll(".stat-item").forEach((el) => el.remove());

  for (const item in itemsOwned) {
    let quantity = itemsOwned[item];
    const statItem = document.createElement("div");
    statItem.className = "stat-item";
    statItem.innerHTML = `
          <div>
            <h3>${item}</h3>
            <p>Owned: ${quantity}</p>
          </div>
        `;
    statContainer.appendChild(statItem);
  }
  {
    const statItem = document.createElement("div");
    statItem.className = "stat-item";
    statItem.innerHTML = `
          <div>
            <h3>Total Clicks</h3>
            <p>${clickCount}</p>
          </div>
        `;
    statContainer.appendChild(statItem);
  }
  {
    const statItem = document.createElement("div");
    statItem.className = "stat-item";
    statItem.innerHTML = `
          <div>
            <h3>$ Per Click</h3>
            <p>${moneyMulti.toFixed(2)}</p>
          </div>
        `;
    statContainer.appendChild(statItem);
  }
}

function handleBuyItem(name: string) {
  let item = shopItems[name];
  if (!item) {
    console.error("Item not found");
    return;
  }

  if (moneyCount < item.cost) {
    console.warn(`Not enough money, need ${item.cost}, have ${moneyCount}`);
    return;
  }

  moneyCount -= item.cost;

  if (!itemsOwned[name]) {
    itemsOwned[name] = 1;
  } else {
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
  const num_kitty = itemsOwned["Kitty"];
  if (!num_kitty) {
    return;
  }

  for (let i = 0; i < num_kitty; i++) {
    handleClick();
  }
}

function handleMulti() {
  const num_multi = itemsOwned["Multiplier"];
  if (!num_multi) {
    return;
  }

  moneyMulti = 1.01 ** num_multi;
}

function saveProgress() {
  let state: State = {
    shopItems: shopItems,
    clickCount: clickCount,
    moneyMulti: moneyMulti,
    moneyCount: moneyCount,
    itemsOwned: itemsOwned,
  };
  localStorage.setItem("state", JSON.stringify(state));
}

function loadProgress() {
  let state_strimg = localStorage.getItem("state");
  if (!state_strimg) {
    console.log("No save found");
    return;
  }
  let new_state = JSON.parse(state_strimg);
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
