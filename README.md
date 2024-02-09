# Markitup2

Markitup2 is a for fork of the venerable [Markitup](https://markitup.jaysalvat.com/home/) Markdown parser to use  vanilla JS instead of jQuery, and bring this great library into the modern age. 

It is also lighter weight and faster than the original. 

As of Feb. 2024, it is in beta/testing. If you use it, please let me know how it works for you, and please report any bugs. 

## markItUp
**markItUp** is a lightweight JavaScript library that provides a simple and customizable way to enhance **<textarea>** elements with markdown editing capabilities. It allows users to easily add markup to their text content using customizable markup sets.
# Features
* Lightweight and easy to integrate.
* Customizable markup sets for easy markup insertion.
* Supports keyboard shortcuts for quick markup insertion.
* Preview functionality to visualize the rendered content.
* Extensible with custom preview handlers and markup sets.

## Installation
You can include the **markItUp** library in your project by downloading the JavaScript file and including it in your HTML:

```
<script src="path/to/markitup.js"></script>
```

## Usage
To use **markItUp**, follow these steps:
* Include the **markItUp** JavaScript file in your HTML.
* Create a **<textarea>** element in your HTML.
* Initialize **markItUp** on the **<textarea>** element with desired settings.

## Example:
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>markItUp Example</title>
</head>
<body class="body">
    <textarea id="myTextarea" rows="10" cols="50"></textarea>
    <script src="path/to/markitup.js"></script>

    <script>

        // Define your settings for markItUp
        var settings = {
            previewHandler: function (markdownContent) {
                // Custom preview handler logic
                return "<div>Preview</div>";
            },
            markupSet: [
                // Define your markup set here
                { name: 'Bold', key: 'B', openWith: '**', closeWith: '**' },
                { name: 'Italic', key: 'I', openWith: '_', closeWith: '_' }
            ]
        };

        // Call the markItUp function with any optional settings
        // You can pass any selector to it.
        markItUp('.body #mytextarea', settings);
        });
    </script>
</body>
</html>
```
## Settings
You can customize the behavior of **markItUp** by passing a settings object when initializing it. Here are the available settings:
* **previewHandler**: A function that handles the preview of the rendered content.
* **markupSet**: An array of markup objects defining the available markup options.
* Additional settings for customization.

### Events
**markItUp** triggers events during various interactions. You can listen to these events to customize the behavior further.
* **insertion**: Triggered when content is inserted into the **<textarea>**.
* Additional events for customization.

## License
**markItUp2** is licensed under the MIT License. See the LICENSE file for more details.

