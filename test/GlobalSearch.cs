using NUnit.Framework;
using OpenQA.Selenium;
using System.Linq;

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
            var input = driver.FindElement(By.CssSelector("vi-menu vi-input-search > input"));
            input.SendKeys(search);
            input.SendKeys(Keys.Enter);

            Assert.That(driver.FindElement(By.CssSelector("vi-query-grid:not(.initializing)")), Is.Not.Null);

            var firstRow = driver.FindElement(By.CssSelector("vi-query-grid tr[is='vi-query-grid-table-data-row']:first-of-type"));
            Assert.That(firstRow, Is.Not.Null, "Unable to find first data row.");
            Assert.That(driver.Title.StartsWith(search), Is.True, "Invalid title after search.");

            var cells = firstRow.FindElements(By.TagName("vi-query-grid-cell-default"));
            Assert.That(cells.FirstOrDefault(c => c.Text.Contains(search)), Is.Not.Null, "No match found.");
        }
    }
}
