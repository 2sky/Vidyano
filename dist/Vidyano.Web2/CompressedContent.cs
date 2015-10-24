using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Vidyano.Web2
{
    internal sealed class CompressedContent : HttpContent
    {
        private readonly string encodingType;
        private readonly HttpContent content;

        public CompressedContent(HttpContent content, string encodingType = "gzip")
        {
            if (content == null)
                throw new ArgumentNullException(nameof(content));

            if (encodingType != "gzip" && encodingType != "deflate")
                throw new ArgumentException($"Encoding '{encodingType}' is not supported. Only gzip and deflate are supported.", nameof(encodingType));

            this.content = content;
            this.encodingType = encodingType;

            foreach (var header in content.Headers)
                Headers.TryAddWithoutValidation(header.Key, header.Value);

            Headers.ContentEncoding.Add(encodingType);
        }

        protected override bool TryComputeLength(out long length)
        {
            length = -1;
            return false;
        }

        protected override Task SerializeToStreamAsync(Stream stream, TransportContext context)
        {
            Stream compressedStream;

            switch (encodingType)
            {
                case "gzip":
                    compressedStream = new GZipStream(stream, CompressionMode.Compress, true);
                    break;

                case "deflate":
                    compressedStream = new DeflateStream(stream, CompressionMode.Compress, true);
                    break;

                default:
                    throw new NotSupportedException($"Can't use encoding '{encodingType}'.");
            }

            return content.CopyToAsync(compressedStream).ContinueWith(tsk =>
            {
                compressedStream?.Dispose();
            });
        }
    }
}