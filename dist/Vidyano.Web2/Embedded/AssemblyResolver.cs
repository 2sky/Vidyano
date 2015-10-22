using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Packaging;
using System.Reflection;

[assembly: Vidyano.Web2.Embedded.AssemblyResolver]

namespace Vidyano.Web2.Embedded
{
    [AttributeUsage(AttributeTargets.Assembly)]
    sealed class AssemblyResolverAttribute : Attribute
    {
        static AssemblyResolverAttribute()
        {
            AssemblyResolver.Initialize();
        }
    }

    static class AssemblyResolver
    {
        #region Fields

        private static readonly HashSet<string> checkedAssemblies = new HashSet<string>();
        private static readonly object syncRoot = new object();

        #endregion

        #region Constructors

        static AssemblyResolver()
        {
            AppDomain.CurrentDomain.AssemblyResolve += OnAssemblyResolve;
        }

        #endregion

        #region Public Methods

        public static void Initialize()
        {
            // NOTE: Is used to trigger the static constructor so that the assemblyresolve event is hooked
        }

        #endregion

        #region Private Methods

        private static Assembly OnAssemblyResolve(object sender, ResolveEventArgs args)
        {
            lock (syncRoot)
            {
                if (checkedAssemblies.Add(args.Name))
                {
                    var assemblyName = new AssemblyName(args.Name);
                    if (!assemblyName.Name.EndsWith(".resources"))
                    {
                        var stream = typeof(AssemblyResolver).Assembly.GetManifestResourceStream(typeof(AssemblyResolver), assemblyName.Name + ".pkg");
                        if (stream != null)
                        {
                            using (var package = Package.Open(stream))
                            {
                                var partUri = PackUriHelper.CreatePartUri(new Uri(assemblyName.Name + ".dll", UriKind.Relative));
                                if (package.PartExists(partUri))
                                {
                                    var part = package.GetPart(partUri);
                                    var ms = new MemoryStream();
                                    part.GetStream().CopyTo(ms);
                                    return Assembly.Load(ms.ToArray());
                                }
                            }
                        }
                    }
                }

                return null;
            }
        }

        #endregion
    }
}