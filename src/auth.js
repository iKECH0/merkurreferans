import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text", placeholder: "ahmet123" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        let user = await prisma.user.findUnique({
          where: {
            username: credentials.username
          }
        })

        // AUTO-SEED FOR VERCEL DEMO
        if (!user && (credentials.username === 'admin' || credentials.username === 'ufuk37')) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              username: credentials.username,
              password: hashedPassword,
              name: credentials.username === 'admin' ? 'Yönetici' : 'Öğrenci',
              role: credentials.username === 'admin' ? 'ADMIN' : 'STUDENT'
            }
          });
        }

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.username = user.username
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.username = token.username
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
})
