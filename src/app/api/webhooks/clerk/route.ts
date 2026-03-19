import { NextRequest } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { createOrUpdateUser, deleteUser } from '@/lib/user-sync'

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred - no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  type ClerkUserCreatedOrUpdated = {
    id: string
    email_addresses: Array<{ email_address: string }>
    first_name?: string | null
    last_name?: string | null
    image_url?: string | null
  }

  type ClerkEvent =
    | { type: 'user.created' | 'user.updated'; data: ClerkUserCreatedOrUpdated }
    | { type: 'user.deleted'; data: { id: string } }

  let evt: ClerkEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      await createOrUpdateUser({
        id,
        emailAddresses: email_addresses.map((e) => ({ emailAddress: e.email_address })),
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url ?? undefined,
      })
    } catch (err) {
      console.error('Error creating/updating user:', err)
      return new Response('Error creating/updating user', {
        status: 500,
      })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      await deleteUser(id)
    } catch (err) {
      console.error('Error deleting user:', err)
      return new Response('Error deleting user', {
        status: 500,
      })
    }
  }

  return new Response('', { status: 200 })
}
