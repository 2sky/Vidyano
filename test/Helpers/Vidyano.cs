using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vidyano.Test.Helpers
{
    public static class Vidyano
    {
        public static object ExecuteVidyano(this RemoteWebDriver driver, string function, params object[] arguments)
        {
            return driver.ExecuteAsyncScript($"executeAsync('{function}', [{string.Join(", ", arguments.Select(a => a is String str ? $"'{str}'" : a))}], arguments[arguments.length - 1]);");
        }
    }
}