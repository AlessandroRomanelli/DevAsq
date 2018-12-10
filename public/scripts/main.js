String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};

function init() {
    handleRoomForms();
    handleLoginForm();
    handleLogout();

    addExplorerListener()

}

function addExplorerListener() {
    const row = document.getElementById("roomTable").querySelector("tr");
    const name = row.querySelector("th");
    const population = row.querySelectorAll("th")[1];

    name.ondblclick = sortName;

    population.ondblclick = sortPopulation;
}
