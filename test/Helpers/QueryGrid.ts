function findGridByQueryName(queryName: string, done: (result: Vidyano.WebComponents.QueryGrid) => void) {
    const grids = <Vidyano.WebComponents.QueryGrid[]>Array.from(document.querySelectorAll("vi-query-grid:not(.initializing)"));
    const grid = grids.find(grid => grid.query && grid.query.name === queryName);
    if (grid)
        done(grid);
    else
        setTimeout(() => findGridByQueryName(queryName, done), 1000);
}