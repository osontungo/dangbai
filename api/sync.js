import { NextResponse } from 'next/server'
import Twitter from 'twitter-lite'

const client = new Twitter({
  bearer_token: process.env.TWITTER_BEARER_TOKEN,
})

const DESO_API = 'https://node.deso.org/api/v0/submit-post'
const DESO_PUBLIC_KEY = process.env.DESO_PUBLIC_KEY
const DESO_JWT = process.env.DESO_JWT_TOKEN

export async function POST(request) {
  try {
    const body = await request.json()
    const username = body.username || 'elonmusk'
    const user = await client.get('users/show', { screen_name: username })

    const tweets = await client.get('statuses/user_timeline', {
      user_id: user.id_str,
      count: 3,
      tweet_mode: 'extended',
    })

    for (const tweet of tweets) {
      const text = tweet.full_text
      await fetch(DESO_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DESO_JWT}`,
        },
        body: JSON.stringify({
          UpdaterPublicKeyBase58Check: DESO_PUBLIC_KEY,
          BodyObj: {
            Body: `[Sync từ Twitter] ${text}`,
            ImageURLs: [],
          },
          MinFeeRateNanosPerKB: 1000,
        }),
      })
    }

    return NextResponse.json({ status: 'ok', message: 'Đã đăng lên DeSo' })
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message })
  }
}
