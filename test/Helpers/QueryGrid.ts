function findGridByQueryName(queryName: string): Vidyano.WebComponents.QueryGrid {
    const grids = <Vidyano.WebComponents.QueryGrid[]>Array.from(document.querySelectorAll("vi-query-grid:not(.initializing)"));
    return grids.find(grid => grid.query && grid.query.name === queryName);
}