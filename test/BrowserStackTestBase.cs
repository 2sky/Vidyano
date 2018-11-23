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
        private static readonly JObject credentials;
        private static readonly JObject profiles;
        public static string Build = "DEV";
        protected RemoteWebDriver driver;

        static BrowserStackTestBase()
        {
            var folder = System.IO.Path.GetDirectoryName(typeof(BrowserStackTestBase).Assembly.Location);
            credentials = JObject.Parse(File.ReadAllText(System.IO.Path.Combine(folder, "credentials.json")));
            profiles = JObject.Parse(File.ReadAllText(System.IO.Path.Combine(folder, "profiles.json")));

            var byteArray = Encoding.ASCII.GetBytes($"{(string)credentials["browserstack.user"]}:{(string)credentials["browserstack.key"]}");
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
            capability.SetCapability("browserstack.key", (string)credentials["browserstack.key"]);
            capability.SetCapability("browserstack.user", (string)credentials["browserstack.user"]);

            foreach (var cap in (JObject)profiles["default"])
                capability.SetCapability(cap.Key, (string)cap.Value);

            foreach (var cap in (JObject)profiles[Profile])
                capability.SetCapability(cap.Key, (string)cap.Value);

            capability.SetCapability("name", GetType().Name);
            capability.SetCapability("build", Build);

            return capability;
        }

        protected virtual void SignIn(string server, string key)
        {
            var username = driver.FindElement(By.Id("username"));
            username.SendKeys("Test");
            username.SendKeys(Keys.Enter);

            var password = driver.FindElement(By.Id("password"));

            var token = Guid.NewGuid().ToString();
            var payload = new JObject(new JProperty("token", token), new JProperty("key", key)).ToString(Newtonsoft.Json.Formatting.None);
            var result = ciRest.PostAsync(new Uri(server).GetLeftPart(UriPartial.Authority) + "/api/PreAuthenticate", 
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
            
            driver.Navigate().GoToUrl((string)credentials["vidyano.ci.server"]);

            SignIn((string)credentials["vidyano.ci.server"], (string)credentials["vidyano.ci.preauthenticate.key"]);
        }

        [TearDown]
        public void Cleanup()
        {
            var context = NUnit.Framework.Internal.TestExecutionContext.CurrentContext;
            if (context.CurrentResult.ResultState != NUnit.Framework.Interfaces.ResultState.Success)
            {
                var error = new JObject { new JProperty("status", "failed"), new JProperty("reason", $"{context.CurrentResult.Message}\n{context.CurrentResult.StackTrace}") };
                bsRest.PutAsync($"https://api.browserstack.com/automate/sessions/{driver.SessionId}.json",
                                new StringContent(error.ToString(Newtonsoft.Json.Formatting.None),
                                Encoding.UTF8, "application/json")).GetAwaiter().GetResult();
            }

            driver.Quit();
        }
    }
}