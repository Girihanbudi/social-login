import { AuthError } from '../../auth-error'
import process from 'process'
import prisma from '@libs/prisma'

import jwt from 'jwt-simple'
import mailJetsend from '@libs/mailjet/mailjet'
import ErrorCode from '@common/error-code'
import { DefaultError } from '@common/error-code'
import UserError from '@modules/user/user-error'
import Case from 'case'
import resetPasswordPlainHTML from '@components/reset-password/email-verification-plain-html'

/**
 * Sent Reset Token Function
 * return: error or null
 */
const sendResetToken = async (
  identifier: string,
  authBaseLink: string
): Promise<ErrorCode | null> => {
  const user = await prisma.user.findFirst({
    where: {
      email: identifier,
    },
  })

  if (!user) {
    // User not exist
    return UserError.USER_REC_001
  } else if (!user.email) {
    // Email not exist
    return AuthError.AUTH_NIL_001
  } else {
    // Continue to verification process
    await prisma.resetToken.deleteMany({
      where: {
        identifier: user.email,
      },
    })

    const token = jwt.encode(user, process.env.JWT_SECRET!)
    const currentDate = new Date()

    // Create verification request record in database
    await prisma.resetToken.create({
      data: {
        identifier: identifier,
        token: token,
        expires: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), //will expired in 1 day
      },
    })

    const link = authBaseLink + '/' + token
    const name = user.name ? Case.title(user.name.split(' ')[0]) : 'User'

    const subject = 'Aha Test - Reset password link'
    const mailBody = resetPasswordPlainHTML(link, name)

    const error = await mailJetsend(
      [{ Email: user.email, Name: name }],
      subject,
      mailBody
    )

    return error ? DefaultError.DEFAULT_SYS_500 : null
  }
}

export default sendResetToken
