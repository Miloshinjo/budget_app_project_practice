
// MODULE 1 - BUDGET CONTROLLER for our Data Structure.
var budgetController = (function() {
    // budgetController is an object that will contain methods and properties that get returned.
    // variables in this module are hidden from the public scope because of the IIFE we created.

    var Expense =  function(id, description, value) { // function constructor for Expense objects that are created
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    // a method that will calculate the percentage of each item compared to the total income. We will pass totalincome to the function and calculate the % from it.
    Expense.prototype.calcPercentage = function(totalIncome) {
        // this should only happen if totla income is greater then 0.
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100) // value of the expense divided by total income times 100 = percentages, but rounded with Math.round method.
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentages = function() { // this function returns the percentage. we do this in order to have simpler functions, so that 1 function performs 1 task. that is the principle of good code.
        return this.percentage;
    }

    var Income =  function(id, description, value) { // function constructor for Income objects that are created
        this.id = id;
        this.description = description;
        this.value = value;
    };
    // function that will calculate the total expenses or incomes
    var calculateTotal = function(type) {
        var sum = 0; // initial value
        data.allItems[type].forEach(function(cur){ // looping over an array and adding each item to the sum
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };
    var data = { // an object where we will put all the data and have nice data structure (incomes and expenses and totals)
        allItems: { // another object that will store our incomes and expenses (it's a better way of doing things instead of making many separate arrays)
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return { // this return will contain all the methods we wanna expose to the public.
        addItem: function(type, des, val) { // this function will receive 3 arguments we set to add new exp or inc. different names are used for less confusion.
            var newItem, ID;

            // [1 2 3 4 5], next ID = 6
            // [1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // this is the ID for every new item.
            } else {
                ID = 0;
            }


            // create new item based on inc or exp type
            if (type === 'exp') {  // getting the input here, using if/else cause we know ID will be inc or exp.
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // push it into our data structure
            data.allItems[type].push(newItem); // type is exp/inc and it's same as in our allItems. we .push newly created item.
            return newItem; // we are returning it so that other module has the access to it
        },

        // function to delete an item from our data structure. we will create an array that will store all IDs in it.
        deleteItem: function(type, id) {
            var ids, index;
            // id = 3
            // data.allItems[type][id]
            // ids = [1 2 3 4 6 8]

            ids = data.allItems[type].map(function(current){ // cool method to loop over arrays, just instead of forEach, map returns a brand new array.
                return current.id;
            });

            index = ids.indexOf(id); // .indexOf array method returns the index number of an array

            if (index !== -1) { // index can be -1 if ID doesn't exist, that's why we use and if statement here.
                data.allItems[type].splice(index, 1) // .splice array method, removes an item from an array. we pass 2 arguments, 1) position number of an item we wanna remove 2) number of elements we want to delete.
            }

        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we spent

            if (data.totals.inc > 0) { // we want this to happen only if we have some incomes.
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); // round the percentages to the closest integer.
            } else {
                data.percentage = -1; // -1 is basicly same sa non-existant, that's why we use it.
            }
        },

        calculatePercentages: function() {

            /*
            Expenses:
            a=20
            b=10
            c=40
            income = 100;
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc); // passing the totals here that is stored in data.totals object.
            })

        },



        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data);
        }
    };

})();




// MODULE 2 - UI CONTROLLER - for the User Interface.
var UIController = (function(){
    // method to get the input and it has to be a public function exposed to global scope. that's why it has to be in the object that this IIFE will return

    var DOMstrings = { // and object that will hold all strings. easier to navigate and to structure the code, to prevent bugs. call the Object in order to use a string. DOMstrings.something.
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list', // this is the element we wanna select if we have an income
        expensesContainer: '.expenses__list', // this is the element we wanna select if we have an expense
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, sign;
        /*  Rules:
            + or - before the number
            exatly 2 decimal points
            comma separating the thousands

            2310.4567 --> + 2,310.46
            2000 --> + 2,000.00
        */

        num = Math.abs(num); // .abs method removes the sign of the number, making it absolute.
        num = num.toFixed(2); // toFixed is a number prototype. this puts exactly 2 decimal numbers on any number we give it. converts number to a string.
        numSplit = num.split('.') // dividing the number into 2 parts. the integer part and the decimal part. it gets stored into an array.

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // .substr method --> starting at position 0 and reading )(int.length - 1) element. so that way we always have a comma at the thoustands. input 23510, output 23,510.
        }

        dec = numSplit[1];

        // type === 'exp' ? sign = '-' : sign = '+'; // ternery operator

        return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' + dec;


    };

    var nodeListForEach = function(list, callback) { // this is a piece of reusable code, each time we have a node list we can call this function to loop over it.
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i); // passed current and index to this function. power of first class functions.
        }
    };

    return {
        getInput: function() {

            return { // we are returning this values in an object.
                type: document.querySelector(DOMstrings.inputType).value, // because of the special HTML, 2 values will be selected, either "inc" or "exp"
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // handy function that converts a string into a number with decimals. we need a number here instead of a string in order to do calculations.
            };
        },

        addListItem: function(obj, type) { // obj is the newly created inc or exp in the newItem variable. type is inc or exp
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; // html string for income. Placeholder text is marked with %text% so it's easier to find and override.
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; // html string for expense
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id) // .replace method searches for a string and replaces it with the data we put into the method.
            newHtml = newHtml.replace('%description%', obj.description); // we use newHtml here instead of html cause new one has the Id replaced
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); // all HTML will be inserted as the last child (after all others, which is !important) of the element containers we made in DOMstrings and HTML.

        },

        // function to remove the item from the DOM
        deleteListItem: function(selectorID) { // argument is the entire ID we are removing
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el) // in JS we can only remove a child, that's why we select the parent, and then the child we are removing.
        },
        // to clear the HTML fields after an input has been made.
        clearFields: function()  {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); // selecting the strings we wanna empty, it is seleceted like this since it's similar to CSS selecting with a comma. QuerySelectorAll doesn't return an array but a list (that doesn't have array methods). We gotta convert the list to an array, using the method called .slice.

            fieldsArr = Array.prototype.slice.call(fields); // this will trick the slice method into thinking we are giving it an array. We are setting the "this" variable of the slice method to fields and making a fields array.
            fieldsArr.forEach(function(current, index, array) { // we pass a callback function into this array and the function is applied to each element of this array. we can pass 3 arguments into this array. 'current' item / 'index' (position number) / entire 'array'.
                current.value = ""; // value of current is set to empty and fields are cleared.
            });

            fieldsArr[0].focus(); // setting our focus with the focus method back to the 1st element in the fieldsArr.
        },
        // method to display the budget to the UI
        displayBudget: function(obj) {

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // this returns a node.list. we need to loop over these elements and change the TextContent. We can convert it to an array in order to loop over it, but that is a more like a hack. We will create our forEach function but for node lists.



            nodeListForEach(fields, function(current, index){ // callback function has the current element and indexOf as arguments.

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth: function() {
            var now, year, month, months;

            now = new Date(); // using the Date function constructor

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth(); // getMonth prototype that gets us a current month. it gives the numbers of months, not names.

            year = now.getFullYear(); // using the get Full Year prototype that will return the correct year

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;


        },

        changedType: function() { // we want 3 elements to change color on focus and for a button to change color to red. best way to do this is to add a class to the html.

            var fields = document.querySelectorAll( // this returns a node list, in order to loop over it, we use our Node List for each function
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function(){ // exposing DOMstrings object to the public scope.
            return DOMstrings;
        }
     };

})();




// MODULE 3 - GLOBAL APP CONTROLLER - This module's purpose is to connect the previous 2 modules since they don't know about each other. Because of that we pass them into it as we pass arguments to a function. budgetCtrl and UICtrl are arguments, and we pass our first 2 modules as those arguments.
var controller = (function(budgetCtrl, UICtrl) {
    // Step 1: setting up evend handler for the Input button. What happens when we click it.
    var setupEventListeners =  function() { // setting all event Listeners in one function so that code is not messy.

        var DOM = UICtrl.getDOMstrings(); // using this method from UI controller in this main one

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); // we create ctrlAddItem function because we want to use it on the mouse-click and on the keypress events, so to respect the DRY principle.

        document.addEventListener('keypress', function(event){

            if (event.keyCode === 13 || event.which === 13) {  // event.which is used for the older browsers who don't have the keyCode property of the event object.
                    ctrlAddItem();

             }

        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); // Event delegation. We are selecting a parent element of the delete buttons we wanna select because they are not in the DOM when we load the page. First common class for incomes and expenses is the .container class.
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updatePercentages = function() {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        // 2. Read them from budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var updateBudget = function () {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }
    var ctrlAddItem = function() {
            var input, newItem;

            // 1. Get the field input data
            input = UICtrl.getInput();

            if (input.description !== "" && !isNaN(input.value) && input.value > 0) { // in order to prevent adding of empty fields.

                // 2. Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value); // addItem method accepts 3 parameters and we passed them to it.
                // 3. Add the new item to the UI
                UICtrl.addListItem(newItem, input.type);

                // 4. Clear the fields

                UICtrl.clearFields();

                // 5. Calculate and Update the budget
                updateBudget();

                // 6. Calculate and update percentages
                updatePercentages();
            }

    };

    var ctrlDeleteItem = function(event) { // we have to pass te 'event' to this function
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // DOM traversing. We are targeting a parent element of the element we are clicking, cause we wanna remove it. Using it 4 times cause the parent is 4 parents away from the button we are clicking. We are selecting it's ID. This will select the unique ID, cause we don't have many IDs in the HTML document.

        if (itemID) {

            splitID = itemID.split('-'); // .split method, useful for spliting strings into 2. element in bracets is the one where we split it. It creates an array of elemnts it splits.
            type = splitID[0];
            ID = parseInt(splitID[1]); // we have to convert the string into an integet here cause our function will compare the IDs as numbers.

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };


        return { // stuff we wanna make public we return it in an object.
            init: function() { // place where all the code is that executes when the application starts
                console.log('Application has started! Go wild with it!')
                UICtrl.displayMonth();
                UICtrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                }); // display the budget when the app starts, so that all is set to 0. pretty neat trick!
                setupEventListeners(); // calls and sets up event listeners.


            }
        }
})(budgetController, UIController);


controller.init(); // our init function call. without this, program won't start (no event listeners)