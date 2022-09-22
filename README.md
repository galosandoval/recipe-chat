# reminder-joes-app

- Site: https://awesome-jackson-9126be.netlify.app/
- Backend: https://github.com/galosandoval/listy-backend

## My goal for this project was to simulate a profesisonal work environment

- I worked with tasks on a kanban board:

  ![](public/TJ%20Trello.png)

- I wrote a descriptive commit with every feature I completed:

  ![](public/TJ%20Commit%20History.png)

## How to navigate this project

- The main feature of this app parses a recipe from a website and adds it to the users list of recipes: https://github.com/galosandoval/reminder-joes-app/blob/main/client/src/features/recipe/create/AddRecipe.jsx#L13
- Responsive CSS using SCSS and BEM. Here's a link to the sass folder: https://github.com/galosandoval/reminder-joes-app/tree/main/client/src/sass
- Deployment here so I can use it on my phone to make improvements: https://awesome-jackson-9126be.netlify.app/

## Why I built the project this way

- I didn't use a state management library like Redux on purpose. For this app simple `useState` is
  sufficient.
- I used SCSS for this project because the transpiler picks up bugs in CSS and nesting allows for faster styling.
- My plan become a fullstack developer but first I'd like to focus on the frontend so there is quite a bit more work done on the client for this project.
- Lately, I've been learning react-query and have been changing the way I make http requests. Heres an example:

### Look at how much code I've replaced!

![](public/react-query-example.png)

# Qwik App ⚡️

- [Qwik Docs](https://qwik.builder.io/)
- [Discord](https://qwik.builder.io/chat)
- [Qwik Github](https://github.com/BuilderIO/qwik)
- [@QwikDev](https://twitter.com/QwikDev)
- [Vite](https://vitejs.dev/)
- [Partytown](https://partytown.builder.io/)
- [Mitosis](https://github.com/BuilderIO/mitosis)
- [Builder.io](https://www.builder.io/)

---

## Project Structure

Inside of you project, you'll see the following directories and files:

```
├── public/
│   └── ...
└── src/
    ├── components/
    │   └── ...
    └── routes/
        └── ...
```

- `src/routes`: Provides the directory based routing, which can include a hierarchy of `layout.tsx` layout files, and `index.tsx` files as the page. Additionally, `index.ts` files are endpoints. Please see the [routing docs](https://qwik.builder.io/qwikcity/routing/overview/) for more info.

- `src/components`: Recommended directory for components.

- `public`: Any static assets, like images, can be placed in the public directory. Please see the [Vite public directory](https://vitejs.dev/guide/assets.html#the-public-directory) for more info.

## Add Integrations

Use the `npm run qwik add` command to add other integrations. Some examples of integrations include as a Cloudflare, Netlify or Vercel server, and the Static Site Generator (SSG).

```
npm run qwik add
```

## Development

Development mode uses [Vite's development server](https://vitejs.dev/). For Qwik during development, the `dev` command will also server-side render (SSR) the output. The client-side development modules loaded by the browser.

```
npm run dev
```

> Note: during dev mode, Vite will request many JS files, which does not represent a Qwik production build.

## Preview

The preview command will create a production build of the client modules, production build of `src/entry.preview.tsx`, and create a local server. The preview server is only for convenience to locally preview a production build, but it should not be used as a production server.

```
npm run preview
```

## Production

The production build should generate the client and server modules by running both client and server build commands. Additionally, the build command will use Typescript run a type check on the source.

```
npm run build
```
