Paw Aviator Template Generator Extension
========================================

Paw extension that generates code for the [Aviator Jekyll template](https://github.com/CloudCannon/aviator-jekyll-template).

## Installation

To install the Paw extension:

1. Open Paw
2. Open Preferences
3. Choose the _Extensions_ tab
4. Click _Open Extensions Directory_
5. Execute the following bash commands:
   ```sh
   mkdir com.crux.AviatorJekyllTemplate
   cd com.crux.AviatorJekyllTemplate
   git clone git@github.com:CruxConnect/paw-aviator-extension.git
   ```
6. Return to Paw and click _Reload Installed Extensions_

## Ickyness (included_extensions)

As far as I'm aware (and have attempted to do) Paw extension cannot use other extensions. Because of that, this extension includes 4 other standard extensions. I'm not happy about this, and symlinking didn't appear to work. If you can remove this requirement while keeping this functionality, well that would just be splendid.

## Development Instructions

This extension is basically just vanilla javascript. If you've installed following the instructions above, all you need to do is make your changes, hit that _Reload Installed Extensions_ and you're off to the races. Since the folder is already git tracked, you don't even have to worry.