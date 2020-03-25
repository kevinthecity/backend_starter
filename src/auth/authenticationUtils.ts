import { AuthenticationError } from "apollo-server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Context } from "../graphql/codegen";
import db from "../db/database";
import { log } from "../utils/log";

/**
 * A collection of methods used for all authentication purposes. No magic here, aside from
 * how bcrypt actually works.
 */

export const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
};

export const comparePass = (userPassword: string, databasePassword: string) => {
  return bcrypt.compareSync(userPassword, databasePassword);
};

export const createSignedToken = (id: string) => {
  return jwt.sign({ id }, process.env.SECRET_KEY);
};

/**
 * The token we send in an email. The token itself contains another JWT token.
 * We do this so that we don't have to explicitly pass user id in the reset email.
 */
export const createPasswordResetTokenForEmail = (
  userId: string,
  currentHashedPassword: string,
  createdAt: string
) => {
  // 1. Create the reset valid reset token
  const secret = currentHashedPassword + "-" + createdAt;
  const resetToken = jwt.sign({ id: userId }, secret, { expiresIn: "10m" });
  const resetTokenIat = getTokenIAT(resetToken);

  // 2. Wrap this token in a second token, to obfuscate user id
  // We also return the IAT because we want to update our DB with the IAT
  return {
    token: jwt.sign({ id: userId, token: resetToken }, process.env.SECRET_KEY),
    iat: resetTokenIat
  };
};

/**
 * Decrypty the literal token that the user receieved from their email
 */
export const decryptPasswordResetFromEmailToken = (token: string) => {
  const decoded = jwt.decode(token);
  const objectified = objectifyJsonWebToken(decoded);
  return {
    id: objectified.id,
    token: objectified.token
  };
};

/**
 * Decrypt the password reset token itself! This is wrapped inside of the emailed token.
 */
export const decryptResetPasswordToken = (
  token: string,
  password: string,
  createdAt: string
) => {
  const secret = password + "-" + createdAt;
  const verified = jwt.verify(token, secret);
  const objectified = objectifyJsonWebToken(verified);
  return {
    id: objectified.id,
    iat: parseInt("" + objectified.iat, 10)
  };
};

/**
 * IAT = Token Issued At
 */
const getTokenIAT = (token: string) => {
  return objectifyJsonWebToken(jwt.decode(token)).iat;
};

export const findUserByToken = async (token?: string): Promise<Context> => {
  if (!token) {
    // Authentication present is important because we don't want to throw
    // an error if authentication isn't required.
    return {
      authenticationPresent: false
    };
  }

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    const objectified = objectifyJsonWebToken(verified);

    const user = await db
      .query("users")
      .where({ id: objectified.id })
      .first();

    if (!user) {
      log()(`user not found`);
      // Can only get in this state if user is deleted, unlikely someone is sending malformed tokens
      return {
        authenticationPresent: true,
        error: {
          message: "Clear credentials: No user found with that ID."
        }
      };
    } else if (user.lastValidIat === null) {
      // For some reason we set this to null (triggering a password reset required)
      log()(`user.lastValidIat null`);
      return {
        authenticationPresent: true,
        error: {
          message:
            "Clear credentials: For security reasons, please go through the reset password flow."
        }
      };
    } else if (user.lastValidIat > objectified.iat) {
      // User changed their password.
      log()(`user: ": ${user.lastValidIat}, token: ${objectified.iat}`);
      return {
        authenticationPresent: true,
        error: {
          message:
            "Clear credentials: This token is no longer valid. Please sign in again."
        }
      };
    } else {
      log()(`useriat: ": ${user.lastValidIat}, tokeniat: ${objectified.iat}`);
      log()(`auth success`);
      // Passed all cases, we're auth'd!
      return {
        authenticationPresent: true,
        user: {
          id: user.id
        }
      };
    }
  } catch (error) {
    return {
      authenticationPresent: true,
      error: {
        message: error
      }
    };
  }
};

/**
 * Helper for making this queryable, silly
 */
const objectifyJsonWebToken = (token: string | object) => {
  return JSON.parse(JSON.stringify(token));
};

/**
 * Checks context. All routes require auth unless explicitly disabled.
 */
export const checkContext = (context: Context, authRequired = true) => {
  if (authRequired && !context.authenticationPresent) {
    throw new AuthenticationError("Please sign in");
  }

  if (authRequired && context.error) {
    throw new AuthenticationError(context.error.message);
  }

  // There may still be errors, but if your route specifically does not need auth,
  // e.g. password reset, then we're ignoring for the time being.
  // I can't think of a use case where this is bad, but we'll keep an eye on it
};
