import { Card } from "./card"

export interface CardResponse {
    data: Card[]
    has_more: boolean
    order: string
    page: number
    page_size: number
    paginated_cards_count: number
    sort: string
    total_cards: number
    total_pages: number
}