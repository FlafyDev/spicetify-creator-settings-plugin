# Spicetify Creator - Settings Plugin
A Plugin for [Spicetify Creator](https://github.com/FlafyDev/spicetify-creator) to easily create settings for your extension

## Getting Started
1. Create a [Spicetify Creator](https://github.com/FlafyDev/spicetify-creator) project
2. `yarn add spicetify-creator-settings-plugin`

## Preview
![Preview](/previewImage.png)
```js
import { SettingsSection } from "spicetify-creator-settings-plugin";

async function main() {
  const settings = new SettingsSection("Settings Test", "settings-test");

  settings.addInput("your-name", "Input your name", "Foo");

  settings.addButton("button-1", "Press the button to get your name", "What's my name?", () => {
    Spicetify.showNotification(settings.getFieldValue("your-name") as string);
  });

  settings.addButton("button-2", "Press the button to randomize your name", "Randomize my name", () => {
    settings.setFieldValue("your-name", (Math.random() + 1).toString(36).substring(2));
    settings.rerender();
  });

  settings.addToggle("random-toggle", "A random toggle", true);
  
  settings.addDropDown("random-dropdown", "A random dropdown", ['Option 1', 'Option 2', 'Option 3'], 2);

  settings.pushSettings();
}

export default main;
```
