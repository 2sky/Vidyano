# Overview

## What is Vidyano Web²
This repository contains the complete code for our next generation web client, **Vidyano Web²**. It provides an out of the box, scaffolded, modern Single Page Application (SPA) that interacts with a Vidyano backend.

> For more information about building a complete Vidyano application, please refer to the official [Vidyano website](http://www.vidyano.com/).

### Polymer
The client-side engine is build on top of Google's Polymer library and uses reusable elements to make up a single page application. The Polymer library is designed to make it easier and faster for developers to create great, reusable components for the modern web.

Throughout this documentation, you will find links to the Polymer website that further explain certain principles of the library.

> To learn more about the Polymer library, you can visit the official [Polymer website](https://www.polymer-project.org).

### TypeScript
The Vidyano Web² client source code is written in TypeScript. We believe TypeScript to be an amazing language that does a wonderful job of extending JavaScript. Also, since Vidyano backend services are written in C#, existing Vidyano developers will find the step from backend programming to making frontend customizations a lot easier.

> For more information on the TypeScript language, please refer to the [TypeScript handbook](http://www.typescriptlang.org/Handbook).

### Browser compatibility
Even though technologies such as Web Components used by the Vidyano Web² client are at the cutting-edge of web technologies, some of their core principles are not yet fully supported in all browsers. The Vidyano Web² client relies on polyfills to fill the gaps and support the latest versions of all major browsers.

| IE/Edge | Firefox | Chrome | Chrome Android | Safari | Safari iOS |
|:-:|:-:|:-:|:-:|:-:|:-:|
| IE11, Edge| Latest | Latest | Latest | Latest | iOS 9 |