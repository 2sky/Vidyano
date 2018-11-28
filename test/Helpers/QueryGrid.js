function findGridByQueryName(queryName, done) {
    var grids = Array.from(document.querySelectorAll("vi-query-grid:not(.initializing)"));
    var grid = grids.find(function (grid) { return grid.query && grid.query.name === queryName; });
    if (grid)
        done(grid);
    else
        setTimeout(function () { return findGridByQueryName(queryName, done); }, 1000);
}
