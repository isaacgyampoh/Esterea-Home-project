// Paystack webhook — the authoritative record that a payment really happened.
//
// The storefront marks an order Paid from the browser, which is convenient but
// forgeable and lost entirely if the customer closes the tab mid-payment. This
// function is the trustworthy path: Paystack calls it server-side, the
// signature is verified against the secret key, and only then is the order
// marked verified.
//
// Deploy:  supabase functions deploy paystack-webhook --no-verify-jwt
// Secret:  supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx
// Then add the function URL under Paystack Dashboard -> Settings -> API Keys
// & Webhooks -> Webhook URL.
//
// --no-verify-jwt is required: Paystack does not send a Supabase JWT. The
// signature check below is what authenticates the request.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const enc = new TextEncoder()
const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')

async function expectedSignature(rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(PAYSTACK_SECRET),
    { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'],
  )
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(rawBody)))
}

// Constant-time compare so the signature can't be probed byte by byte.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  if (!PAYSTACK_SECRET || !SERVICE_ROLE) {
    console.error('[paystack] missing PAYSTACK_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY')
    return new Response('not configured', { status: 500 })
  }

  // The signature covers the raw bytes — parse only after verifying.
  const raw = await req.text()
  const sig = req.headers.get('x-paystack-signature') ?? ''
  if (!safeEqual(sig, await expectedSignature(raw))) {
    console.error('[paystack] bad signature')
    return new Response('Invalid signature', { status: 401 })
  }

  let evt: Record<string, unknown>
  try { evt = JSON.parse(raw) } catch { return new Response('bad json', { status: 400 }) }

  // 200 on everything we simply don't act on, so Paystack stops retrying.
  if (evt.event !== 'charge.success') return new Response('ignored', { status: 200 })

  const data = (evt.data ?? {}) as Record<string, unknown>
  const reference = String(data.reference ?? '')
  const paidMinor = Number(data.amount ?? 0)       // pesewas
  if (!reference) return new Response('no reference', { status: 200 })

  const db = createClient(SUPABASE_URL, SERVICE_ROLE)

  const { data: order, error } = await db
    .from('whatsapp_orders')
    .select('order_no,total,status')
    .eq('paystack_ref', reference)
    .maybeSingle()

  if (error) {
    console.error('[paystack] lookup failed', reference, error.message)
    return new Response('lookup failed', { status: 500 })   // let Paystack retry
  }
  if (!order) {
    console.error('[paystack] no order for reference', reference)
    return new Response('unknown reference', { status: 200 })
  }

  // Guard against a small charge being used to settle a large order.
  const expectedMinor = Math.round(Number(order.total ?? 0) * 100)
  if (paidMinor < expectedMinor) {
    console.error('[paystack] underpaid', reference, { paidMinor, expectedMinor })
    return new Response('amount mismatch', { status: 200 })
  }

  const { error: updErr } = await db
    .from('whatsapp_orders')
    .update({ status: 'Paid', paid_at: new Date().toISOString(), payment_verified: true })
    .eq('paystack_ref', reference)

  if (updErr) {
    console.error('[paystack] update failed', reference, updErr.message)
    return new Response('update failed', { status: 500 })   // retryable
  }

  console.log('[paystack] verified', order.order_no, reference)
  return new Response('ok', { status: 200 })
})
