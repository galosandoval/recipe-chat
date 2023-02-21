import { compare } from 'bcryptjs'
import type { GetServerSidePropsContext } from 'next'
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession
} from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './db'

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

      // ...other properties
      // role: UserRole;
    } & DefaultSession['user']
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
      }

      return token
    },
    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id as string
      }

      return session
    }
  },
  jwt: {
    secret: 'super-secret',
    maxAge: 15 * 24 * 30 * 60 // 15 days
  },
  session: {
    maxAge: 15 * 24 * 30 * 60
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  // adapter: PrismaAdapter(prisma),
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
        const user = await prisma.user.findFirst({
          where: { username: credentials?.email }
        })

        if (!user) {
          return null
        }

        const isValidPassword = await compare(
          credentials?.password || '',
          user.password
        )

        if (!isValidPassword) {
          return null
        }

        return {
          id: `${user.id}`
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
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}
