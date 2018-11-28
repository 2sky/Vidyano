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
            return (IWebElement)driver.ExecuteAsyncScript($"{Properties.Resources.QueryGrid}\nfindGridByQueryName('{queryName}', arguments[arguments.length - 1]);");
        }
    }
}