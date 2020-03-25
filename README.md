# Backend starter kit

Simple no-magic backend starter kit. Perfect for the frontend developer who wants to see *explicitly* how everything works. The easier way to use this is running locally and on Heroku. Installtion instructions for Mac OS.

*Small Note*: I am not really a backend developer! So if you think there are things that could be improved to make this easier and/or nicer, please submit PRs or open issues, would love your feedback!

*BIG Note*: I implemented Authentication myself through reading lots of documentation and picking through lots of articles. I personally believe it is secure and have used it in my own projects, however I cannot guarantee that it's 100% secure. Please keep this in mind if using this in your project.

Please don't hesitate to reach out to me on twitter @kevingrant5 or file an issue here if you need more help getting started!

## What you get

Out of the box! Very little work necessary.

- Email registration apis , with a password reset via email API (you need to build and host the page that it links to)
- Authentication via JSON web tokens
- An implementation of GraphQL with TypeScript code generation.

### Some other technical things you get

- Reference implementation of ID as UUID instead of a number
- Reference implementaton for custom Postgres functionality for updating timestamps on rows when they're modified

## Technologies

- Typescript
- Apollo Server (GraphQL)
- Postgres (SQL Database)
- Knex, an ORM (no opinions of if it's the best, however, it works ok)

## Things you'll need

(Instructions given use [homebrew](https://brew.sh/) to install things.)

1. Postgres, and ideally a postgres client to view it. I recommend [Postico](https://eggerapps.at/postico/).

```
brew install postgres
```

2. Yarn. You could also use npm, but I've set up this project to use [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable). No real reason other than I'm used to typing it.
```
brew install yarn
```

3. A [Heroku](http://heroku.com/) account. It's free for most use cases, and incremenetally charges when your projet gets large (but it has to get pretty large to cost you anything).

## Getting started


1. Clone project and install dependencies.

```
git clone ...
yarn install;
```

1. Generate a secret key, and place it in your `.env` file. I did so using [this](https://mherman.org/blog/node-passport-and-postgres/) method. (We don't use passport, but we still use the secret key)

```
$ python
>>> import os
>>> os.urandom(24)
"\x02\xf3\xf7r\t\x9f\xee\xbbu\xb1\xe1\x90\xfe'\xab\xa6L6\xdd\x8d[\xccO\xfe"
```

1. Configure a local database for testing. This requires you to enter the postgres server running on your machine (the one you installed from `brew install postgres`).

- Make sure postgres is running, `brew services start postgres`.
- In terminal, access postgres server via `psql` command.
- Enter `CREATE DATABASE your_db_name;` into the terminal. Thats it!

Now, change the DATABASE_URL in .env to this db that you created.

```
postgresql://myuser@localhost/your_db_name
             ^postgresuser    ^what you named your database
```

If you have issues with the user, check [this](https://stackoverflow.com/questions/30641512/create-database-from-command-line) stackoverflow answer for help creating a user.

1. Run migrations!

```
yarn migrate
```

1. Test out development, you should be up and running! Best way to test it out is to visit the graphql broswer thats bundled in with your server (thanks Apollo!).

```
yarn develop
{"message":"🚀 Visit graphiql browser at http://localhost:5000/graphql","level":"info"}
```

1. From here you can create a user, like this:

```
mutation{
  register(email:"user@test.com" password:"test"){
    id
    email
    token
  }
}
```

1. This token is your JSON web token, and you should send this up in a header to authorize your graphql requests.

```
{
  "authorization":"your-token"
}
```

1. You're done! This is all you need to do to get started with local development. Check out the scripts in `package.json` for ideas of things you can do, like create database migrations and send test emails.

1. This project should almost work "out of the box" when uploading to Heroku. Some things to keep in mind.

- You need to add a "postgres" addon, and then make sure that the env variable heroku adds matches the name in the project (it should).
- To use the graphql broswer in production, you need to add `NODE_ENV=development` to your config vars. This is meant to be disabled in prod so that people cant access your graphql super easily, but its fine to leave on while devving for a while.
