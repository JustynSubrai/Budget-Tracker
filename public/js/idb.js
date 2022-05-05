let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const budgetRec = transaction.objectStore("pending");
    budgetRec.add(record);
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const budget = transaction.objectStore("pending");
    const getAll = budget.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // clear db
                    const transaction = db.transaction(["pending"], "readwrite");
                    const budgetRec = transaction.objectStore("pending");
                    budgetRec.clear();
                })
                .catch((err) => {
                    console.log(err);
                });
        };
    }
};
    window.addEventListener("online", checkDatabase);