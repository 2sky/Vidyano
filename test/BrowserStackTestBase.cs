using Newtonsoft.Json.Linq;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Vidyano.Test
{
    public class BrowserStackTestBase
    {
        private static HttpClient ciRest = new HttpClient();
        private static HttpClient bsRest = new HttpClient();
        private static readonly string assemblyFolder = System.IO.Path.GetDirectoryName(typeof(BrowserStackTestBase).Assembly.Location);
        private static readonly JObject browserstack;
        private static readonly JObject profiles;
        private bool verifyBuild = true;
        protected RemoteWebDriver driver;

        static BrowserStackTestBase()
        {
            browserstack = JObject.Parse(File.ReadAllText(System.IO.Path.Combine(assemblyFolder, "browserstack.json")));
            profiles = JObject.Parse(File.ReadAllText(System.IO.Path.Combine(assemblyFolder, "profiles.json")));

            var byteArray = Encoding.ASCII.GetBytes($"{(string)browserstack["browserstack.user"]}:{(string)browserstack["browserstack.key"]}");
            bsRest.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
        }

        public BrowserStackTestBase(string profile, string path = "")
        {
            Profile = profile;
        }

        public string Profile { get; }

        public string Path { get; }

#pragma warning disable CS0618
        protected virtual DesiredCapabilities CreateCapability()
        {
            var capability = new DesiredCapabilities();
            capability.SetCapability("browserstack.key", (string)browserstack["browserstack.key"]);
            capability.SetCapability("browserstack.user", (string)browserstack["browserstack.user"]);

            foreach (var cap in (JObject)profiles["default"])
                capability.SetCapability(cap.Key, (string)cap.Value);

            foreach (var cap in (JObject)profiles[Profile])
                capability.SetCapability(cap.Key, (string)cap.Value);

            capability.SetCapability("name", GetType().Name);

            var build = (string)browserstack["build"];
            if (string.IsNullOrEmpty(build))
            {
                var latest = ciRest.GetAsync(new Uri((string)browserstack["vidyano.ci.server"]).GetLeftPart(UriPartial.Authority) + "/api/latest").GetAwaiter().GetResult();
                build = latest.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                verifyBuild = true;
            }

            capability.SetCapability("build", build);

            return capability;
        }

        protected virtual void SignIn()
        {
            Assert.That(driver.FindElement(By.CssSelector("vi-app-route.active[route^=\"SignIn\"]")), Is.Not.Null, "No active sign in route found.");

            if (verifyBuild)
            {
                var versionFile = System.IO.Path.Combine(assemblyFolder, "version.txt");
                if (File.Exists(versionFile))
                    Assert.That((bool)driver.ExecuteScript($"return Vidyano.version.endsWith('{File.ReadAllText(versionFile)}')"), Is.True, "Invalid test version.");
            }

            var username = driver.FindElement(By.Id("username"));
            username.SendKeys("Test");
            username.SendKeys(Keys.Enter);

            var password = driver.FindElement(By.Id("password"));

            var token = Guid.NewGuid().ToString();
            var payload = new JObject(new JProperty("token", token), new JProperty("key", (string)browserstack["vidyano.ci.preauthenticate.key"])).ToString(Newtonsoft.Json.Formatting.None);
            var result = ciRest.PostAsync(new Uri((string)browserstack["vidyano.ci.server"]).GetLeftPart(UriPartial.Authority) + "/api/PreAuthenticate", 
                new StringContent(payload, Encoding.UTF8, "application/json")).GetAwaiter().GetResult();

            Assert.That(result.StatusCode, Is.EqualTo(HttpStatusCode.OK));

            password.SendKeys(token);
            password.SendKeys(Keys.Enter);
        }

        [SetUp]
        public void Init()
        {
            driver = new RemoteWebDriver(new Uri("https://hub-cloud.browserstack.com/wd/hub/"), CreateCapability());
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(30);
            
            driver.Navigate().GoToUrl((string)browserstack["vidyano.ci.server"]);

            SignIn();
        }

        [TearDown]
        public void Cleanup()
        {
            if (TestContext.CurrentContext.Result.Outcome != NUnit.Framework.Interfaces.ResultState.Success)
            {
                var error = new JObject { new JProperty("status", "failed"), new JProperty("reason", $"{TestContext.CurrentContext.Result.Message}\n{TestContext.CurrentContext.Result.StackTrace}") };
                bsRest.PutAsync($"https://api.browserstack.com/automate/sessions/{driver.SessionId}.json",
                                new StringContent(error.ToString(Newtonsoft.Json.Formatting.None),
                                Encoding.UTF8, "application/json")).GetAwaiter().GetResult();
            }

            driver.Quit();
        }
    }
}