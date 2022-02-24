var tableId = document.getElementById("tables");
var menuId = document.getElementById("menu-items");
var modal = document.getElementById("popup");

function setup() {
  if (localStorage.getItem("tables") == null) {
    localStorage.setItem("tables", JSON.stringify(tables));
  }
  refresh();
  showMenu();
}

//To upadte the summary of table 
function refresh() {
  let i = 1;
  tableId.innerHTML = "";
  tables = JSON.parse(localStorage.getItem("tables"));

  while (tables["table" + i] != undefined) {
    let { cost, items } = tables["table" + i];
    let tableEle = createTableItem(i, cost, items);
    tableId.innerHTML += tableEle;
    i = i + 1;
  }
}
// Used to create the Table elemensts
function createTableItem(i, cost, items) {
  let tableItem = `<div id="table-box" ondrop="drop(event,'table${i}')" ondragover="allowDrop(event)" onclick="openPopup('table${i}')" >
    <h2>Table-${i}</h2>
    <p>
        Rs. <span id="cost">
                ${cost}
        </span>
        |
        Total items
        <span id="items">
                ${items}
        </span>
    </p>    
    </div>`;
  return tableItem;
}

//Menu 
function showMenu() {
  menuId.innerHTML = "";
  let i = 1;
  while (menu["item" + i] != undefined) {
    let { name, cost, category } = menu["item" + i];
    let menuItemEle = createMenuItem(i, name, cost, category);
    menuId.innerHTML += menuItemEle;
    i = i + 1;
  }
}

// Creating Menu Items             
function createMenuItem(i, name, cost, category) {
  let menuItemEle = `<div id="item${i}"  class="menu-item" draggable="true" ondragstart="drag(event)">
          <h2>
              ${name}    
          </h2>
          <p>
              Rs
              <span id="price">
                  ${cost}
              </span>  
              <span id="category">
                  ${category}
              </span>
          </p>
          </div>`;
  return menuItemEle;
}


//Search Table
function searchTable() {
  let searchKey = table_name.value;
  if (searchKey == "") {
    refresh();
    return;
  }


  let num = searchKey.split("-");
  if (num[1] != undefined && num[1] != "") {
    let tableNo = parseInt(num[1]);
    tables = JSON.parse(localStorage.getItem("tables"));

    if (tables["table" + tableNo] == undefined) return;

    let { cost, items } = tables["table" + tableNo];

    let tableEle = createTableItem(tableNo, cost, items);
    tableId.innerHTML = tableEle;
  }
}

//Search Menu
function searchMenu() {
  let searchKey = menu_search.value;
  searchKey = searchKey.toLowerCase();
  console.log(searchKey)
  if (searchKey == "") {
    showMenu();
  }
  let menuId = document.getElementById("menu-items");
  menuId.innerHTML = " ";
  let i = 1;

  while (menu["item" + i] != undefined) {
    let { name, cost, category } = menu["item" + i];
    let lowerName = name.toLowerCase();
    let lowerCategory = category.toLowerCase();
    
    if (lowerName.includes(searchKey) || lowerCategory.includes(searchKey)) {
      let menuEle = createMenuItem(i, name, cost, category);
      menuId.innerHTML += menuEle;
      // console.log(lowerName)
      // console.log(lowerCategory);
    } 
    i = i + 1;
  }
}


var tableInfoId = document.getElementById("table-info-items");

function closePopup() {
  modal.style.display = "none";
}
// https://www.youtube.com/watch?v=jfYWwQrtzzY
// https://www.javascripttutorial.net/web-apis/javascript-drag-and-drop/
function drag(e) {
  e.dataTransfer.setData("id", e.target.id);
  console.log("Drag start "+e.target.id);
}
//By default dropping is not allowed but we disable it 
function allowDrop(e) {
  e.preventDefault();
}

function drop(e, tableName) {
  e.preventDefault();
  console.log(e.dataTransfer.getData("id")+tableName);
  addItemToTable(tableName, e.dataTransfer.getData("id"));
}

function addItemToTable(tableName, menuItemName) {
  console.log(tableName);
  console.log(menuItemName);
  let tables = JSON.parse(localStorage.getItem("tables"));
  console.log(tables);
  let currentOrder = menu[menuItemName];
  //Adding Item to Orders
  if (tables[tableName]["orders"][menuItemName] == undefined) {
    tables[tableName]["orders"][menuItemName] = 1;
  } else {
    tables[tableName]["orders"][menuItemName] += 1;
  }
  //Displaying cost of items
  tables[tableName].cost += parseInt(currentOrder.cost);
  tables[tableName]["items"] += 1;
  localStorage.setItem("tables", JSON.stringify(tables));
  refresh();
  searchTable();
}

function openPopup(tableName) {
  popup.style.display = "block";
  document.getElementById(
    "popup-table-name"
  ).innerHTML = `<h2> ${tableName.toUpperCase()}
   <\h2>`;
  tableInfoId.innerHTML = `<tr>
    <td>
        S.No
    </td>
    <td>
        Item Name
    </td>
    <td>
        Quantity
    </td>
    <td>
        Delete
    </td>
</tr>`;
  createRows(tableName);
}

function createRows(tableName) {
  let i = 0;
  let tables = JSON.parse(localStorage.getItem("tables"));
  console.log(tables)
  let { cost, orders: currentOrders } = tables[tableName];
  console.log(cost);
  for (let [item, quantity] of Object.entries(currentOrders)) {
    i++;
    tableInfoId.innerHTML += `<tr>
    <td>
        ${i}
    </td>
    <td>
         ${menu[item].name}
    </td>
    <td>
    <button onclick="decreaseItem('${tableName}','${item}')" class="change">-</button>
      ${quantity}
    <button onclick="increaseItem('${tableName}','${item}')" class="change">+</button>
    </td>
    <td>
    <button onclick="deleteItem('${tableName}','${item}')">
    Delete
    </button>
    </td>   
</tr>`;
  }
  
  let footer = document.getElementById("popup-footer");
  footer.innerHTML = "";
  let generateBillButton = document.getElementById("bill");
  generateBillButton.innerHTML = "";
  if (cost != 0) {
    footer.innerHTML = `
      <h2>
        Total Cost :
        ${cost}
      </h2>`;
    generateBillButton.innerHTML = `<button onclick="Bill('${tableName}')" id="button-close">
         Pay Bill
        </button>`;
  }
}

function increaseItem(tableName, item) {
  let tables = JSON.parse(localStorage.getItem("tables"));
  let currentTable = tables[tableName];
  let itemCost = menu[item]["cost"];
  currentTable["orders"][item] = currentTable["orders"][item] + 1;
  currentTable["cost"] = parseInt(currentTable["cost"]) + itemCost;
  currentTable["items"] += 1;
  tables[tableName] = currentTable;
  localStorage.setItem("tables", JSON.stringify(tables));
  refresh();
  openPopup(tableName);
}

function decreaseItem(tableName, item) {
  let tables = JSON.parse(localStorage.getItem("tables"));
  let currentTable = tables[tableName];
  if (currentTable["orders"][item] == 1) {
    console.log("Cannot delete 1 item");
    return;
  }
  let itemCost = menu[item]["cost"];
  currentTable["orders"][item] = currentTable["orders"][item] - 1;
  currentTable["cost"] = currentTable["cost"] - itemCost;
  currentTable["items"] -= 1;
  tables[tableName] = currentTable;
  localStorage.setItem("tables", JSON.stringify(tables));
  refresh();
  openPopup(tableName);
}

function deleteItem(tableName, item) {
  let tables = JSON.parse(localStorage.getItem("tables"));
  let currentTable = tables[tableName];
  let itemCount = currentTable["orders"][item];
  let itemCost = menu[item]["cost"];
  delete currentTable["orders"][item];
  currentTable["cost"] = parseInt(currentTable["cost"]) - itemCount * itemCost;
  currentTable["items"] -= itemCount;
  tables[tableName] = currentTable;
  localStorage.setItem("tables", JSON.stringify(tables));
  refresh();
  openPopup(tableName);
}

function Bill(tableName) {
  let tables = JSON.parse(localStorage.getItem("tables"));
  let currentTable = tables[tableName];
  let { cost } = currentTable;
  let emptyOrderObject = {};
  currentTable["cost"] = 0;
  currentTable["items"] = 0;
  currentTable["orders"] = emptyOrderObject;
  tables[tableName] = currentTable;
  localStorage.setItem("tables", JSON.stringify(tables));
  window.alert(`Total bill amount is ${cost}`);
  closePopup();
  refresh();
}
