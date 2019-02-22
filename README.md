# Introduction

This branding template is for Learning and Development's Learning Hub site, a service catalog of L&D Services and Offerings.

## Getting Started with Learning Hub

**Learning Hub Dev Site** is set up as a **Subsite** of the **Learning Hub** site.

## Master Page

Master Page for the **Learning Hub Dev Site** subsite is set to `bah-ld/bah-ld.master`.

- This file is stored in the `Master Page Gallery/bah-ld` folder in the **Learning Hub** site
- Source for the file is available in `masterpages/bah-ld/bah-ld.master`

## Master Page Customization

The `<head>` section of the master page contains custom resources.

### Icons

- `<link>` tags for **icon** files (stored in `/masterpage/img`)

### Font

- `<link>` tag for **font** file (external resource from `https://fonts.googleapis.com/css?family=Oswald`)

### Styles

The stylesheets for this branding template are built via SCSS. Please take time to find them in the source code in the following directory `resources/scss`

- `<SharePoint:CssRegistration>` tag for **styles** file named **app.css** (stored in `/masterpage/css`)
  - **Bootstrap v3.3** is also included as part of **app.css** (import references can be found in source code, `resources/scss/_bones.scss`)
- `<SharePoint:CssRegistration>` tag for **styles** file named **edit-mode.css** (stored in `/masterpage/css`)
  - This stylesheet is only applied when webpages are in edit mode

### Javascript

The javascript for this branding template are built with plain javascript. Please take time to find them in the source code in the following directory `resources/js`

- `<script>` tag for **javascript** files include both **JQuery** and **JQuery UI** (external resources from `https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js` and `https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js`)
- `<script>` tag for **javascript** file named **app.js** (stored in `/masterpage/js`)

## Page Layouts

We have built 6 custom page layouts that are available for use:

- `bah-ld-home.aspx`
- `bah-ld-wide.aspx`
- `bah-ld-left-sidebar.aspx`
- `bah-ld-right-sidebar.aspx`
- `bah-ld-home-carousel.aspx`
- `bah-ld-wide-fluid.aspx`

## Custom Webparts

## Branding Guidelines

Please see the [branding guidelines](./docs/intro.md) to understand both the Learning Hub Voice and find the reference to the Styles Guide.

## Deploy

### Build

### Testing

### Release

## Environment

### Prod

### Test

### Dev
