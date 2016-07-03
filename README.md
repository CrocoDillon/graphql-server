# GraphQL Server

GraphQL server build on top of Koa and MongoDB. Basically just me experimenting with this stuff. Feel free to use (parts of) it, with caution.

## Why Koa 2?

Because I like Koa 2, async functions are nice. Sure it would be easier with `express` and `express-graphql` but where is the fun in that? Plus I might add more endpoints besides the GraphQL one later on and then I would really like my async functions!

## Relay-compliant!

No. This server is not yet Relay-compliant, but it will get there. Not sure if it’s gonna use `graphql-relay`though, seems like that would be giving a lot of control away.

## MongoDB

There are some scripts to run MongoDB in a Docker container (if you have Docker installed) but of course you’re free to get that database up and running however you want. Dont’t mind the very ugly npm scripts to import some test data in the database... I probably shouldn’t use npm scripts for that.

## JSON Web Tokens

Yes, implemented as `query { token(email: String!, password: String!): String }`.

## Test all the things!

Run ESLint, Mocha and Flow:

```
npm run check
```

Or separately:

```
npm run lint
npm run test
npm run flow
```
