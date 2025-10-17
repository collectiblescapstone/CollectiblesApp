# Collectibles App

An app for collectors to keep track of their collectibles and trade with others! We're starting _not so small_ with Pokémon cards!

## Getting Started

First, have the following installed in your machine:

1. [Node version 22](https://nodejs.org/en/download)
2. [Android Studio](https://developer.android.com/studio) for Android Development
3. [Xcode](https://developer.apple.com/xcode/) for iOS Development

Then, run the following commands to get it up and running on the web:

```
// if you have ssh setup on your GitHub account (recommended)
git clone git@github.com:collectiblescapstone/CollectiblesApp.git
// or
git clone https://github.com/collectiblescapstone/CollectiblesApp.git

cd CollectiblesApp
npm i
npm run dev
```

At this point, the application should be available on http://localhost:3000

### Setting up mobile development

First, add the following environment variable:

```
CAPACITOR_LIVE_RELOAD_URL='http://192.168.x.x:3000'
```

This is your local network's IPv4 address. You can get this from the terminal after you run `npm run dev` or you can run `ipconfig` (Windows) or `ipconfig getifaddr en0` (Mac)

Then, run the following commands to get it working on the mobile emulators:

```
// The default is without specifying the platform, which syncs both platforms
npm run sync [ios|android]

// For Android Development on Android Studio
npm run dev:android

// For iOS Development on Xcode
npm run dev:ios
```

These two commands will open Andriod Studio and Xcode respectively with the CollectiblesApp project already loaded.

If you already have the Android and/or iOS device emulator installed, all that's left to do is click **Run/Build** (usually the play button), and the emulators will run the app with live reload enabled (if you have the environment variable set up)

### Setting up the mobile emulators

#### Android

1. Open **Android Studio**
2. Go to **Device Manager** (Either under the 3 dots menu or an icon on the right side)
3. Select **Create Virtual Device**, then select one of the Pixel phones
4. Follow the instructions and download the required system image
5. Select the device before running the app

Now, you should see the app build, then your emulator will boot up and open the CollectiblesApp project in the emulator.

#### iOS

1. Open **Xcode**
2. Go to **Settings > Components**, then click add an **iOS** simulator
3. Select any iOS version, and click **Download & Install**
4. Once the iOS simulator runtime is downloaded, go to **Window > Devices and Simulators** and add any iPhone in the simulators tab
5. Make sure to select the device before running the app.

Now, you should see the app build, then your emulator will boot up and open the CollectiblesApp project in the emulator.

#### Troubleshooting

- [Android Studio Docs](https://developer.android.com/studio/run)
- [XCode Emulator Docs](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)
