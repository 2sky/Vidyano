using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Vidyano.Web2.Build
{
    class Deploy
    {
        static IConfigurationRoot Configuration { get; set; }
        static readonly HttpClient cf = new HttpClient() { BaseAddress = new Uri("https://api.cloudflare.com/") };

        static Deploy()
        {
            var builder = new ConfigurationBuilder();
            builder.AddJsonFile("/run/secrets/e359c69b-d2bb-4f80-a344-2b6e64a0f5a4/secrets.json");

            Configuration = builder.Build();
        }

        public static async Task Run(string version, string folder)
        {
            BlobServiceClient blobServiceClient = new BlobServiceClient(GetSecret("Blob-ConnectionString"));
            BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient("$web");

            var files = Directory.GetFiles(folder, "*", SearchOption.AllDirectories);
            foreach(var file in files)
            {
                var fileName = file.Substring($"builds/{version}/".Length);
                Console.Write($"Uploading file {fileName}...");

                BlobClient blobClient = containerClient.GetBlobClient(@$"{version}/{fileName}");
                using FileStream uploadFileStream = File.OpenRead(file);
                await blobClient.UploadAsync(uploadFileStream, new BlobHttpHeaders
                {
                    ContentType = GetContentType(file)
                }, conditions: null);
                uploadFileStream.Close();
                
                Console.WriteLine("Done");
            }

            var value = await GetKV(version);
            var cdnVersion = value == null ? new CDNVersion() : JsonConvert.DeserializeObject<CDNVersion>(value);

            cdnVersion.Version = version;
            cdnVersion.Files = files.Select(file => file.Substring($"builds/{version}/".Length)).ToArray();

            Console.Write("Updating Version KV...");
            await PutKV(version, JsonConvert.SerializeObject(cdnVersion));
            Console.WriteLine("Done");
        }

        static async Task<string> GetKV(string key)
        {
            var msg = new HttpRequestMessage(HttpMethod.Get, $"client/v4/accounts/{GetSecret("Cloudflare-AccountKey")}/storage/kv/namespaces/{GetSecret("Cloudflare-KV")}/values/{key}");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", GetSecret("Cloudflare-ApiKey"));

            var result = await cf.SendAsync(msg);
            return await result.Content.ReadAsStringAsync();
        }

        static async Task PutKV(string key, string value)
        {
            var msg = new HttpRequestMessage(HttpMethod.Put, $"client/v4/accounts/{GetSecret("Cloudflare-AccountKey")}/storage/kv/namespaces/{GetSecret("Cloudflare-KV")}/values/{key}");
            msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", GetSecret("Cloudflare-ApiKey"));
            msg.Content = new StringContent(value, Encoding.UTF8, "text/plain");

            await cf.SendAsync(msg);
        }

        static string GetSecret(string key)
        {
            return Configuration.GetSection(key).Value;
        }

        static string GetContentType(string file)
        {
            if (file.EndsWith(".ts"))
                return "text/x.typescript";

            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if(!provider.TryGetContentType(file, out var contentType))
                contentType = "application/octet-stream";

            return contentType;
        }

        class CDNVersion
        {
            [JsonProperty("version")]
            public string Version { get; set; }

            [JsonProperty("files")]
            public string[] Files { get; set; }

            [JsonProperty("lastFilesRequested")]
            public string LastFilesRequested { get; set; }

            [JsonProperty("lastInfoRequested")]
            public string LastInfoRequested { get; set; }
        }
    }
}