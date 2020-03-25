import {
  checkContext,
  comparePass,
  createPasswordResetTokenForEmail,
  createSignedToken,
  decryptPasswordResetFromEmailToken,
  decryptResetPasswordToken,
  hashPassword
} from "../auth/authenticationUtils";

import sgMail from "@sendgrid/mail";
import { AuthenticationError, gql } from "apollo-server";
import { toLower } from "lodash";
import db from "../db/database";
import { Resolvers } from "../graphql/graphql";
import { logger } from "../utils/winstonLogger";
import { log } from "../utils/log";

export const typeDef = gql`
  extend type Query {
    account: User!
  }

  extend type Mutation {
    register(email: String!, password: String!): User
    signIn(email: String!, password: String!): User
    requestPasswordReset(email: String!): Boolean
    resetPassword(token: String!, newPassword: String!): Boolean
  }

  type User {
    id: ID
    email: String
    token: String
  }
`;

/**
 * After you've setup sendgrid and added your API to .env, this will send this exact email!
 * It's up to you to make sure that link actually resolves to something.
 * 
 * @param to
 * @param token
 */
const sendPasswordResetEmail = async (to: string, token: string) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to,
    from: "do@not.reply",
    subject: "Password reset",
    text: "Here's your password reset link!",
    html: `<a href="https://yourapp.com/session/change-password?token=${token}">Click here to reset</a>`
  };
  try {
    await sgMail.send(msg);
  } catch (err) {
    logger.log(err);
  }
};

export const resolvers: Resolvers = {
  Query: {
    account(root, args, context) {
      checkContext(context);
      return db
        .query("users")
        .where({ id: context.user.id })
        .returning("*")
        .first();
    }
  },
  Mutation: {
    async register(root, args, context) {
      checkContext(context, false);

      const email = args.email;
      const password = args.password;

      const hash = hashPassword(password);
      const lastValidIat = Math.floor(new Date().getTime() / 1000);

      const [user] = await db
        .query("users")
        .insert({
          email,
          lastValidIat,
          password: hash
        })
        .returning("*");

      return user;
    },
    async signIn(root, args, context) {
      checkContext(context, false);

      const email = toLower(args.email);
      const password: string | undefined = args.password;

      if (email && password) {
        const user = await db
          .query("users")
          .where({ email })
          .first();

        if (user) {
          if (comparePass(password, user.password)) {
            return user;
          } else {
            throw new AuthenticationError("Invalid password");
          }
        } else {
          throw new AuthenticationError("User not found");
        }
      } else {
        throw new AuthenticationError("Please submit a email and password");
      }
    },
    async requestPasswordReset(root, { email }, context) {
      checkContext(context, false);
      const user = await db
        .query("users")
        .where({ email })
        .select("id", "password", "createdAt")
        .first();
      if (user) {
        const encryption = createPasswordResetTokenForEmail(
          user.id,
          user.password,
          user.createdAt
        );
        await db
          .query("users")
          .where({ email })
          .update({ resetLastIat: encryption.iat });

        log()("Not sending pw resets at this time");
        // TODO - Test this when you have sendgrid set up
        // await sendPasswordResetEmail(email, encryption.token);
      }
      // We always return true here, we give no indication that this did or didn't work.
      return true;
    },
    async resetPassword(root, { token, newPassword }, context) {
      checkContext(context, false);
      const decryptedToken = decryptPasswordResetFromEmailToken(token);
      // 1. Get the user by ID that was in the first layer of encryption
      const user = await db
        .query("users")
        .where({ id: decryptedToken.id })
        .select("id", "password", "createdAt", "resetLastIat")
        .first();
      if (user) {
        // 2. Now that we have that user, we can attempt to decrypt the token we have, using that users
        // password and created_at fields.
        const payload = decryptResetPasswordToken(
          decryptedToken.token,
          user.password,
          user.createdAt
        );
        if (user.resetLastIat > payload.iat) {
          throw new AuthenticationError(
            "A newer password reset has been requested."
          );
        }

        if (payload.id === user.id) {
          // 3. The descrypted inner payload user ID matches the user id that was sent up,
          // so we can safely assign the new password to this account
          const hashedPassword = hashPassword(newPassword);
          await db
            .query("users")
            .where({ id: decryptedToken.id })
            .update({ password: hashedPassword, lastValidIat: payload.iat });
        }
      }

      // We always return true here, we give no indication that this did or didn't work.
      return true;
    }
  },
  User: {
    token(user, args, context, info) {
      // TODO - this always gives you your own token. Should create a separate model for this.
      return createSignedToken(user.id);
    }
  }
};
