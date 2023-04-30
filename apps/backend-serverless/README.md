# Trying to get this to deploy and be usable :)

## To Deploy and Run Remote

1. cd apps/backend-serverless
2. yarn
3. npx prisma generate
4. serverless deploy
5. serverless invoke -f api --log

## To Deploy and Run Locally:

1. cd apps/backend-serverless
2. yarn
3. npx prisma generate
4. serverless package
5. serverless invoke local -f api

I'm not married to any of the settings, I just have been playing around all day for the right combo to get this to

1. deploy
2. work

In the state it's in right now , it should deploy and you should get some output like:

endpoints:
GET - https://some-url.amazonaws.com/
GET - https://some-url/install
GET - https://some-url/redirect
GET - https://some-url/helius
functions:
api: backend-serverless-dev-api (41 MB)
install: backend-serverless-dev-install (41 MB)
redirect: backend-serverless-dev-redirect (41 MB)
helius: backend-serverless-dev-helius (41 MB)

going to https://some-url.amazonaws.com/ will return an Internal Server Error

you can run: serverless invoke -f api --log

this will show you the error:

2023-04-29 20:50:52.273 ERROR Uncaught Exception {"errorType":"Error","errorMessage":"Cannot find module '/var/task/src/utilities/request-response.utility' imported from /var/task/src/handler.js","code":"ERR_MODULE_NOT_FOUND","stack":["Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/src/utilities/request-response.utility' imported from /var/task/src/handler.js"," at new NodeError (node:internal/errors:399:5)"," at finalizeResolution (node:internal/modules/esm/resolve:331:11)"," at moduleResolve (node:internal/modules/esm/resolve:994:10)"," at moduleResolveWithNodePath (node:internal/modules/esm/resolve:938:12)"," at defaultResolve (node:internal/modules/esm/resolve:1202:79)"," at nextResolve (node:internal/modules/esm/loader:163:28)"," at ESMLoader.resolve (node:internal/modules/esm/loader:838:30)"," at ESMLoader.getModuleJob (node:internal/modules/esm/loader:424:18)"," at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:77:40)"," at link (node:internal/modules/esm/module_job:76:36)"]}

I think the problem in this state is that moduleResolution is set to node in my tsconfig.json. I would imagine that setting it to node16 would work if it was deployed because a moduleResolution of node is for commonJs and I set everything up for ESModules. But when I change it to node16, none of my files locally can find each other.

I think the only things I cannot change here are

1. using yarn, this is the only package manager I have found to handle preventing my dependcies from being hoisted which is required for Serverless Framework in my turborepo set up.
2. "workspaces": {
   "nohoist": [
   "**"
   ]
   },
   in the package.json for the same reason above.
3. the plugins in serverless.yml ( these could possibly change but this is the combo that got me to a deployement of the right size and my node_modules in the deployement being discoverable )

Modifying the below is all fair game and i've been messing aroud with them all day.

1. In tsconfig.json

-   "module": "es2015",
-   "target": "es5",
-   "moduleResolution": "node",
-   "lib": ["es2015"],

2. In package.json

-   "type": "module",

Here are some relevant link's I've been reading to try and fix this

1. https://www.serverless.com/framework/docs/getting-started
2. https://www.serverless.com/plugins/serverless-plugin-typescript
3. https://www.serverless.com/plugins/serverless-esbuild
