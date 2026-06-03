# Design Tokens Format Module — 2025.10

## Abstract

This document describes the technical specification for a file format to exchange design tokens between different tools.

## Introduction

_This section is non-normative._

Design tokens are a methodology for expressing design decisions in a platform-agnostic way so that they can be shared across different disciplines, tools, and technologies. They help establish a common vocabulary across organizations.

There is a growing ecosystem of tools for design system maintainers and consumers that incorporate design token functionality, or would benefit from doing so:

- **Design tools** have begun allowing designers to label and reference shared values for design properties like colors and sizes.
- **Translation tools** exist that can convert source design token data into platform-specific source code that can directly be used by developers.
- **Documentation tools** can display design token names rather than the raw values in design specs and style guides.

It is often desirable for design system teams to integrate such tools together, so that design token data can flow between design and development tools.

For example:

- Extracting design tokens from design files and feeding them into translation tools to then be converted into platform-specific code.
- Maintaining a "single source of truth" for design tokens and automatically keeping design and development tools in sync with it.

While many tools now offer APIs to access design tokens or the ability to export design tokens as a file, these are all tool-specific. The burden is therefore on design system teams to create and maintain their own, bespoke "glue" code or workflows. Furthermore, if teams want to migrate to different tools, they will need to update those integrations.

This specification aims to facilitate better interoperability between tools and thus lower the work design system teams need to do to integrate them by defining a standard file format for expressing design token data.

## Chapters

1. [Terminology](./terminology.md)
2. [File format](./file-format.md)
3. [Design token](./design-token.md)
4. [Groups](./groups.md)
5. [Aliases](./aliases.md)
6. [Types](./types.md)
7. [Composite types](./composite-types.md)
