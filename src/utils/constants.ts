const CARD_WIDTH_PX = 600
const CARD_HEIGHT_PX = 825

export { CARD_WIDTH_PX, CARD_HEIGHT_PX }

export const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
