using NUnit.Framework;
using OpenQA.Selenium;
using System.Linq;
using Vidyano.Test.Helpers;

namespace Vidyano.Test
{
    [TestFixture("chrome")]
    [TestFixture("safari")]
    [TestFixture("firefox")]
    [TestFixture("edge")]
    [TestFixture("ie")]
    [Parallelizable(ParallelScope.Fixtures)]
    public class GlobalSearch: BrowserStackTestBase
    {
        public GlobalSearch(string profile): base(profile) {}

        [Test]
        public void Search()
        {
            var search = "pei";
            var input = driver.FindElement(By.CssSelector("vi-menu vi-input-search > form > input"));
            input.SendKeys(search);
            input.SendKeys(Keys.Enter);

            var grid = driver.FindGridByQueryName("Customers");
            Assert.That(grid, Is.Not.Null, "Customers grid not found.");

            var firstRow = grid.FindElement(By.CssSelector("vi-query-grid tr[is='vi-query-grid-table-data-row']:first-of-type"));
            Assert.That(firstRow, Is.Not.Null, "Unable to find first data row.");

            var cells = firstRow.FindElements(By.TagName("vi-query-grid-cell-default"));
            Assert.That(cells.FirstOrDefault(c => c.Text.Contains(search)), Is.Not.Null, "No match found.");

            Assert.That(driver.Title.StartsWith(search), Is.True, "Invalid title after search.");
        }
    }
}