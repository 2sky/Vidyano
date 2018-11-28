using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vidyano.Test.Helpers
{
    public static class QueryGrid
    {
        public static IWebElement FindGridByQueryName(this RemoteWebDriver driver, string queryName)
        {
            return (IWebElement)driver.ExecuteVidyano("findGridByQueryName", queryName);
        }
    }
}