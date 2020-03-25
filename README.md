# Backend starter kit

Simple no-magic backend starter kit. Perfect for the frontend developer who needs to see explicitly how everything works. This is currently meant to be hosted on Heroku, and has instructions as such.

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
