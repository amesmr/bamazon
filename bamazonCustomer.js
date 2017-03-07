// dependency for inquirer npm package
var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3336,
    user: "root",
    password: "root",
    database: "bamazon"
});



// this is the Main Menu
function start() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
            "Shop",
            "Manage",
            "Supervise",
            new inquirer.Separator(),
            "Quit"
        ]
    }]).then(function (answ) {
        if (answ.action == "Shop") {
            shop();
        } else if (answ.action == "Manage") {
            manage();
        } else if (answ.action == "Supervise") {
            supervise();
        } else {
            connection.end();
            return false;
        }
    });
}


// item_id (unique id for each product)
// product_name (Name of product)
// department_name
// price (cost to customer)
// stock_quantity (how much of the product is available in stores)

function shop() {
    var idArry = [];
    var nameArry = [];
    var storedName = "";

    connection.query("SELECT * FROM products", {}, function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log("\n   Product Name: " + res[i].product_name + "\n   Dept. Name: " + res[i].department_name + "\n   Price: " + res[i].price);
            idArry.push(res[i].item_id.toString());
            nameArry.push(res[i].product_name);
        }
        // add these two to the name array to let the user bail or Main Menu if they wish
        nameArry.push(new inquirer.Separator());
        nameArry.push("Quit");
        nameArry.push("Main Menu");
        nameArry.push(new inquirer.Separator());
        // just for padding
        console.log();
        // console.log(idArry);
        inquirer.prompt([{
            type: "list",
            name: "name",
            message: "Please slelect the item that you wish to purchase.",
            choices: nameArry
        }]).then(function (answ) {
            if (answ.name == "Quit") {
                connection.end();
                return false;
            } else if (answ.name == "Main Menu") {
                start();
            } else {
                storedName = answ.name;
                // nested the prompts to catch Quit and Main Menu
                inquirer.prompt([{
                    type: "input",
                    name: "qty",
                    message: "How many would you like?"
                }]).then(function (answ) {
                    connection.query("SELECT * FROM products WHERE item_id = ?", [idArry[nameArry.indexOf(storedName)]], function (err, res) {
                        if (err) throw err;
                        // console.log("Current qty = " + currentQty);
                        if (res[0].stock_quantity < answ.qty) {
                            console.log("\nSORRY!  There's only " + res[0].stock_quantity + " left in stock.  Please adjust your quantity.\n");
                        } else {
                            var currentQty = res[0].stock_quantity;
                            var newTotalSales = res[0].product_sales + (parseInt(answ.qty) * res[0].price);
                            console.log(answ.qty + " @ " + res[0].price + " = $" + parseInt(answ.qty) * res[0].price + "  Total Sales = $" + newTotalSales + "\n");
                            // console.log("type: "+ typeof newTotalSales);
                            connection.query("UPDATE products SET stock_quantity=?, product_sales=? WHERE item_id =?", [parseInt(currentQty - answ.qty), newTotalSales, parseInt(idArry[nameArry.indexOf(storedName)])], function (err, res) {
                                if (err) throw err;
                            });
                        }
                        start();
                    });
                });
            }
        });
    });
}

function manage() {
    // List a set of menu options:
    //     View Products for Sale
    //     View Low Inventory
    //     Add to Inventory
    //     Add New Product
    // If a manager selects View Products for Sale, 
    //     the app should list every available item: the item IDs, names, prices, and quantities.
    // If a manager selects View Low Inventory, 
    //     then it should list all items with a inventory count lower than five.
    // If a manager selects Add to Inventory, 
    //     your app should display a prompt that will let the manager "add more" of any item currently in the store.
    // If a manager selects Add New Product, 
    //     it should allow the manager to add a completely new product to the store.
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product",
            new inquirer.Separator(),
            "Main Menu",
            "Quit",
            new inquirer.Separator(),
        ]
    }]).then(function (answ) {
        if (answ.action == "View Products for Sale") {
            viewProducts();
        } else if (answ.action == "View Low Inventory") {
            viewLowInventory();
        } else if (answ.action == "Add to Inventory") {
            addToInventory();
        } else if (answ.action == "Add New Product") {
            addNewProduct();
        } else if (answ.action == "Main Menu") {
            start();
        } else {
            connection.end();
            return false;
        }
    });
}

function viewProducts() {
    connection.query("SELECT * FROM products", {}, function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log("\n   Product Name: " + res[i].product_name + "\n   Dept. Name: " + res[i].department_name + "\n   Price: " + res[i].price + "\n   Qty In Stock: " + res[i].stock_quantity);
        }
        console.log("\n\n");
        manage();
    });
}

function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", {}, function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log("\n   Product Name: " + res[i].product_name + "\n   Dept. Name: " + res[i].department_name + "\n   Price: " + res[i].price + "\n   Qty In Stock: " + res[i].stock_quantity);
        }
        console.log("\n\n");
        manage();
    });
}

function addToInventory() {

    var idArry = [];
    var nameArry = [];
    var storedName = "";

    connection.query("SELECT * FROM products", {}, function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id + "\n   Product Name: " + res[i].product_name + "\n   Dept. Name: " + res[i].department_name + "\n   Price: " + res[i].price + "\n   Quantity in Stock: " + res[i].stock_quantity);
            idArry.push(res[i].item_id.toString());
            nameArry.push(res[i].product_name);
        }
        // add these two to the name array to let the user bail or Main Menu if they wish
        nameArry.push(new inquirer.Separator());
        nameArry.push("Quit");
        nameArry.push("Main Menu");
        nameArry.push(new inquirer.Separator());
        // just for padding
        console.log();
        // console.log(idArry);
        inquirer.prompt([{
            type: "list",
            name: "name",
            message: "To which item do you wish to add inventory?",
            choices: nameArry
        }, {
            type: "input",
            name: "qty",
            message: "How many would you like to add?"
        }]).then(function (answ) {
            connection.query("SELECT * FROM products WHERE item_id = ?", [idArry[nameArry.indexOf(answ.name)]], function (err, res) {
                if (err) throw err;
                connection.query("UPDATE products SET stock_quantity=? WHERE item_id =?", [res[0].stock_quantity + parseInt(answ.qty), parseInt(idArry[nameArry.indexOf(answ.name)])], function (err, res) {
                    if (err) throw err;
                });
                // show the updated data
                viewProducts();
            });
        });
    });
}

function addNewProduct() {
    var depts = [];
    connection.query("SELECT DISTINCT department_name FROM product_sales", function (err, res) {
        for (i = 0; i < res.length; i++) {
            depts.push(res[i].department_name);
        }
        inquirer.prompt([{
            type: "input",
            name: "name",
            message: "Enter product name"
        }, {
            type: "list",
            name: "dept",
            message: "Enter department name",
            choices: depts
        }, {
            type: "input",
            name: "price",
            message: "Enter price per unit"
        }, {
            type: "input",
            name: "qty",
            message: "Enter quantity"
        }]).then(function (answ) {
            connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES(?,?,?,?)", [answ.name, answ.dept, parseFloat(answ.price), parseInt(answ.qty)], function (err, res) {
                if (err) throw err;
                // show the updated data
                viewProducts();
            });
        });
    });
}



function supervise() {
    // Create a new MySQL table called departments. Your table should include the following columns:
    //      department_id
    //       department_name
    //      over_head_costs (A dummy number you set for each department)
    //      total_sales
    // Modify the products table so that theres a product_sales column and modify the bamazonCustomer.js app so that this value is updated with each individual products total revenue from each sale.
    // Modify your bamazonCustomer.js app so that when a customer purchases anything from the store, the program will calculate the total sales from each transaction.
    // Add the revenue from each transaction to the total_sales column for the related department.
    // Make sure your app still updates the inventory listed in the products column.
    // Create another Node app called bamazonSupervisor.js. Running this application will list a set of menu options:
    // View Product Sales by Department
    // Create New Department
    // When a supervisor selects View Product Sales by Department, the app should display a summarized table in their terminal/bash window. Use the table below as a guide.
    // department_id	department_name	over_head_costs	product_sales	total_profit
    // 01	Electronics	10000	20000	10000
    // 02	Clothing	60000	100000	40000
    // The total_profit should be calculated on the fly using the difference between over_head_costs and total_sales. total_profit should not be stored in any database. You should use a custom alias.
    // If you can't get the table to display properly after a few hours, then feel free to go back and just add total_profit to the departments table.
    // Hint: You may need to look into aliases in MySQL.
    // HINT: There may be an NPM package that can log the table to the console. What's is it? Good question :)
    console.log("\n");
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
            "View Total Sales by Department",
            "Add New Department",
            new inquirer.Separator(),
            "Main Menu",
            "Quit",
            new inquirer.Separator(),
        ]
    }]).then(function (answ) {
        if (answ.action == "View Total Sales by Department") {
            totalSales();
        } else if (answ.action == "Add New Department") {
            addDepartment();
        } else if (answ.action == "Main Menu") {
            start();
        } else {
            connection.end();
            return false;
        }
    });
}

function totalSales() {
    connection.query("SELECT department_name FROM product_sales", function (err, res) {
        // console.log(res);
        var list = [];
        var count = 0;
        var done = false;
        for (i = 0; i < res.length; i++) {
            list.push(res[i].department_name);
        }
        for (i = 0; i < list.length; i++) {
            connection.query("SELECT product_sales.department_name, product_sales.over_head_costs, SUM(products.product_sales) - product_sales.over_head_costs as total_profits FROM product_sales INNER JOIN products ON product_sales.department_name=? AND products.department_name=?", [list[i], list[i]], function (err, res) {
                if (err) throw err;
                count++;
                var profits = 0;
                // trick to get the $ in the right place
                if (res[0].total_profits < 0) {
                    profits = "-$" + -(res[0].total_profits);
                } else {
                    profits = "$" + res[0].total_profits;
                }
                console.log(" | Department Name: " + res[0].department_name + " | Department Overhead: " + res[0].over_head_costs + " | Total Profits: " + profits + " |");
                if (count == (list.length) && !done) {
                    done = true;
                    supervise();
                    return false;
                }
            });
        }
    });
}

function addDepartment() {
    inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: "What is the new department's name?"
        },
        {
            type: 'input',
            name: 'overhead',
            message: "What are the new department's overhead costs?"
        }
    ]).then(function (answ) {
        connection.query("INSERT INTO product_sales(department_name, over_head_costs) VALUES(?,?)", [answ.name, parseFloat(answ.overhead)], function (err, res) {
            if (err) throw err;
            // show the updated data
            totalSales();
        });
    });

}


start();