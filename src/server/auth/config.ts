// import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from 'next-auth'

// import { db } from '@/server/db'

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
// export const authConfig = {
//   providers: [
//     DiscordProvider
//     /**
//      * ...add more providers here.
//      *
//      * Most other providers require a bit more work than the Discord provider. For example, the
//      * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
//      * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
//      *
//      * @see https://next-auth.js.org/providers/github
//      */
//   ],
//   // adapter: PrismaAdapter(db),
//   callbacks: {
//     session: ({ session, user }) => ({
//       ...session,
//       user: {
//         ...session.user,
//         id: user.id
//       }
//     })
//   }
// } satisfies NextAuthConfig

import { compare } from 'bcryptjs'
// import {
//   getServerSession,
//   type NextAuthOptions,
//   type DefaultSession
// } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '~/server/db'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5).max(50)
})

const maxAuthAge = 15 * 24 * 60 * 60 // 15 days

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export const authConfig = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        //@ts-expect-error - listId is not in the default session
        token.listId = user.listId
      }

      return token
    },
    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id as string
        session.user.listId = token.listId as string
      }

      return session
    }
  },
  jwt: {
    maxAge: maxAuthAge
  },
  session: {
    maxAge: maxAuthAge
  },
  pages: {
    signIn: '/',
    error: '/',
    signOut: '/'
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: {
          label: 'email',
          type: 'email'
        },
        password: { label: 'email', type: 'password' }
      },
      authorize: async (credentials) => {
        const { email, password } = credentialsSchema.parse(credentials)
        const username = email.toLowerCase()

        const user = await prisma.user.findFirst({
          where: { username },
          select: { list: { select: { id: true } }, password: true, id: true }
        })

        if (!user) {
          return null
        }
        const isValidPassword = await compare(password || '', user.password)

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          listId: user?.list?.id
        }
      }
    })
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     **/
  ]
} satisfies NextAuthConfig

// /**
//  * Wrapper for `getServerSession` so that you don't need to import the
//  * `authOptions` in every file.
//  *
//  * @see https://next-auth.js.org/configuration/nextjs
//  **/
// export const getServerAuthSession = (ctx: {
//   req: GetServerSidePropsContext['req']
//   res: GetServerSidePropsContext['res']
// }) => {
//   return getServerSession(ctx.req, ctx.res, authOptions)
// }

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      listId: string

      // ...other properties
      // role: UserRole;
    } & DefaultSession['user']
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}
