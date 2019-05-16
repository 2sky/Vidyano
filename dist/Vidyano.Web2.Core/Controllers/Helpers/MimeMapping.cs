using System.Collections.Generic;
using System.IO;

namespace Vidyano.Web2.Core.Controllers.Helpers {
    internal static class MimeMapping 
    { 
        private static readonly Dictionary<string, string> mappings = new Dictionary<string, string>(); 
 
        static MimeMapping() 
        { 
            mappings.Add(".323", "text/h323"); 
 
            mappings.Add(".asx", "video/x-ms-asf"); 
            mappings.Add(".acx", "application/internet-property-stream"); 
            mappings.Add(".ai", "application/postscript"); 
            mappings.Add(".aif", "audio/x-aiff"); 
            mappings.Add(".aiff", "audio/aiff"); 
            mappings.Add(".axs", "application/olescript"); 
            mappings.Add(".aifc", "audio/aiff"); 
            mappings.Add(".asr", "video/x-ms-asf"); 
            mappings.Add(".avi", "video/x-msvideo"); 
            mappings.Add(".asf", "video/x-ms-asf"); 
            mappings.Add(".au", "audio/basic"); 
            mappings.Add(".application", "application/x-ms-application"); 
 
            mappings.Add(".bin", "application/octet-stream"); 
            mappings.Add(".bas", "text/plain"); 
            mappings.Add(".bcpio", "application/x-bcpio"); 
            mappings.Add(".bmp", "image/bmp"); 
 
            mappings.Add(".cdf", "application/x-cdf"); 
            mappings.Add(".cat", "application/vndms-pkiseccat"); 
            mappings.Add(".crt", "application/x-x509-ca-cert"); 
            mappings.Add(".c", "text/plain"); 
            mappings.Add(".css", "text/css"); 
            mappings.Add(".cer", "application/x-x509-ca-cert"); 
            mappings.Add(".crl", "application/pkix-crl"); 
            mappings.Add(".cmx", "image/x-cmx"); 
            mappings.Add(".csh", "application/x-csh"); 
            mappings.Add(".cod", "image/cis-cod"); 
            mappings.Add(".cpio", "application/x-cpio"); 
            mappings.Add(".clp", "application/x-msclip"); 
            mappings.Add(".crd", "application/x-mscardfile"); 
 
            mappings.Add(".deploy", "application/octet-stream"); 
            mappings.Add(".dll", "application/x-msdownload"); 
            mappings.Add(".dot", "application/msword"); 
            mappings.Add(".doc", "application/msword"); 
            mappings.Add(".dvi", "application/x-dvi"); 
            mappings.Add(".dir", "application/x-director"); 
            mappings.Add(".dxr", "application/x-director"); 
            mappings.Add(".der", "application/x-x509-ca-cert"); 
            mappings.Add(".dib", "image/bmp"); 
            mappings.Add(".dcr", "application/x-director"); 
            mappings.Add(".disco", "text/xml"); 
 
            mappings.Add(".exe", "application/octet-stream"); 
            mappings.Add(".etx", "text/x-setext"); 
            mappings.Add(".evy", "application/envoy"); 
            mappings.Add(".eml", "message/rfc822"); 
            mappings.Add(".eps", "application/postscript"); 
 
            mappings.Add(".flr", "x-world/x-vrml"); 
            mappings.Add(".fif", "application/fractals"); 
 
            mappings.Add(".gtar", "application/x-gtar"); 
            mappings.Add(".gif", "image/gif"); 
            mappings.Add(".gz", "application/x-gzip"); 
 
            mappings.Add(".hta", "application/hta"); 
            mappings.Add(".htc", "text/x-component"); 
            mappings.Add(".htt", "text/webviewhtml"); 
            mappings.Add(".h", "text/plain"); 
            mappings.Add(".hdf", "application/x-hdf"); 
            mappings.Add(".hlp", "application/winhlp"); 
            mappings.Add(".html", "text/html"); 
            mappings.Add(".htm", "text/html"); 
            mappings.Add(".hqx", "application/mac-binhex40"); 
 
            mappings.Add(".isp", "application/x-internet-signup"); 
            mappings.Add(".iii", "application/x-iphone"); 
            mappings.Add(".ief", "image/ief"); 
            mappings.Add(".ivf", "video/x-ivf"); 
            mappings.Add(".ins", "application/x-internet-signup"); 
            mappings.Add(".ico", "image/x-icon"); 
 
            mappings.Add(".jpg", "image/jpeg"); 
            mappings.Add(".jfif", "image/pjpeg"); 
            mappings.Add(".jpe", "image/jpeg"); 
            mappings.Add(".jpeg", "image/jpeg"); 
            mappings.Add(".js", "application/x-javascript"); 
 
            mappings.Add(".lsx", "video/x-la-asf"); 
            mappings.Add(".latex", "application/x-latex"); 
            mappings.Add(".lsf", "video/x-la-asf"); 
 
            mappings.Add(".manifest", "application/x-ms-manifest"); 
            mappings.Add(".mhtml", "message/rfc822"); 
            mappings.Add(".mny", "application/x-msmoney"); 
            mappings.Add(".mht", "message/rfc822"); 
            mappings.Add(".mid", "audio/mid"); 
            mappings.Add(".mpv2", "video/mpeg"); 
            mappings.Add(".man", "application/x-troff-man"); 
            mappings.Add(".mvb", "application/x-msmediaview"); 
            mappings.Add(".mpeg", "video/mpeg"); 
            mappings.Add(".m3u", "audio/x-mpegurl"); 
            mappings.Add(".mdb", "application/x-msaccess"); 
            mappings.Add(".mpp", "application/vnd.ms-project"); 
            mappings.Add(".m1v", "video/mpeg"); 
            mappings.Add(".mpa", "video/mpeg"); 
            mappings.Add(".me", "application/x-troff-me"); 
            mappings.Add(".m13", "application/x-msmediaview"); 
            mappings.Add(".movie", "video/x-sgi-movie"); 
            mappings.Add(".m14", "application/x-msmediaview"); 
            mappings.Add(".mpe", "video/mpeg"); 
            mappings.Add(".mp2", "video/mpeg"); 
            mappings.Add(".mov", "video/quicktime"); 
            mappings.Add(".mp3", "audio/mpeg"); 
            mappings.Add(".mpg", "video/mpeg"); 
            mappings.Add(".ms", "application/x-troff-ms"); 
 
            mappings.Add(".nc", "application/x-netcdf"); 
            mappings.Add(".nws", "message/rfc822"); 
 
            mappings.Add(".oda", "application/oda"); 
            mappings.Add(".ods", "application/oleobject"); 
 
            mappings.Add(".pmc", "application/x-perfmon"); 
            mappings.Add(".p7r", "application/x-pkcs7-certreqresp"); 
            mappings.Add(".p7b", "application/x-pkcs7-certificates"); 
            mappings.Add(".p7s", "application/pkcs7-signature"); 
            mappings.Add(".pmw", "application/x-perfmon"); 
            mappings.Add(".ps", "application/postscript"); 
            mappings.Add(".p7c", "application/pkcs7-mime"); 
            mappings.Add(".pbm", "image/x-portable-bitmap"); 
            mappings.Add(".ppm", "image/x-portable-pixmap"); 
            mappings.Add(".pub", "application/x-mspublisher"); 
            mappings.Add(".pnm", "image/x-portable-anymap"); 
            mappings.Add(".pml", "application/x-perfmon"); 
            mappings.Add(".p10", "application/pkcs10"); 
            mappings.Add(".pfx", "application/x-pkcs12"); 
            mappings.Add(".p12", "application/x-pkcs12"); 
            mappings.Add(".pdf", "application/pdf"); 
            mappings.Add(".pps", "application/vnd.ms-powerpoint"); 
            mappings.Add(".p7m", "application/pkcs7-mime"); 
            mappings.Add(".pko", "application/vndms-pkipko"); 
            mappings.Add(".ppt", "application/vnd.ms-powerpoint"); 
            mappings.Add(".pmr", "application/x-perfmon"); 
            mappings.Add(".pma", "application/x-perfmon"); 
            mappings.Add(".pot", "application/vnd.ms-powerpoint"); 
            mappings.Add(".prf", "application/pics-rules"); 
            mappings.Add(".pgm", "image/x-portable-graymap"); 
 
            mappings.Add(".qt", "video/quicktime"); 
 
            mappings.Add(".ra", "audio/x-pn-realaudio"); 
            mappings.Add(".rgb", "image/x-rgb"); 
            mappings.Add(".ram", "audio/x-pn-realaudio"); 
            mappings.Add(".rmi", "audio/mid"); 
            mappings.Add(".ras", "image/x-cmu-raster"); 
            mappings.Add(".roff", "application/x-troff"); 
            mappings.Add(".rtf", "application/rtf"); 
            mappings.Add(".rtx", "text/richtext"); 
 
            mappings.Add(".sv4crc", "application/x-sv4crc"); 
            mappings.Add(".spc", "application/x-pkcs7-certificates"); 
            mappings.Add(".setreg", "application/set-registration-initiation"); 
            mappings.Add(".snd", "audio/basic"); 
            mappings.Add(".stl", "application/vndms-pkistl"); 
            mappings.Add(".setpay", "application/set-payment-initiation"); 
            mappings.Add(".stm", "text/html"); 
            mappings.Add(".shar", "application/x-shar"); 
            mappings.Add(".sh", "application/x-sh"); 
            mappings.Add(".sit", "application/x-stuffit"); 
            mappings.Add(".spl", "application/futuresplash"); 
            mappings.Add(".sct", "text/scriptlet"); 
            mappings.Add(".scd", "application/x-msschedule"); 
            mappings.Add(".sst", "application/vndms-pkicertstore"); 
            mappings.Add(".src", "application/x-wais-source"); 
            mappings.Add(".sv4cpio", "application/x-sv4cpio"); 
 
            mappings.Add(".tex", "application/x-tex"); 
            mappings.Add(".tgz", "application/x-compressed"); 
            mappings.Add(".t", "application/x-troff"); 
            mappings.Add(".tar", "application/x-tar"); 
            mappings.Add(".tr", "application/x-troff"); 
            mappings.Add(".tif", "image/tiff"); 
            mappings.Add(".txt", "text/plain"); 
            mappings.Add(".texinfo", "application/x-texinfo"); 
            mappings.Add(".trm", "application/x-msterminal"); 
            mappings.Add(".tiff", "image/tiff"); 
            mappings.Add(".tcl", "application/x-tcl"); 
            mappings.Add(".texi", "application/x-texinfo"); 
            mappings.Add(".tsv", "text/tab-separated-values"); 
 
            mappings.Add(".ustar", "application/x-ustar"); 
            mappings.Add(".uls", "text/iuls"); 
 
            mappings.Add(".vcf", "text/x-vcard"); 
 
            mappings.Add(".wps", "application/vnd.ms-works"); 
            mappings.Add(".wav", "audio/wav"); 
            mappings.Add(".wrz", "x-world/x-vrml"); 
            mappings.Add(".wri", "application/x-mswrite"); 
            mappings.Add(".wks", "application/vnd.ms-works"); 
            mappings.Add(".wmf", "application/x-msmetafile"); 
            mappings.Add(".wcm", "application/vnd.ms-works"); 
            mappings.Add(".wrl", "x-world/x-vrml"); 
            mappings.Add(".wdb", "application/vnd.ms-works"); 
            mappings.Add(".wsdl", "text/xml"); 
 
 
            mappings.Add(".xml", "text/xml"); 
            mappings.Add(".xlm", "application/vnd.ms-excel"); 
            mappings.Add(".xaf", "x-world/x-vrml"); 
            mappings.Add(".xla", "application/vnd.ms-excel"); 
            mappings.Add(".xls", "application/vnd.ms-excel"); 
            mappings.Add(".xof", "x-world/x-vrml"); 
            mappings.Add(".xlt", "application/vnd.ms-excel"); 
            mappings.Add(".xlc", "application/vnd.ms-excel"); 
            mappings.Add(".xsl", "text/xml"); 
            mappings.Add(".xbm", "image/x-xbitmap"); 
            mappings.Add(".xlw", "application/vnd.ms-excel"); 
            mappings.Add(".xpm", "image/x-xpixmap"); 
            mappings.Add(".xwd", "image/x-xwindowdump"); 
            mappings.Add(".xsd", "text/xml"); 
 
            mappings.Add(".z", "application/x-compress"); 
            mappings.Add(".zip", "application/x-zip-compressed"); 
        } 
 
        public static string GetMimeMapping(string fileName) 
        { 
            var ext = Path.GetExtension(fileName); 
            string result; 
            return mappings.TryGetValue(ext, out result) ? result : "application/octet-stream"; 
        } 
    }
}