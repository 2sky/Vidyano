function executeAsync(functionName, args, done) {
    var fnc = window[functionName];
    var interval = setInterval(function () {
        var result = fnc.apply(window, args);
        if (result !== undefined) {
            clearInterval(interval);
            done(result);
        }
    }, 250);
}
function findGridByQueryName(queryName) {
    var grids = Array.from(document.querySelectorAll("vi-query-grid:not(.initializing)"));
    return grids.find(function (grid) { return grid.query && grid.query.name === queryName; });
}
