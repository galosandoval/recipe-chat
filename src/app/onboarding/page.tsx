import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { TasteProfileQuiz } from './taste-profile-quiz'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  return <TasteProfileQuiz />
}
