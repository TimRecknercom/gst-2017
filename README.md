What you discovered

From your screenshots, here’s what actually happened:

When you type this:

https://speechless-parrot.github.io/gst-2017/village.html

You sometimes get a 404 error.
But when you remove village.html and load only:

https://speechless-parrot.github.io/gst-2017/

The website loads correctly.
After the base folder loads, the site redirects properly and the village loads without error.

This means the direct village.html file is not always linked correctly, but the project root folder is. Loading the root lets GitHub Pages load the correct path and fix the missing file issue.

Here is a clear explanation you can post in your server

You can copy this and paste it into Discord:

404 Error Fix for the GSTG Village Page

I figured out what was causing the 404 error with the original Santa Tracker link. When you open the direct page:

https://speechless-parrot.github.io/gst-2017/village.html

GitHub sometimes can’t find that file and gives you a 404 error.

The fix is simple. You have to remove village.html and load the main folder instead:

https://speechless-parrot.github.io/gst-2017/

Once the main project loads, the village page works normally without giving an error. So if the village page breaks, just open the root folder link.

I also made a working version on my site that loads every time:

https://sites.google.com/timrecknercomnews.com/santatracker/mobile
