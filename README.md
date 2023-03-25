![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

# pairminator
Pair assignment generator built with Express, React, and Firebase

Coming soon...

A web application to help you manage a tennis match as a chair umpire.

You can access the live deployment of this project [here](https://derekmborges.github.io/pairminator)

# Development

## Prerequisites

### Firebase Project

You will need to create your own Firebase project (its free) with the **Cloud Firestore** feature enabled. You can reference the [Firebase docs](https://firebase.google.com/docs/firestore/quickstart?authuser=1#create) if you need any help with this step.

### Firebase Config

To connect this app to your Firebase project, create a `.env` file at the root project directory with the following environment variables taken from the Firebase Console

```
REACT_APP_FIREBASE_API_KEY=<api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<messaging-sender-id>
REACT_APP_FIREBASE_APP_ID=<app-id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<measurement-id>
```

## Commands

Once you're finished setting up the project, you can run the below commands in the root project directory:

### `yarn`

Installs all the dependencies for the project.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Deploy

If you want to deploy your own version of the app to Github Pages, make sure you forked this repo as a **public** repository.

### Update homepage

In the `package.json` file, modify the homepage property to use your Github username:

```json
{
    ...
    "homepage": "https://<username>.github.io/pairminator",
    ...
}
```

### `yarn deploy`

Deploys a production build of the app to your forked repo's Github Pages. This will create a `gh-pages` branch (if it doesn't exist already) and store the static web assets there.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

To learn Google Firebase, check out the [Firebase documentation](https://firebase.google.com/docs).