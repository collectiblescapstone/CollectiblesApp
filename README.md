# Collectibles App

An app for collectors to keep track of their collectibles and trade with others! We're starting _not so small_ with Pokémon cards!

## Getting Started

First, have the following installed in your machine:

1. [Node version 22](https://nodejs.org/en/download)
2. [Android Studio](https://developer.android.com/studio) for Android Development
3. [Xcode](https://developer.apple.com/xcode/) for iOS Development
4. [Docker Desktop](https://www.docker.com/)

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

Then, to make sure user authentication works, add the following environment variables to your .env file:

```
NODE_ENV="developmment"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=<thesupabasepublicurl>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<thesupabaseanonkey>
SUPABASE_SERVICE_ROLE_KEY=<thesupabasesecretkey>
```

Make sure you run the following command on first setup or whenever you have to reset the database (including `npx supabase db reset`)! This is so that your authentication flow works locally!

```
npx prisma db execute --file prisma/setup.sql --schema prisma/schema.prisma
```

On Supabase startup (`npx supabase start`), you should find the values you use to fill in the .env file. (If this step does not work, ensure your Docker is running.) The value `NEXT_PUBLIC_SUPABASE_URL` corresponds to `API URL`,`NEXT_PUBLIC_SUPABASE_ANON_KEY` corresponds to either `anon key` or `Publishable key`, and `SUPABASE_SERVICE_ROLE_KEY` corresponds to `secret key`.

At this point, the application should be available on http://localhost:3000

\*Note: If at any point you need to check an email that is sent to you when you are developing locally, you WILL NOT receive it in your actual email inbox. This will be sent in Mailpit (Usually at http://127.0.0.1:54324/), which you can find the url on running `npx supabase start`.

### Setting up mobile development

First, add the following environment variable:

```
CAPACITOR_LIVE_RELOAD_URL='http://192.168.x.x:3000'
```

This is your local network's IPv4 address. You can get this from the terminal after you run `npm run dev` or you can run `ipconfig` (Windows) or `ipconfig getifaddr en0` (Mac)

Then, run the following commands to get it working on the mobile emulators:

```
// Run the build command first
npm run build

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

### Running your own local database

#### First-Time Setup

1. Make sure Docker is up and running.
2. Add the following values to the `.env` file, you can obtain these values by running `npx supabase start` in your terminal:

```
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:xxxxx"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:xxxxx/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:xxxxx/postgres"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[insert anon key]"
```

On Supabase startup, you should find the values you use to fill in the .env file. `NEXT_PUBLIC_SUPABASE_URL` corresponds to `API URL`, `DATABASE_URL` and `DIRECT_URL` corresponds to `Database URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` corresponds to either `anon key` or `Publishable key`.

IT IS VERY IMPORTANT THAT THESE VARIABLES POINT TO YOUR LOCAL DATABASE, NOT THE LIVE ONE. DO NOT USE THE API URL FOUND ON THE LIVE SUPABASE.

(Make sure your .env file is in the gitignore)

3. Run the following commands:

```
npx prisma migrate dev
npx prisma db seed
```

#### Database Workflow

1. Turn on Docker
2. Run `git pull origin main`
3. Run these commands:

```
npx supabase start
npx prisma migrate dev
```

You should now have access to the database. At this step, you should be able to run `npx prisma studio` to access the prisma studio GUI, and access the database as you please.
