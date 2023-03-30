![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

# pairminator
A history-based pairing assignment tool built with React and Firebase

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

## Deploy

If you want to deploy your own version of the app to Github Pages, make sure you forked this repo as a **public** repository and completed all the [Prerequisites](#prerequisites).

### Update homepage

In the `package.json` file, update the homepage property with your Github username:

```json
{
    ...
    "homepage": "https://<username>.github.io/pairminator",
    ...
}
```

### `yarn deploy`

Deploys a production build of the app to your forked repo's Github Pages. This will create a `gh-pages` branch (if it doesn't exist already) and store the static web assets there.

_Note_: If you're running this manually from your computer, you may have to remove the `-u 'github-actions-bot <support+actions@github.com>'` part of the `deploy` script in your `package.json` file. I use this option to deploy the app automatically using Github Actions.

## Automated Deployments

If you want your repo to automatically build and deploy your app to Github Pages on merges to `main`, you can use the Github Action configured in this repo.

#### Generate Personal Access Token

Under your Github profile's [token settings](https://github.com/settings/tokens), generate a token that has write permissions for pushing commits. Copy the token somewhere secure.

#### Add Secrets

In your repository's settings, add the following Actions secrets with the following values:

- `ACTIONS_BOT_TOKEN` = personal access token
- `GIT_EMAIL` = Github user email

The following values are found in your `.env` file:
- `FIREBASE_API_KEY` = REACT_APP_FIREBASE_API_KEY
- `FIREBASE_APP_ID` = REACT_APP_FIREBASE_APP_ID
- `FIREBASE_AUTH_DOMAIN` = REACT_APP_FIREBASE_AUTH_DOMAIN
- `FIREBASE_MESSAGING_SENDER_ID` = REACT_APP_FIREBASE_MESSAGING_SENDER_ID
- `FIREBASE_PROJECT_ID` = REACT_APP_FIREBASE_PROJECT_ID
- `FIREBASE_STORAGE_BUCKET` = REACT_APP_FIREBASE_STORAGE_BUCKET

#### Update Git config

Finally, in your `.github/workflows/pages-hosting-merge.yml` file, update the environment variables with your Github info:

```yaml
...
        env:
          GIT_REPO: github.com/<username>/pairminator.git
          GIT_NAME: <username>
...
```

Committing this to `main` should kick off an Action and deploy the app to your Github Pages!

## Contributing

Please feel free to submit Issues or Pull Requests if you have any specific change requests. If you submit a bug, make sure to include all the necessary steps to reproduce the bug along with relevant software versions like your browser and operating system.

## Tech Stack

To learn more about the technologies used to build this tool, check out their docs:

- [React](https://reactjs.org/)
- [Material UI](https://mui.com/material-ui/getting-started/overview/)
- [Firebase](https://firebase.google.com/docs)
